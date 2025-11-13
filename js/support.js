/* support.js — логика страницы поддержки */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ticket-form');
  const feedback = document.getElementById('ticket-feedback');
  const ticketsList = document.getElementById('tickets-list');
  const noTickets = document.getElementById('no-tickets');
  const openChatBtn = document.getElementById('open-chat');

  // === Отправка тикета ===
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.textContent = '⏳ Отправка...';
    feedback.style.color = '#ccc';

    const fd = new FormData(form);

    try {
      const res = await fetch('backend/create_ticket.php', {
        method: 'POST',
        body: fd
      });

      const data = await res.json();

      if (data.success) {
        feedback.style.color = '#bfffe6';
        feedback.textContent = `✅ Тикет создан (ID: ${data.id}). Мы скоро свяжемся с вами!`;
        form.reset();
        loadTickets();
      } else {
        feedback.style.color = '#ffb3b3';
        feedback.textContent = '⚠️ Ошибка: ' + (data.message || 'Не удалось создать тикет.');
      }
    } catch (err) {
      console.error(err);
      feedback.style.color = '#ffb3b3';
      feedback.textContent = '❌ Ошибка соединения с сервером.';
    }
  });

  // === Загрузка тикетов из базы ===
  async function loadTickets() {
    try {
      const res = await fetch('backend/get_tickets.php');
      const data = await res.json();

      ticketsList.innerHTML = '';

      if (!data.success || !data.tickets || !data.tickets.length) {
        noTickets.style.display = 'block';
        return;
      }

      noTickets.style.display = 'none';
      data.tickets.forEach(t => {
        const div = document.createElement('div');
        div.className = 'ticket-item';
        div.innerHTML = `
          <div>
            <div class="subject">${escapeHtml(t.subject || '(Без темы)')}</div>
            <div class="meta">${escapeHtml(t.name)} • ${escapeHtml(t.email)}</div>
            <div class="meta">📅 ${new Date(t.created_at).toLocaleString()}</div>
            <div class="meta">🟢 Статус: <strong>${escapeHtml(t.status || 'новый')}</strong></div>
            ${t.screenshot_path ? `<div class="meta">📎 <a href="/nexthost/backend/${escapeHtml(t.screenshot_path)}" target="_blank">Скриншот</a></div>` : ''}
            <div class="meta">💬 ${escapeHtml(t.message.slice(0, 150))}${t.message.length > 150 ? '...' : ''}</div>
          </div>
        `;
        ticketsList.appendChild(div);
      });
    } catch (err) {
      console.error(err);
      ticketsList.innerHTML = '<p class="error">Ошибка загрузки тикетов.</p>';
    }
  }

  // === Защита от XSS ===
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  // === Сброс формы ===
  document.getElementById('btn-reset').addEventListener('click', () => {
    form.reset();
    feedback.textContent = '';
  });

  // === Открытие чата Tawk.to ===
  openChatBtn.addEventListener('click', () => {
    if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
      window.Tawk_API.toggle();
    } else {
      alert('Чат не подключен. Проверь код Tawk.to в support.html');
    }
  });

  // === FAQ аккордеон ===
  document.querySelectorAll('.accordion .accordion-item').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const a = btn.querySelector('.a');
      if (a) a.style.display = btn.classList.contains('active') ? 'block' : 'none';
      const toggle = btn.querySelector('.toggle');
      if (toggle) toggle.textContent = btn.classList.contains('active') ? '−' : '+';
    });
  });

  // === Обновление статуса времени ===
  function updateStatus() {
    const now = new Date();
    document.getElementById('status-updated').textContent = now.toLocaleTimeString();
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  // === Загружаем тикеты при входе ===
  loadTickets();
});
