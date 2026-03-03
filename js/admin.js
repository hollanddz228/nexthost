// ============================================================
// NEXTHOST ADMIN PANEL - JavaScript
// ============================================================

const API_BASE = "backend/admin";
const MAIL_API = "http://localhost:5000";

// Авторизация тексеру
function checkAuth() {
    const token = localStorage.getItem("adminToken");
    const loginTime = localStorage.getItem("adminLogin");
    
    if (!token || !loginTime) {
        window.location.href = "auth.html";
        return false;
    }
    
    // 24 сағаттан кейін мерзімі аяқталады
    const elapsed = Date.now() - parseInt(loginTime);
    if (elapsed > 24 * 60 * 60 * 1000) {
        logout();
        return false;
    }
    
    return true;
}

// Шығу
function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminLogin");
    window.location.href = "auth.html";
}

// API сұраныс
async function apiRequest(endpoint, method = "GET", data = null) {
    const token = localStorage.getItem("adminToken");
    
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}/${endpoint}`, options);
    return response.json();
}

// Уақытты көрсету
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleString("kk-KZ", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
    document.getElementById("adminTime").textContent = timeStr;
}

// Навигация
function initNavigation() {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".content-section");
    const pageTitle = document.getElementById("pageTitle");
    
    const titles = {
        dashboard: "Басты бет",
        users: "Пайдаланушылар",
        payments: "Төлемдер",
        tickets: "Тикеттер",
        tariffs: "Тарифтер",
        reviews: "Пікірлер"
    };
    
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            
            // Белсенді сілтемені жаңарту
            navLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            
            // Бөлімді көрсету
            sections.forEach(s => s.classList.remove("active"));
            document.getElementById(`section-${section}`).classList.add("active");
            
            // Тақырыпты жаңарту
            pageTitle.textContent = titles[section] || section;
            
            // Деректерді жүктеу
            loadSectionData(section);
        });
    });
}

// Бөлім деректерін жүктеу
function loadSectionData(section) {
    switch(section) {
        case "dashboard":
            loadDashboard();
            break;
        case "users":
            loadUsers();
            break;
        case "payments":
            loadPayments();
            break;
        case "tickets":
            loadTickets();
            break;
        case "tariffs":
            loadTariffs();
            break;
        case "reviews":
            loadReviews();
            break;
    }
}

// Dashboard жүктеу
async function loadDashboard() {
    try {
        const stats = await apiRequest("stats.php");
        
        if (stats.success) {
            document.getElementById("statUsers").textContent = stats.users || 0;
            document.getElementById("statPayments").textContent = stats.payments || 0;
            document.getElementById("statTickets").textContent = stats.tickets || 0;
            document.getElementById("statRevenue").textContent = (stats.revenue || 0).toLocaleString() + " ₸";
        }
        
        // Соңғы төлемдер
        const payments = await apiRequest("payments.php?limit=5");
        renderRecentPayments(payments.data || []);
        
    } catch (err) {
        console.error("Dashboard error:", err);
    }
}

// Соңғы төлемдерді көрсету
function renderRecentPayments(payments) {
    const tbody = document.getElementById("recentPayments");
    
    if (!payments.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">Төлемдер жоқ</td></tr>';
        return;
    }
    
    tbody.innerHTML = payments.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td>${p.email}</td>
            <td>${p.tariff_name}</td>
            <td>${parseFloat(p.amount).toLocaleString()} ₸</td>
            <td>${formatDate(p.created_at)}</td>
            <td><span class="status-badge ${p.status}">${p.status}</span></td>
        </tr>
    `).join("");
}


// Пайдаланушыларды жүктеу
async function loadUsers() {
    try {
        const result = await apiRequest("users.php");
        renderUsers(result.data || []);
    } catch (err) {
        console.error("Users error:", err);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById("usersTable");
    
    if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">Пайдаланушылар жоқ</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>#${u.id}</td>
            <td>${u.name || '-'}</td>
            <td>${u.email}</td>
            <td>${u.phone || '-'}</td>
            <td>${formatDate(u.date_created)}</td>
            <td>
                <button class="action-btn view" onclick="viewUser(${u.id})"><i class="fas fa-eye"></i></button>
                <button class="action-btn delete" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join("");
}

// Төлемдерді жүктеу
async function loadPayments() {
    try {
        const result = await apiRequest("payments.php");
        renderPayments(result.data || []);
    } catch (err) {
        console.error("Payments error:", err);
    }
}

function renderPayments(payments) {
    const tbody = document.getElementById("paymentsTable");
    
    if (!payments.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#666;">Төлемдер жоқ</td></tr>';
        return;
    }
    
    tbody.innerHTML = payments.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td>${p.email}</td>
            <td>${p.phone || '-'}</td>
            <td>${p.tariff_name}</td>
            <td>${parseFloat(p.amount).toLocaleString()} ₸</td>
            <td>${p.pay_code || '-'}</td>
            <td>${formatDate(p.created_at)}</td>
            <td>
                <button class="action-btn view" onclick="viewPayment(${p.id})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="resendReceipt(${p.id})"><i class="fas fa-envelope"></i></button>
            </td>
        </tr>
    `).join("");
}

// Тикеттерді жүктеу
async function loadTickets() {
    try {
        const result = await apiRequest("tickets.php");
        renderTickets(result.data || []);
    } catch (err) {
        console.error("Tickets error:", err);
    }
}

function renderTickets(tickets) {
    const tbody = document.getElementById("ticketsTable");
    
    if (!tickets.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#666;">Тикеттер жоқ</td></tr>';
        return;
    }
    
    tbody.innerHTML = tickets.map(t => `
        <tr>
            <td>#${t.id}</td>
            <td>${t.name || '-'}</td>
            <td>${t.email || '-'}</td>
            <td>${(t.subject || t.message || '').substring(0, 40)}...</td>
            <td><span class="status-badge ${t.status || 'new'}">${t.status || 'жаңа'}</span></td>
            <td>${t.created_at ? formatDate(t.created_at) : '-'}</td>
            <td>
                <button class="action-btn view" onclick="viewTicket(${t.id})"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit" onclick="replyTicket(${t.id})"><i class="fas fa-reply"></i></button>
            </td>
        </tr>
    `).join("");
}

// Тарифтерді жүктеу
async function loadTariffs() {
    try {
        const result = await apiRequest("tariffs.php");
        renderTariffs(result.data || []);
    } catch (err) {
        console.error("Tariffs error:", err);
    }
}

function renderTariffs(tariffs) {
    const tbody = document.getElementById("tariffsTable");
    
    if (!tariffs.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">Тарифтер жоқ</td></tr>';
        return;
    }
    
    tbody.innerHTML = tariffs.map(t => `
        <tr>
            <td>#${t.id}</td>
            <td>${t.name}</td>
            <td>${parseFloat(t.price).toLocaleString()} ₸</td>
            <td>${t.description || '-'}</td>
            <td><span class="status-badge ${t.active ? 'completed' : 'pending'}">${t.active ? 'Белсенді' : 'Өшірулі'}</span></td>
            <td>
                <button class="action-btn edit" onclick="editTariff(${t.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteTariff(${t.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join("");
}

// Пікірлерді жүктеу
async function loadReviews() {
    try {
        const result = await apiRequest("reviews.php");
        renderReviews(result.data || []);
    } catch (err) {
        console.error("Reviews error:", err);
    }
}

function renderReviews(reviews) {
    const tbody = document.getElementById("reviewsTable");
    
    if (!reviews.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">Пікірлер жоқ</td></tr>';
        return;
    }
    
    tbody.innerHTML = reviews.map(r => `
        <tr>
            <td>#${r.id}</td>
            <td>${r.name}</td>
            <td>${'⭐'.repeat(r.rating || 5)}</td>
            <td>${(r.text || '').substring(0, 50)}...</td>
            <td>${formatDate(r.created_at)}</td>
            <td>
                <button class="action-btn view" onclick="viewReview(${r.id})"><i class="fas fa-eye"></i></button>
                <button class="action-btn delete" onclick="deleteReview(${r.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join("");
}

// Көмекші функциялар
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString("kk-KZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Әрекет функциялары (placeholder)
function viewUser(id) { alert(`Пайдаланушы #${id} туралы ақпарат`); }
function deleteUser(id) { if(confirm("Пайдаланушыны жою керек пе?")) alert(`Жойылды: #${id}`); }
function viewPayment(id) { alert(`Төлем #${id} туралы ақпарат`); }
function resendReceipt(id) { alert(`Квитанция қайта жіберілді: #${id}`); }
function viewTicket(id) { alert(`Тикет #${id} туралы ақпарат`); }
function replyTicket(id) { alert(`Тикетке жауап: #${id}`); }
function editTariff(id) { alert(`Тарифті өңдеу: #${id}`); }
function deleteTariff(id) { if(confirm("Тарифті жою керек пе?")) alert(`Жойылды: #${id}`); }
function addTariff() { alert("Жаңа тариф қосу"); }
function viewReview(id) { alert(`Пікір #${id}`); }
function deleteReview(id) { if(confirm("Пікірді жою керек пе?")) alert(`Жойылды: #${id}`); }

// Іздеу функциялары
document.getElementById("searchUsers")?.addEventListener("input", (e) => {
    // TODO: Іздеу логикасы
});

document.getElementById("searchPayments")?.addEventListener("input", (e) => {
    // TODO: Іздеу логикасы
});

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    if (!checkAuth()) return;
    
    initNavigation();
    updateTime();
    setInterval(updateTime, 60000);
    
    // Басты бетті жүктеу
    loadDashboard();
    
    // Шығу батырмасы
    document.getElementById("logoutBtn").addEventListener("click", logout);
});
