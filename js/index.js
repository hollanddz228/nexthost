// 🧭 Плавная прокрутка к секциям
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // ⚡ Анимация появления блоков при скролле
  const elements = document.querySelectorAll('.feature, .hero-content');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.3 });
  
  elements.forEach(el => observer.observe(el));
  
  // 🎯 Анимация кнопки “Начать сейчас”
  const startBtn = document.querySelector('.primary-btn');
  if (startBtn) {
    startBtn.addEventListener('mouseenter', () => {
      startBtn.style.transform = 'scale(1.05)';
      startBtn.style.boxShadow = '0 0 15px #38bdf8';
    });
    startBtn.addEventListener('mouseleave', () => {
      startBtn.style.transform = 'scale(1)';
      startBtn.style.boxShadow = 'none';
    });
    startBtn.addEventListener('click', () => {
      alert('🔥 Добро пожаловать в NextHost!\nРегистрация скоро будет доступна.');
    });
  }
  
  // 🌙 (опционально) можно добавить переключатель темы позже
  