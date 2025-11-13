// 🎯 ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeProfile();
    initializeAnimations();
  });
  
  // 🔐 ПРОВЕРКА АВТОРИЗАЦИИ
  function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
      window.location.href = 'auth.html';
      return;
    }
  }
  
  // 👤 ИНИЦИАЛИЗАЦИЯ ПРОФИЛЯ
  function initializeProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
      // Заполняем информацию в хедере
      document.getElementById('userName').textContent = user.name;
      document.getElementById('heroUserName').textContent = user.name;
      
      // Заполняем основную информацию
      document.getElementById('profileName').textContent = user.name;
      document.getElementById('profileEmail').textContent = user.email;
      document.getElementById('userBalance').textContent = (user.balance || 0) + ' kzt';
      
      // Аватар
      document.getElementById('avatarInitials').textContent = getInitials(user.name);
      
      // Загружаем дополнительные данные
      loadAdditionalUserData(user.id);
    }
  }
  
  // 📧 ЗАГРУЗКА ДОПОЛНИТЕЛЬНЫХ ДАННЫХ
  async function loadAdditionalUserData(userId) {
    try {
      // Здесь будет запрос к API
      // Временные данные для демонстрации
      setTimeout(() => {
        document.getElementById('profilePhone').textContent = '+7 (777) 814-50-56';
        document.getElementById('profileDate').textContent = '7 ноября 2025';
        document.getElementById('activeServicesCount').textContent = '0';
        document.getElementById('supportTickets').textContent = '0';
        document.getElementById('totalServices').textContent = '0';
        document.getElementById('totalSpent').textContent = '0 kzt';
        document.getElementById('daysRegistered').textContent = '1';
      }, 500);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  }
  
  // 🎭 ПОЛУЧЕНИЕ ИНИЦИАЛОВ ДЛЯ АВАТАРА
  function getInitials(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  }
  
  // 🎪 АНИМАЦИИ
  function initializeAnimations() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
  
    // Наблюдаем за элементами для анимации
    const elementsToAnimate = document.querySelectorAll('.profile-card, .profile-stat, .action-btn');
    
    elementsToAnimate.forEach(el => {
      observer.observe(el);
    });
  }
  
  // 🚪 ВЫХОД ИЗ СИСТЕМЫ
  function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
      localStorage.removeItem('user');
      window.location.href = 'auth.html';
    }
  }
  
  // 🛠️ ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
  function showEditForm() {
    alert('Функция редактирования профиля в разработке');
  }
  
  function showBilling() {
    alert('Функция пополнения баланса в разработке');
  }
  
  function showSettings() {
    alert('Функция настроек в разработке');
  }
  
  function showDocs() {
    alert('Документация будет доступна в ближайшее время');
  }
  
  // 🌟 ИНИЦИАЛИЗАЦИЯ ХЕДЕРА (как в index.html)
  function initializeHeader() {
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', function() {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
  
  // Инициализация хедера
  initializeHeader();