// ============================================================
// NEXTHOST PROFILE - JavaScript
// ============================================================

let currentUser = null;
let profileData = null;

// 🎯 ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeAnimations();
    initializeHeader();
});

// 🔐 ПРОВЕРКА АВТОРИЗАЦИИ
function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'auth.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(userStr);
        loadProfileData();
    } catch (e) {
        console.error('User парсинг қатесі:', e);
        window.location.href = 'auth.html';
    }
}

// 📊 ЗАГРУЗКА ДАННЫХ ПРОФИЛЯ ИЗ БД
async function loadProfileData() {
    if (!currentUser?.id) return;
    
    try {
        const response = await fetch(`backend/profile_api.php?id=${currentUser.id}`);
        const result = await response.json();
        
        if (result.success) {
            profileData = result;
            renderProfile(result);
        } else {
            console.error('Профильді жүктеу қатесі:', result.message);
            // Используем локальные данные
            renderProfileFromLocal();
        }
    } catch (err) {
        console.error('Желі қатесі:', err);
        renderProfileFromLocal();
    }
}

// 🎨 ОТРИСОВКА ПРОФИЛЯ
function renderProfile(data) {
    const { user, stats, payment_history } = data;
    
    // Хедер
    setText('userName', user.name);
    setText('heroUserName', user.name);
    
    // Информация о пользователе
    setText('profileName', user.name);
    setText('profileEmail', user.email);
    setText('profilePhone', user.phone || 'Көрсетілмеген');
    setText('profileDate', formatDate(user.date_created));
    setText('avatarInitials', getInitials(user.name));
    
    // Баланс
    setText('userBalance', formatMoney(user.balance));
    
    // Статистика в hero
    setText('activeServicesCount', stats.active_services);
    setText('supportTickets', stats.open_tickets);
    
    // Статистика в карточке
    setText('totalServices', stats.total_payments);
    setText('totalSpent', formatMoney(stats.total_spent));
    setText('daysRegistered', stats.days_registered);
    
    // История платежей
    renderPaymentHistory(payment_history);
    
    // Услуги
    renderServices(payment_history);
}

// 📝 ОТРИСОВКА ИЗ ЛОКАЛЬНЫХ ДАННЫХ
function renderProfileFromLocal() {
    setText('userName', currentUser.name);
    setText('heroUserName', currentUser.name);
    setText('profileName', currentUser.name);
    setText('profileEmail', currentUser.email);
    setText('userBalance', formatMoney(currentUser.balance || 0));
    setText('avatarInitials', getInitials(currentUser.name));
}

// 💳 ОТРИСОВКА ИСТОРИИ ПЛАТЕЖЕЙ
function renderPaymentHistory(payments) {
    const container = document.getElementById('paymentHistoryList');
    if (!container) return;
    
    if (!payments || payments.length === 0) {
        container.innerHTML = `
            <div class="no-history">
                <div class="no-history-icon">📋</div>
                <p>Төлем тарихы жоқ</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = payments.map(p => `
        <div class="history-item">
            <div class="history-info">
                <span class="history-name">${p.tariff_name}</span>
                <span class="history-date">${formatDate(p.created_at)}</span>
            </div>
            <div class="history-amount">
                <span class="amount">${formatMoney(p.amount)}</span>
                <span class="status status-${p.status}">${getStatusText(p.status)}</span>
            </div>
        </div>
    `).join('');
}

// 🚀 ОТРИСОВКА УСЛУГ
function renderServices(payments) {
    const container = document.getElementById('servicesList');
    if (!container) return;
    
    // Фильтруем активные услуги (за последние 30 дней)
    const activePayments = payments?.filter(p => {
        const payDate = new Date(p.created_at);
        const now = new Date();
        const diffDays = (now - payDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 30 && p.status === 'completed';
    }) || [];
    
    if (activePayments.length === 0) {
        container.innerHTML = `
            <div class="no-services">
                <div class="no-services-icon">☁️</div>
                <h4>Сізде белсенді қызметтер жоқ</h4>
                <p>Қолайлы хостинг тарифін таңдаудан бастаңыз</p>
                <a href="hosting.html" class="primary-btn">
                    <span>Хостинг тапсырыс беру</span>
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activePayments.map(p => `
        <div class="service-item">
            <div class="service-icon">🚀</div>
            <div class="service-info">
                <h4>${p.tariff_name}</h4>
                <p>Белсенді • ${formatDate(p.created_at)} дейін</p>
            </div>
            <div class="service-status active">Белсенді</div>
        </div>
    `).join('');
}


// ============================================================
// МОДАЛЬНЫЕ ОКНА И ДЕЙСТВИЯ
// ============================================================

// ✏️ РЕДАКТИРОВАНИЕ ПРОФИЛЯ
function showEditForm() {
    const user = profileData?.user || currentUser;
    
    const modal = document.createElement('div');
    modal.className = 'profile-modal-overlay';
    modal.id = 'editProfileModal';
    modal.innerHTML = `
        <div class="profile-modal">
            <div class="profile-modal-header">
                <h3>✏️ Профильді өңдеу</h3>
                <button class="modal-close" onclick="closeModal('editProfileModal')">&times;</button>
            </div>
            <div class="profile-modal-body">
                <div class="form-group">
                    <label>Аты</label>
                    <input type="text" id="editName" value="${user.name || ''}" placeholder="Атыңыз">
                </div>
                <div class="form-group">
                    <label>Телефон</label>
                    <input type="tel" id="editPhone" value="${user.phone || ''}" placeholder="+7 (777) 123-45-67">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="${user.email || ''}" disabled>
                    <small>Email өзгерту мүмкін емес</small>
                </div>
            </div>
            <div class="profile-modal-footer">
                <button class="btn-secondary" onclick="closeModal('editProfileModal')">Болдырмау</button>
                <button class="btn-primary" onclick="saveProfile()">Сақтау</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

// 💾 СОХРАНЕНИЕ ПРОФИЛЯ
async function saveProfile() {
    const name = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    
    if (!name) {
        alert('Атыңызды енгізіңіз');
        return;
    }
    
    try {
        const response = await fetch('backend/profile_api.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: currentUser.id,
                name,
                phone
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Обновляем локальные данные
            currentUser.name = name;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            closeModal('editProfileModal');
            loadProfileData(); // Перезагружаем данные
            
            showNotification('Профиль сәтті жаңартылды!', 'success');
        } else {
            showNotification(result.message || 'Қате кетті', 'error');
        }
    } catch (err) {
        console.error('Сақтау қатесі:', err);
        showNotification('Сервер қатесі', 'error');
    }
}

// ============================================================
// 💳 СИСТЕМА ПОПОЛНЕНИЯ БАЛАНСА (с SMS верификацией)
// ============================================================

const SMS_API_BASE = "http://localhost:4000";
const MAIL_API_BASE = "http://localhost:5000";

let selectedAmount = 0;
let smsCode = null;
let billingFormData = null;

// Открыть модалку пополнения
function showBilling() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        // Сбрасываем состояние
        selectedAmount = 0;
        smsCode = null;
        billingFormData = null;
        
        document.getElementById('paymentTariffName').textContent = 'Балансты толтыру';
        document.getElementById('paymentTariffPrice').textContent = '₸0';
        
        showPaymentStep(1);
        paymentModal.classList.remove('hidden');
        
        initBillingEvents();
    }
}

// Инициализация событий модалки
function initBillingEvents() {
    // Закрытие
    document.getElementById('paymentCloseBtn')?.addEventListener('click', closeBillingModal);
    document.querySelector('.payment-overlay')?.addEventListener('click', closeBillingModal);
    document.getElementById('paymentDoneBtn')?.addEventListener('click', closeBillingModal);
    
    // Выбор суммы
    document.querySelectorAll('.amount-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            selectBillingAmount(amount);
            
            document.querySelectorAll('.amount-select-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    
    // Ввод своей суммы
    document.getElementById('customAmountInput')?.addEventListener('input', (e) => {
        const amount = parseInt(e.target.value) || 0;
        selectBillingAmount(amount);
        document.querySelectorAll('.amount-select-btn').forEach(b => b.classList.remove('selected'));
    });
    
    // Форматирование карты
    document.getElementById('cardNumber')?.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 16);
        e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
    
    document.getElementById('expDate')?.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
        e.target.value = v;
    });
    
    // Шаг 1 - отправка SMS
    document.getElementById('paymentFormStep1')?.addEventListener('submit', handleStep1Submit);
    
    // Шаг 2 - проверка кода
    document.getElementById('paymentFormStep2')?.addEventListener('submit', handleStep2Submit);
    
    // Повторная отправка кода
    document.getElementById('resendCodeBtn')?.addEventListener('click', resendCode);
}

function selectBillingAmount(amount) {
    selectedAmount = amount;
    document.getElementById('paymentTariffPrice').textContent = amount.toLocaleString() + ' ₸';
}

function closeBillingModal() {
    const paymentModal = document.getElementById('paymentModal');
    if (paymentModal) {
        paymentModal.classList.add('hidden');
        
        // Сброс форм
        document.getElementById('paymentFormStep1')?.reset();
        document.getElementById('paymentFormStep2')?.reset();
        selectedAmount = 0;
        smsCode = null;
        billingFormData = null;
    }
}

function showPaymentStep(step) {
    const steps = [
        document.getElementById('paymentFormStep1'),
        document.getElementById('paymentFormStep2'),
        document.getElementById('paymentResult')
    ];
    
    steps.forEach((el, index) => {
        if (el) el.classList.toggle('active', index === step - 1);
    });
}

// Шаг 1: Отправка SMS кода
async function handleStep1Submit(e) {
    e.preventDefault();
    
    const amount = selectedAmount || parseInt(document.getElementById('customAmountInput')?.value) || 0;
    const phone = document.getElementById('phone')?.value;
    
    if (amount < 100) {
        alert('Кемінде 100 ₸ енгізіңіз');
        return;
    }
    
    if (!phone) {
        alert('Телефон нөмірін енгізіңіз');
        return;
    }
    
    try {
        const res = await fetch(`${SMS_API_BASE}/api/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        
        const data = await res.json();
        
        if (!data.success) {
            alert('SMS жіберу қатесі: ' + (data.message || 'Белгісіз қате'));
            return;
        }
        
        smsCode = data.code;
        billingFormData = { amount, phone };
        
        console.log('DEBUG SMS CODE:', smsCode);
        
        showPaymentStep(2);
    } catch (err) {
        console.error(err);
        alert('Сервермен байланыс қатесі');
    }
}

// Шаг 2: Проверка кода и пополнение
async function handleStep2Submit(e) {
    e.preventDefault();
    
    const userCode = document.getElementById('confirmCode')?.value.trim();
    
    if (!userCode) {
        alert('Кодты енгізіңіз');
        return;
    }
    
    if (userCode !== String(smsCode)) {
        alert('Код дұрыс емес');
        return;
    }
    
    // Сохраняем платёж в БД
    try {
        const res = await fetch(`${MAIL_API_BASE}/api/send-receipt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: currentUser.email,
                phone: billingFormData.phone,
                tariffId: 0,
                tariffName: 'Баланс толтыру',
                tariffPrice: billingFormData.amount + ' ₸',
                payCode: String(smsCode)
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            // Обновляем баланс локально
            currentUser.balance = (currentUser.balance || 0) + billingFormData.amount;
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            document.getElementById('paymentResultTitle').textContent = 'Төлем сәтті аяқталды!';
            document.getElementById('paymentResultText').textContent = 
                `Балансыңыз ${billingFormData.amount.toLocaleString()} ₸ толтырылды.`;
            
            showPaymentStep(3);
            
            // Перезагружаем данные профиля
            setTimeout(() => loadProfileData(), 1000);
        } else {
            alert('Қате: ' + (data.message || 'Белгісіз қате'));
        }
    } catch (err) {
        console.error(err);
        alert('Сервер қатесі');
    }
}

// Повторная отправка кода
async function resendCode() {
    if (!billingFormData?.phone) {
        alert('Телефон нөмірі жоқ');
        return;
    }
    
    try {
        const res = await fetch(`${SMS_API_BASE}/api/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: billingFormData.phone })
        });
        
        const data = await res.json();
        
        if (data.success) {
            smsCode = data.code;
            alert('Код қайтадан жіберілді');
        } else {
            alert('Қате: ' + (data.message || ''));
        }
    } catch (err) {
        alert('Сервермен байланыс қатесі');
    }
}

// ⚙️ НАСТРОЙКИ
function showSettings() {
    const modal = document.createElement('div');
    modal.className = 'profile-modal-overlay';
    modal.id = 'settingsModal';
    modal.innerHTML = `
        <div class="profile-modal">
            <div class="profile-modal-header">
                <h3>⚙️ Баптаулар</h3>
                <button class="modal-close" onclick="closeModal('settingsModal')">&times;</button>
            </div>
            <div class="profile-modal-body">
                <div class="settings-item">
                    <span>Email хабарламалары</span>
                    <label class="toggle-switch">
                        <input type="checkbox" checked>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-item">
                    <span>SMS хабарламалары</span>
                    <label class="toggle-switch">
                        <input type="checkbox">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-item">
                    <span>Екі факторлы аутентификация</span>
                    <label class="toggle-switch">
                        <input type="checkbox">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <hr>
                <button class="btn-danger" onclick="confirmDeleteAccount()">
                    🗑️ Аккаунтты жою
                </button>
            </div>
            <div class="profile-modal-footer">
                <button class="btn-primary" onclick="closeModal('settingsModal')">Жабу</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

function confirmDeleteAccount() {
    if (confirm('Аккаунтты жою керек пе? Бұл әрекетті қайтару мүмкін емес!')) {
        showNotification('Аккаунт жою функциясы әзірленуде', 'info');
    }
}

// 📚 ДОКУМЕНТАЦИЯ
function showDocs() {
    window.open('https://docs.nexthost.kz', '_blank');
}

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('kk-KZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatMoney(amount) {
    return (parseFloat(amount) || 0).toLocaleString() + ' ₸';
}

function getStatusText(status) {
    const statuses = {
        'completed': 'Сәтті',
        'pending': 'Күтуде',
        'failed': 'Қате'
    };
    return statuses[status] || status;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 🚪 ВЫХОД
function logout() {
    if (confirm('Шығу керек пе?')) {
        localStorage.removeItem('user');
        window.location.href = 'auth.html';
    }
}

// 🎪 АНИМАЦИИ
function initializeAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.profile-card, .profile-stat, .action-btn').forEach(el => {
        observer.observe(el);
    });
}

// 🌟 ХЕДЕР
function initializeHeader() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 100);
    });
}
