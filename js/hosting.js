/* ============================================================
   Анимация карточек (как было)
============================================================ */
const plans = document.querySelectorAll(".plan-card, .reason");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.2 }
);

plans.forEach((plan) => observer.observe(plan));

const style = document.createElement("style");
style.textContent = `
.visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
.plan-card, .reason {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}`;
document.head.appendChild(style);

/* ============================================================
   Элементы модалки
============================================================ */
const paymentModal = document.getElementById("paymentModal");
const paymentCloseBtn = document.getElementById("paymentCloseBtn");
const paymentTariffName = document.getElementById("paymentTariffName");
const paymentTariffPrice = document.getElementById("paymentTariffPrice");

const step1Form = document.getElementById("paymentFormStep1");
const step2Form = document.getElementById("paymentFormStep2");
const resultStep = document.getElementById("paymentResult");

const confirmCodeInput = document.getElementById("confirmCode");
const resendCodeBtn = document.getElementById("resendCodeBtn");
const paymentDoneBtn = document.getElementById("paymentDoneBtn");

const sendReceiptCheckbox = document.getElementById("sendReceiptCheckbox");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");

/* API базовые URL */
const SMS_API_BASE = "http://localhost:4000";
const MAIL_API_BASE = "http://localhost:5000";

let selectedTariff = null;      // { name, price, id }
let smsCode = null;             // код из СМС
let lastFormData = null;        // { email, phone, sendReceipt }

/* ============================================================
   Помощники
============================================================ */
function showPaymentStep(step) {
  [step1Form, step2Form, resultStep].forEach((el, index) => {
    if (!el) return;
    el.classList.toggle("active", index === step - 1);
  });
}

function openPaymentModal(id, name, price) {
  selectedTariff = { id, name, price };

  paymentTariffName.textContent = `«${name}» тарифін төлеу`;
  paymentTariffPrice.textContent = price;

  showPaymentStep(1);
  paymentModal.classList.remove("hidden");
}

function closePaymentModal() {
  paymentModal.classList.add("hidden");
  step1Form?.reset();
  step2Form?.reset();
  confirmCodeInput.value = "";
  smsCode = null;
  lastFormData = null;
  selectedTariff = null;
}

paymentCloseBtn?.addEventListener("click", closePaymentModal);
paymentDoneBtn?.addEventListener("click", closePaymentModal);

paymentModal?.addEventListener("click", (e) => {
  if (e.target.classList.contains("payment-overlay")) {
    closePaymentModal();
  }
});

/* ============================================================
   Привязка кнопок "Выбрать"
============================================================ */
document.querySelectorAll(".plan-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".plan-card");
    if (!card) return;

    const title = card.querySelector("h2")?.textContent.trim() || "";
    const price = card.querySelector(".price")?.textContent.trim() || "";
    const id = btn.dataset.tariffId || "";

    openPaymentModal(id, title, price);
  });
});

/* ============================================================
   Форматирование номера карты / даты (как было)
============================================================ */
document.getElementById("cardNumber")?.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 16);
  e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
});

document.getElementById("expDate")?.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "").slice(0, 4);
  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
  e.target.value = v;
});

/* ============================================================
   ШАГ 1: отправка СМС через sms-backend
============================================================ */
step1Form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedTariff) {
    alert("Тариф таңдалмады.");
    return;
  }

  const fd = new FormData(step1Form);

  const cardNumber = fd.get("card_number") || fd.get("cardNumber");
  const expDate = fd.get("exp_date") || fd.get("expDate");
  const cvv = fd.get("cvv");
  const email = fd.get("email");
  const phone = fd.get("phone");
  const sendReceipt = !!sendReceiptCheckbox?.checked;

  if (!cardNumber || !expDate || !cvv || !phone) {
    alert("Барлық өрістерді толтырыңыз.");
    return;
  }

  if (sendReceipt && !email) {
    alert("Квитанция алу үшін email енгізіңіз.");
    return;
  }

  try {
    const res = await fetch(`${SMS_API_BASE}/api/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });

    const data = await res.json();

    if (!data.success) {
      alert("SMS жіберу қатесі: " + (data.message || "Белгісіз қате"));
      return;
    }

    smsCode = data.code;
    lastFormData = { email, phone, sendReceipt };

    console.log("DEBUG SMS CODE:", smsCode);

    showPaymentStep(2);
  } catch (err) {
    console.error(err);
    alert("Сервермен байланыс қатесі (СМС).");
  }
});

/* ============================================================
   ШАГ 2: проверка кода + отправка квитанции (если нужно)
============================================================ */
step2Form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!smsCode || !lastFormData) {
    alert("Код қайтадан жіберіліп, қайта көріңіз.");
    return;
  }

  const userCode = confirmCodeInput.value.trim();

  if (!userCode) {
    alert("Кодты енгізіңіз.");
    return;
  }

  if (userCode !== String(smsCode)) {
    alert("Код дұрыс емес.");
    return;
  }

  // Если чек не нужен — просто показываем успех
  if (!lastFormData.sendReceipt || !lastFormData.email) {
    document.getElementById("paymentResultTitle").textContent =
      "Төлем сәтті аяқталды";
    document.getElementById("paymentResultText").textContent =
      "Төлем сәтті расталды.";
    showPaymentStep(3);
    return;
  }

  // Отправляем квитанцию на email
  try {
    const res = await fetch(`${MAIL_API_BASE}/api/send-receipt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: lastFormData.email,
        phone: lastFormData.phone,
        tariffId: selectedTariff?.id || 0,
        tariffName: selectedTariff?.name || "",
        tariffPrice: selectedTariff?.price || "",
        payCode: String(smsCode)
      })
    });

    const data = await res.json();

    if (!data.success) {
      alert("Квитанция жіберу қатесі: " + (data.message || ""));
      return;
    }

    document.getElementById("paymentResultTitle").textContent =
      "Төлем сәтті аяқталды";
    document.getElementById("paymentResultText").textContent =
      "Квитанция email поштанызға жіберілді.";

    showPaymentStep(3);
  } catch (err) {
    console.error(err);
    alert("Сервер қатесі (email).");
  }
});

/* ============================================================
   Повторная отправка кода
============================================================ */
resendCodeBtn?.addEventListener("click", async () => {
  if (!lastFormData?.phone) {
    alert("Алдымен телефон нөмірін енгізіңіз.");
    return;
  }

  try {
    const res = await fetch(`${SMS_API_BASE}/api/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: lastFormData.phone })
    });

    const data = await res.json();

    if (!data.success) {
      alert("Кодты қайта жіберу қатесі: " + (data.message || ""));
      return;
    }

    smsCode = data.code;
    alert("Код қайтадан жіберілді.");
  } catch {
    alert("Сервермен байланыс қатесі.");
  }
});
