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
        alert('Пароли не совпадают!');
        return;
    }

    if (data.password.length < 6) {
        alert('Пароль должен быть не менее 6 символов!');
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
            alert('Регистрация успешна! Проверьте email для подтверждения.');
            container.classList.remove("active");
        } else {
            alert('Ошибка: ' + result.message);
        }
    } catch (error) {
        alert('Ошибка сети: ' + error.message);
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
            // Сохраняем данные пользователя
            localStorage.setItem('user', JSON.stringify(result.user));
            // Перенаправляем на главную
            window.location.href = 'index.html';
        } else {
            alert('Ошибка: ' + result.message);
        }
    } catch (error) {
        alert('Ошибка сети: ' + error.message);
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
            // Возвращаем к форме входа
            document.querySelector('.password-reset').style.display = 'none';
            document.querySelector('.sign-in').style.display = 'flex';
        } else {
            alert('Ошибка: ' + result.message);
        }
    } catch (error) {
        alert('Ошибка сети: ' + error.message);
    }
});

// Проверка авторизации при загрузке
window.addEventListener('load', () => {
    const user = localStorage.getItem('user');
    if (user) {
        window.location.href = 'index.html';
    }
});