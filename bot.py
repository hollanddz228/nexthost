import os
import logging
import requests
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler, ContextTypes
)

logging.basicConfig(level=logging.INFO)

# ─── CONFIG ───────────────────────────────────────────────────────────────────
BOT_TOKEN   = os.environ["BOT_TOKEN"]
ADMIN_ID    = int(os.environ["ADMIN_CHAT_ID"])
PROMETHEUS  = os.environ.get("PROMETHEUS_URL", "http://host.docker.internal:9090")
DOCKER_HOST = os.environ.get("DOCKER_HOST", "http://host.docker.internal:2375")

CONTAINERS = [
    "nexthost_db",
    "nexthost_web",
    "prometheus",
    "grafana",
    "jenkins_server",
    "n8n_server",
    "node_exporter_server",
]

# ─── DOCKER API ───────────────────────────────────────────────────────────────

def get_container_status(name: str) -> str:
    try:
        r = requests.get(f"{DOCKER_HOST}/containers/{name}/json", timeout=10)
        if r.status_code == 404:
            return "not found"
        data = r.json()
        return data.get("State", {}).get("Status", "unknown")
    except Exception as e:
        return f"err: {e}"

def get_container_logs(name: str, tail: int = 30) -> str:
    try:
        r = requests.get(
            f"{DOCKER_HOST}/containers/{name}/logs",
            params={"stdout": 1, "stderr": 1, "tail": tail},
            timeout=10
        )
        raw = r.content
        lines = []
        i = 0
        while i < len(raw):
            if i + 8 > len(raw):
                break
            size = int.from_bytes(raw[i+4:i+8], "big")
            lines.append(raw[i+8:i+8+size].decode("utf-8", errors="replace"))
            i += 8 + size
        return "".join(lines).strip() or "(нет логов)"
    except Exception as e:
        return f"❌ {e}"

def restart_container(name: str) -> str:
    try:
        r = requests.post(f"{DOCKER_HOST}/containers/{name}/restart", timeout=15)
        return "✅ Перезапущен" if r.status_code == 204 else f"❌ Код: {r.status_code}"
    except Exception as e:
        return f"❌ {e}"

# ─── PROMETHEUS ───────────────────────────────────────────────────────────────

def prom_query(query: str) -> str:
    try:
        r = requests.get(
            f"{PROMETHEUS}/api/v1/query",
            params={"query": query}, timeout=5
        )
        results = r.json().get("data", {}).get("result", [])
        if not results:
            return "нет данных"
        return results[0]["value"][1]
    except Exception as e:
        return f"err({e})"

# ─── KEYBOARDS ────────────────────────────────────────────────────────────────

def main_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🐳 Статус контейнеров", callback_data="status")],
        [InlineKeyboardButton("📊 Метрики CPU / RAM",  callback_data="metrics")],
        [InlineKeyboardButton("🔁 Перезапустить ...",  callback_data="restart_menu")],
        [InlineKeyboardButton("📋 Логи контейнера",    callback_data="logs_menu")],
        [InlineKeyboardButton("🌐 Сервисы (ссылки)",   callback_data="links")],
    ])

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def is_admin(update: Update) -> bool:
    uid = update.effective_user.id if update.effective_user else None
    return uid == ADMIN_ID

# ─── COMMANDS ─────────────────────────────────────────────────────────────────

async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update):
        await update.message.reply_text("⛔ Нет доступа.")
        return
    await update.message.reply_text(
        "👋 *Nexthost Admin Bot*\n\nВыбери действие:",
        parse_mode="Markdown",
        reply_markup=main_keyboard()
    )

async def cmd_menu(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if not is_admin(update):
        return
    await update.message.reply_text(
        "📋 *Главное меню*",
        parse_mode="Markdown",
        reply_markup=main_keyboard()
    )

# ─── CALLBACKS ────────────────────────────────────────────────────────────────

async def on_callback(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    print(f"DEBUG callback: {data}", flush=True)

    if not is_admin(update):
        await query.edit_message_text("⛔ Нет доступа.")
        return

    if data == "status":
        lines = []
        for name in CONTAINERS:
            status = get_container_status(name)
            if status == "running":
                icon = "🟢"
            elif status in ("exited", "dead", "not found"):
                icon = "🔴"
            elif status.startswith("err"):
                icon = "⚠️"
            else:
                icon = "🟡"
            lines.append(f"{icon} `{name}` — {status}")

        kb = InlineKeyboardMarkup([[
            InlineKeyboardButton("🔄 Обновить", callback_data="status"),
            InlineKeyboardButton("◀️ Назад",    callback_data="back"),
        ]])
        await query.edit_message_text(
            "🐳 *Статус контейнеров*\n\n" + "\n".join(lines),
            parse_mode="Markdown", reply_markup=kb
        )

    elif data == "metrics":
        cpu_raw    = prom_query('100 - (avg by(instance)(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)')
        ram_used   = prom_query('node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes')
        ram_total  = prom_query("node_memory_MemTotal_bytes")
        disk_used  = prom_query('node_filesystem_size_bytes{mountpoint="/"} - node_filesystem_avail_bytes{mountpoint="/"}')
        disk_total = prom_query('node_filesystem_size_bytes{mountpoint="/"}')

        def fmt_bytes(val):
            try:
                return f"{float(val) / 1024**3:.1f} GB"
            except Exception:
                return val

        def fmt_pct(val):
            try:
                return f"{float(val):.1f}%"
            except Exception:
                return val

        kb = InlineKeyboardMarkup([[
            InlineKeyboardButton("🔄 Обновить", callback_data="metrics"),
            InlineKeyboardButton("◀️ Назад",    callback_data="back"),
        ]])
        await query.edit_message_text(
            "📊 *Метрики сервера*\n\n"
            f"🖥 CPU:  `{fmt_pct(cpu_raw)}`\n"
            f"🧠 RAM:  `{fmt_bytes(ram_used)} / {fmt_bytes(ram_total)}`\n"
            f"💾 Диск: `{fmt_bytes(disk_used)} / {fmt_bytes(disk_total)}`\n",
            parse_mode="Markdown", reply_markup=kb
        )

    elif data == "restart_menu":
        buttons = [[InlineKeyboardButton(f"🔁 {c}", callback_data=f"restart:{c}")] for c in CONTAINERS]
        buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="back")])
        await query.edit_message_text(
            "🔁 *Выбери контейнер для перезапуска:*",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup(buttons)
        )

    elif data.startswith("restart:"):
        container = data.split(":", 1)[1]
        await query.edit_message_text(f"⏳ Перезапускаю `{container}`...", parse_mode="Markdown")
        result = restart_container(container)
        await query.edit_message_text(
            f"{result} `{container}`",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("◀️ В меню", callback_data="back")]])
        )

    elif data == "logs_menu":
        buttons = [[InlineKeyboardButton(f"📋 {c}", callback_data=f"logs:{c}")] for c in CONTAINERS]
        buttons.append([InlineKeyboardButton("◀️ Назад", callback_data="back")])
        await query.edit_message_text(
            "📋 *Выбери контейнер для просмотра логов:*",
            parse_mode="Markdown",
            reply_markup=InlineKeyboardMarkup(buttons)
        )

    elif data.startswith("logs:"):
        container = data.split(":", 1)[1]
        out = get_container_logs(container, tail=30)
        if len(out) > 3500:
            out = "...(обрезано)\n" + out[-3400:]
        kb = InlineKeyboardMarkup([[
            InlineKeyboardButton("🔄 Обновить", callback_data=f"logs:{container}"),
            InlineKeyboardButton("◀️ Назад",    callback_data="logs_menu"),
        ]])
        await query.edit_message_text(
            f"📋 *Логи* `{container}` (последние 30 строк)\n\n```\n{out}\n```",
            parse_mode="Markdown", reply_markup=kb
        )

    elif data == "links":
        kb = InlineKeyboardMarkup([[InlineKeyboardButton("◀️ Назад", callback_data="back")]])
        await query.edit_message_text(
            "🌐 *Сервисы*\n\n"
            "📈 [Grafana](http://localhost:3000)\n"
            "🔥 [Prometheus](http://localhost:9090)\n"
            "🔧 [Jenkins](http://localhost:8080)\n"
            "⚙️ [n8n](http://localhost:5678)\n"
            "🌍 [Сайт](http://localhost:80)\n",
            parse_mode="Markdown", reply_markup=kb,
            disable_web_page_preview=True
        )

    elif data == "back":
        await query.edit_message_text(
            "📋 *Главное меню*",
            parse_mode="Markdown",
            reply_markup=main_keyboard()
        )

# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("menu",  cmd_menu))
    app.add_handler(CallbackQueryHandler(on_callback))
    print("🤖 Bot started", flush=True)
    app.run_polling(
        drop_pending_updates=True,
        allowed_updates=["message", "callback_query"]
    )

if __name__ == "__main__":
    main()