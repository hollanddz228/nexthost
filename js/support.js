/* support.js — қолдау бетінің логикасы */
// ТВОЙ NGROK WEBHOOK ИЗ N8N
const N8N_WEBHOOK_URL = 'https://monetize-gorged-repugnant.ngrok-free.dev/webhook/nexthost-chat';

// 1. КЛИЕНТКЕ ЖЕКЕ НОМЕР (SESSION ID) БЕРУ
let sessionId = localStorage.getItem('chat_session_id');
if (!sessionId) {
  sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('chat_session_id', sessionId);
}

let isOperatorMode = false; // Оператор режимі қосылғанын білу үшін
let pollingInterval = null;

// === ЛОГИКА ИИ ЧАТА ===
function toggleChat() {
  const chat = document.getElementById('chat-widget');
  chat.style.display = chat.style.display === 'none' ? 'flex' : 'none';
}

function appendMessage(text, sender) {
  const chatBox = document.getElementById('chat-box');
  const msgDiv = document.createElement('div');
  msgDiv.className = sender + '-msg';
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, 'user');
  input.value = '';

  try {
      const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              // Оператор режимінде болса n8n-ге басқа тип жібереміз
              type: isOperatorMode ? 'operator_chat' : 'chat', 
              text: message,
              session_id: sessionId // Кім жазып жатқанын ТГ-бот білуі үшін
          })
      });
      const data = await response.json();
      if (data.reply) {
          appendMessage(data.reply, 'bot');
      }
  } catch (error) {
      appendMessage('Ошибка соединения с сервером.', 'bot');
      console.error(error);
  }
}

async function callOperator() {
  appendMessage('Вызываю живого оператора...', 'user');
  
  try {
      const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              type: 'call_operator', 
              text: '🚨 Клиент запрашивает связь с оператором!',
              session_id: sessionId // Сессияны бірге жібереміз
          })
      });
      const data = await response.json();
      appendMessage(data.reply || '✅ Операторға хабарланды. Күте тұрыңыз...', 'bot');
      
      // ОПЕРАТОР РЕЖИМІН ҚОСУ
      startOperatorMode();

  } catch (error) {
      appendMessage('Ошибка вызова оператора.', 'bot');
      console.error(error);
  }
}

// 2. POLLING: ӘР 3 СЕКУНД САЙЫН ЖАҢА ХАБАРЛАМАНЫ ТЕКСЕРУ
function startOperatorMode() {
  if (isOperatorMode) return;
  isOperatorMode = true;
  appendMessage('🔄 Оператор чатқа қосылуда...', 'bot');
  
  pollingInterval = setInterval(async () => {
      try {
          const res = await fetch(`backend/chat_api.php?action=get_new&session_id=${sessionId}`);
          const data = await res.json();
          if (data.success && data.messages.length > 0) {
              data.messages.forEach(msg => {
                  appendMessage('👨‍💻 Оператор: ' + msg.message, 'bot');
              });
          }
      } catch (err) {
          console.error("Polling қатесі:", err);
      }
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ticket-form');
  const feedback = document.getElementById('ticket-feedback');
  const ticketsList = document.getElementById('tickets-list');
  const noTickets = document.getElementById('no-tickets');
  const openChatBtn = document.getElementById('open-chat');

  // === Тикет жіберу ===
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.textContent = '⏳ Жіберілуде...';
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
        feedback.textContent = `✅ Тикет жасалды (ID: ${data.id}). Жақын арада сізбен хабарласамыз!`;
        form.reset();
        loadTickets();
      } else {
        feedback.style.color = '#ffb3b3';
        feedback.textContent = '⚠️ Қате: ' + (data.message || 'Тикет жасау мүмкін болмады.');
      }
    } catch (err) {
      console.error(err);
      feedback.style.color = '#ffb3b3';
      feedback.textContent = '❌ Сервермен байланыс қатесі.';
    }
  });

  // === Базадан тикеттерді жүктеу ===
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
            <div class="subject">${escapeHtml(t.subject || '(Тақырыпсыз)')}</div>
            <div class="meta">${escapeHtml(t.name)} • ${escapeHtml(t.email)}</div>
            <div class="meta">📅 ${new Date(t.created_at).toLocaleString()}</div>
            <div class="meta">🟢 Күйі: <strong>${escapeHtml(t.status || 'жаңа')}</strong></div>
            ${t.screenshot_path ? `<div class="meta">📎 <a href="/nexthost/backend/${escapeHtml(t.screenshot_path)}" target="_blank">Скриншот</a></div>` : ''}
            <div class="meta">💬 ${escapeHtml(t.message.slice(0, 150))}${t.message.length > 150 ? '...' : ''}</div>
          </div>
        `;
        ticketsList.appendChild(div);
      });
    } catch (err) {
      console.error(err);
      ticketsList.innerHTML = '<p class="error">Тикеттерді жүктеу қатесі.</p>';
    }
  }

  // === XSS-тен қорғау ===
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  // === Форманы тазарту ===
  document.getElementById('btn-reset').addEventListener('click', () => {
    form.reset();
    feedback.textContent = '';
  });

  

  // === FAQ аккордеоны ===
  document.querySelectorAll('.accordion .accordion-item').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const a = btn.querySelector('.a');
      if (a) a.style.display = btn.classList.contains('active') ? 'block' : 'none';
      const toggle = btn.querySelector('.toggle');
      if (toggle) toggle.textContent = btn.classList.contains('active') ? '−' : '+';
    });
  });

  // === Уақыт күйін жаңарту ===
  function updateStatus() {
    const now = new Date();
    document.getElementById('status-updated').textContent = now.toLocaleTimeString();
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  // === Кіргенде тикеттерді жүктейміз ===
  loadTickets();
});
