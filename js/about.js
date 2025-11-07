// 🎯 ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeCounters();
    initializeInteractiveElements();
});

// ⚡ АНИМАЦИИ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ
function initializeAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Запускаем счетчики когда секция видима
                if (entry.target.classList.contains('hero-stats')) {
                    animateCounters();
                }
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Наблюдаем за всеми анимируемыми элементами
    const elementsToAnimate = document.querySelectorAll(
        '.about-content, .visual-card, .service-card, .mission-text, .mission-card, .section-header'
    );
    
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// 📊 АНИМАЦИЯ СЧЕТЧИКОВ
function initializeCounters() {
    // Наблюдаем за секцией со статистикой
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        statsObserver.observe(heroStats);
    }
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^0-9]/g, ''));
        const isPercentage = counter.textContent.includes('%');
        let current = 0;
        const increment = target / 30;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
                counter.textContent = isPercentage ? target + '%' : target + '+';
            } else {
                counter.textContent = isPercentage ? 
                    Math.floor(current) + '%' : 
                    Math.floor(current) + '+';
            }
        }, 50);
    });
}

// 🎪 ИНТЕРАКТИВНЫЕ ЭЛЕМЕНТЫ
function initializeInteractiveElements() {
    // Анимация карточек услуг при наведении
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-10px) scale(1)';
        });
    });

    // Параллакс эффект для героя
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.about-hero');
        if (hero && scrolled < window.innerHeight) {
            const rate = scrolled * -0.5;
            hero.style.backgroundPosition = `center ${rate}px`;
        }
    });

    // Анимация фич при наведении
    const featureItems = document.querySelectorAll('.feature-item');
    
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
}

// 🎯 ПЛАВНАЯ ПРОКРУТКА ДЛЯ ССЫЛОК
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 🌟 ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});