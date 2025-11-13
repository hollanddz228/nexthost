// 🎯 ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
  initializeAnimations();
  initializeButtons();
  initializeScrollEffects();
});

// ⚡ АНИМАЦИИ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ
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
  const elementsToAnimate = document.querySelectorAll('.feature-card, .pricing-card, .partner-logo, .section-header');
  
  elementsToAnimate.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.6s ease';
      observer.observe(el);
  });
}

// 🎯 ОБРАБОТКА КНОПОК
function initializeButtons() {
  // Кнопки "Начать сейчас" и "Узнать больше"
  const primaryBtns = document.querySelectorAll('.primary-btn');
  primaryBtns.forEach(btn => {
      btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-2px)';
          btn.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
      });
      
      btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = 'none';
      });
      
      btn.addEventListener('click', (e) => {
          e.preventDefault();
          const btnText = btn.textContent;
          
          if (btnText.includes('Начать сейчас')) {
              // Плавный скролл к тарифам
              document.querySelector('.pricing-section').scrollIntoView({ 
                  behavior: 'smooth' 
              });
          } else if (btnText.includes('Связаться с нами')) {
              window.location.href = 'support.html';
          }
      });
  });

  // Кнопки тарифов
  document.querySelectorAll('.plan-btn').forEach(btn => {
      btn.addEventListener('click', function() {
          const planName = this.closest('.pricing-card').querySelector('h3').textContent;
          const planPrice = this.closest('.pricing-card').querySelector('.price').textContent;
          
          alert(`Вы выбрали тариф "${planName}" за ${planPrice}\n\nПеренаправляем на страницу регистрации...`);
          window.location.href = 'hosting.html';
      });
  });

  // Вторичные кнопки
  const secondaryBtns = document.querySelectorAll('.secondary-btn');
  secondaryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
          e.preventDefault();
          const btnText = btn.textContent;
          
          if (btnText.includes('Узнать больше')) {
              document.querySelector('.features-section').scrollIntoView({ 
                  behavior: 'smooth' 
              });
          }
      });
  });
}

// 🌟 ЭФФЕКТЫ ПРИ СКРОЛЛЕ
function initializeScrollEffects() {
  // Параллакс для героя
  window.addEventListener('scroll', function() {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.hero');
      if (hero && scrolled < window.innerHeight) {
          const rate = scrolled * -0.5;
          hero.style.backgroundPosition = `center ${rate}px`;
      }
  });

  // Анимация статистики при скролле
  const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              animateStats();
              statsObserver.unobserve(entry.target);
          }
      });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
      statsObserver.observe(heroStats);
  }
}

// 📊 АНИМАЦИЯ СТАТИСТИКИ
function animateStats() {
  const stats = document.querySelectorAll('.stat-number');
  stats.forEach(stat => {
      const originalText = stat.textContent;
      const target = parseInt(originalText.replace(/[^0-9]/g, ''));
      let current = 0;
      const increment = target / 30;
      
      const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
              current = target;
              clearInterval(timer);
              stat.textContent = originalText;
          } else {
              stat.textContent = Math.floor(current) + (originalText.includes('%') ? '%' : '+');
          }
      }, 50);
  });
}

// 🎪 ДОПОЛНИТЕЛЬНЫЕ ИНТЕРАКТИВНЫЕ ЭФФЕКТЫ
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.style.setProperty('--mouse-x', `${x}px`);
      this.style.setProperty('--mouse-y', `${y}px`);
  });
});

// Добавляем класс для плавного появления контента
window.addEventListener('load', function() {
  document.body.classList.add('loaded');
});

// 🎯 ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
  initializeHeader();
  initializeAnimations();
  initializeButtons();
  initializeScrollEffects();
});

// 🏠 ИНИЦИАЛИЗАЦИЯ ХЕДЕРА
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

// ... остальной код без изменений ...