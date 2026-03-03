const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const forgotPasswordLink = document.getElementById('forgotPassword');
const backToLogin = document.getElementById('backToLogin');

// Переключение между формами
registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Показать форму восстановления пароля
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.sign-in').style.display = 'none';
    document.querySelector('.password-reset').style.display = 'flex';
});

// Вернуться к форме входа
backToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.password-reset').style.display = 'none';
    document.querySelector('.sign-in').style.display = 'flex';
});

// Обработка формы регистрации
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirm_password: formData.get('confirm_password')
    };

    // Валидация
    if (data.password !== data.confirm_password) {
        alert('Құпиясөздер сәйкес келмейді!');
        return;
    }

    if (data.password.length < 6) {
        alert('Құпиясөз кемінде 6 таңбадан тұруы керек!');
        return;
    }

    try {
        const response = await fetch('backend/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            alert('Тіркелу сәтті! Растау үшін email-ды тексеріңіз.');
            container.classList.remove("active");
        } else {
            alert('Қате: ' + result.message);
        }
    } catch (error) {
        alert('Желі қатесі: ' + error.message);
    }
});

// Обработка формы входа
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch('backend/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            // Пайдаланушы деректерін сақтаймыз
            localStorage.setItem('user', JSON.stringify(result.user));
            // Басты бетке бағыттаймыз
            window.location.href = 'index.html';
        } else {
            alert('Қате: ' + result.message);
        }
    } catch (error) {
        alert('Желі қатесі: ' + error.message);
    }
});

// Обработка восстановления пароля
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');

    try {
        const response = await fetch('backend/forgot_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            // Кіру формасына қайтарамыз
            document.querySelector('.password-reset').style.display = 'none';
            document.querySelector('.sign-in').style.display = 'flex';
        } else {
            alert('Қате: ' + result.message);
        }
    } catch (error) {
        alert('Желі қатесі: ' + error.message);
    }
});

// Проверка авторизации при загрузке
window.addEventListener('load', () => {
    const user = localStorage.getItem('user');
    if (user) {
        window.location.href = 'index.html';
    }
});

// ============================================================
// СЕКРЕТНЫЙ ВХОД В АДМИНКУ
// Комбинация: Ctrl+Shift+Z
// ============================================================
const adminModal = document.getElementById("adminModal");
const adminPasswordInput = document.getElementById("adminPassword");
const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminCancelBtn = document.getElementById("adminCancelBtn");

// Комбинация Ctrl+Shift+Z — открыть модалку
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        openAdminModal();
    }
    
    // ESC — закрыть модалку
    if (e.key === "Escape" && adminModal?.classList.contains("active")) {
        closeAdminModal();
    }
});

// Открыть модалку админки
function openAdminModal() {
    if (adminModal) {
        adminModal.classList.add("active");
        adminPasswordInput?.focus();
        console.log("🔐 Әкімші режимі белсендірілді");
    }
}

// Закрыть модалку
function closeAdminModal() {
    if (adminModal) {
        adminModal.classList.remove("active");
        if (adminPasswordInput) adminPasswordInput.value = "";
    }
}

// Клик по оверлею — закрыть
adminModal?.addEventListener("click", (e) => {
    if (e.target === adminModal) {
        closeAdminModal();
    }
});

// Кнопка отмены
adminCancelBtn?.addEventListener("click", closeAdminModal);

// Кнопка входа
adminLoginBtn?.addEventListener("click", adminLogin);

// Enter в поле пароля
adminPasswordInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") adminLogin();
});

// Вход в админку
async function adminLogin() {
    const password = adminPasswordInput?.value;
    
    if (!password) {
        adminPasswordInput?.focus();
        return;
    }
    
    // Анимация загрузки
    if (adminLoginBtn) {
        adminLoginBtn.disabled = true;
        adminLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    try {
        const response = await fetch("backend/admin/login.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem("adminToken", result.token);
            localStorage.setItem("adminLogin", Date.now());
            window.location.href = "admin.html";
        } else {
            // Тряска при ошибке
            const box = document.querySelector(".admin-modal-box");
            box?.classList.add("shake");
            setTimeout(() => box?.classList.remove("shake"), 500);
            
            if (adminPasswordInput) adminPasswordInput.value = "";
            adminPasswordInput?.focus();
        }
    } catch (error) {
        alert("Сервер қатесі: " + error.message);
    } finally {
        if (adminLoginBtn) {
            adminLoginBtn.disabled = false;
            adminLoginBtn.textContent = "Кіру";
        }
    }
}