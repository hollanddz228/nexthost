// ==========================================
// js/global.js - Глобальный JavaScript для всего сайта
// ==========================================

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  
    // ========================================
    // МОБИЛЬНОЕ МЕНЮ
    // ========================================
    initMobileMenu();
    
    // ========================================
    // ПЛАВНАЯ ПРОКРУТКА К ЯКОРЯМ
    // ========================================
    initSmoothScroll();
    
    // ========================================
    // АКТИВНАЯ СТРАНИЦА В НАВИГАЦИИ
    // ========================================
    highlightActivePage();
    
    // ========================================
    // STICKY HEADER
    // ========================================
    initStickyHeader();
  });
  
  // ==========================================
  // ФУНКЦИЯ: Мобильное меню
  // ==========================================
  function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!mobileMenuToggle || !navLinks) return;
    
    // Переключение меню
    mobileMenuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      this.classList.toggle('active');
      
      // Анимация бургера
      if (this.classList.contains('active')) {
        this.setAttribute('aria-expanded', 'true');
      } else {
        this.setAttribute('aria-expanded', 'false');
      }
    });
  
    // Закрыть меню при клике на ссылку
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  
    // Закрыть меню при клике вне его
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.nav-links') && 
          !event.target.closest('.mobile-menu-toggle')) {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
    
    // Закрыть меню при нажатии Escape
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
  
  // ==========================================
  // ФУНКЦИЯ: Плавная прокрутка к якорям
  // ==========================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Игнорируем пустые якоря
        if (href === '#' || href === '#!') return;
        
        const target = document.querySelector(href);
        
        if (target) {
          e.preventDefault();
          
          // Плавная прокрутка
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Обновляем URL без перезагрузки
          history.pushState(null, null, href);
        }
      });
    });
  }
  
  // ==========================================
  // ФУНКЦИЯ: Подсветка активной страницы
  // ==========================================
  function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-links a').forEach(link => {
      const linkPage = link.getAttribute('href');
      
      // Удаляем существующий класс active
      link.classList.remove('active');
      
      // Добавляем active к текущей странице
      if (linkPage === currentPage || 
          (currentPage === '' && linkPage === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
  
  // ==========================================
  // ФУНКЦИЯ: Sticky Header с эффектом
  // ==========================================
  function initStickyHeader() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      
      // Добавляем класс при прокрутке
      if (currentScroll > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      // Скрываем header при прокрутке вниз (опционально)
      // if (currentScroll > lastScroll && currentScroll > 100) {
      //   header.style.transform = 'translateY(-100%)';
      // } else {
      //   header.style.transform = 'translateY(0)';
      // }
      
      lastScroll = currentScroll;
    });
  }
  
  // ==========================================
  // ФУНКЦИЯ: Показать/скрыть кнопку "Наверх"
  // ==========================================
  function initScrollToTop() {
    // Создаем кнопку если её нет
    let scrollTopBtn = document.getElementById('scrollTopBtn');
    
    if (!scrollTopBtn) {
      scrollTopBtn = document.createElement('button');
      scrollTopBtn.id = 'scrollTopBtn';
      scrollTopBtn.className = 'scroll-top-btn';
      scrollTopBtn.innerHTML = '↑';
      scrollTopBtn.setAttribute('aria-label', 'Прокрутить наверх');
      document.body.appendChild(scrollTopBtn);
    }
    
    // Показываем/скрываем кнопку
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });
    
    // Прокрутка наверх
    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Вызываем функцию (раскомментируйте если нужна кнопка "Наверх")
  // initScrollToTop();
  
  // ==========================================
  // УТИЛИТЫ: Полезные функции
  // ==========================================
  
  // Дебаунс (ограничение частоты вызова функции)
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Троттлинг (ограничение частоты вызова функции)
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Проверка видимости элемента
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  // ==========================================
  // АНИМАЦИЯ ПРИ ПОЯВЛЕНИИ (опционально)
  // ==========================================
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => observer.observe(el));
  }
  
  // Вызываем функцию (раскомментируйте если нужна анимация)
  // initScrollAnimations();
  
  // ==========================================
  // ЗАЩИТА ОТ СПАМА ФОРМ
  // ==========================================
  function initFormProtection() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      let submitCount = 0;
      const maxSubmits = 3;
      const timeWindow = 60000; // 1 минута
      
      form.addEventListener('submit', function(e) {
        submitCount++;
        
        if (submitCount > maxSubmits) {
          e.preventDefault();
          alert('Тым көп жіберу әрекеті. Бір минут күтіңіз.');
          return false;
        }
        
        setTimeout(() => {
          submitCount = Math.max(0, submitCount - 1);
        }, timeWindow);
      });
    });
  }
  
  // Вызываем защиту форм
  // initFormProtection();
  
  // ==========================================
  // ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ В ДРУГИХ ФАЙЛАХ
  // ==========================================
  window.GlobalUtils = {
    debounce,
    throttle,
    isElementInViewport
  };
  
  // ==========================================
  // ОТЛАДКА (удалите в продакшене)
  // ==========================================
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ Global.js сәтті жүктелді');
  }

 