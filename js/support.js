/* support.js — қолдау бетінің логикасы */

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

  // === Tawk.to чатын ашу ===
  openChatBtn.addEventListener('click', () => {
    if (window.Tawk_API && typeof window.Tawk_API.toggle === 'function') {
      window.Tawk_API.toggle();
    } else {
      alert('Чат қосылмаған. support.html ішіндегі Tawk.to кодын тексеріңіз');
    }
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
