document.addEventListener('DOMContentLoaded', function() {
    // Анимация хедера при скролле
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Параллакс эффект для героя
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.partners-hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.backgroundPosition = `center ${rate}px`;
        }
    });

    // Анимация появления элементов
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                if (entry.target.classList.contains('partner-card')) {
                    const cards = Array.from(entry.target.parentNode.children);
                    const delay = cards.indexOf(entry.target) * 0.1;
                    entry.target.style.transitionDelay = `${delay}s`;
                }
            }
        });
    }, observerOptions);

    // Инициализация анимаций
    document.querySelectorAll('.partner-card, .benefit-item, .stat').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Интерактивность карточек партнеров
    const partnerCards = document.querySelectorAll('.partner-card');
    
    partnerCards.forEach(card => {
        card.addEventListener('click', function() {
            const partner = this.getAttribute('data-partner');
            showPartnerDetails(partner);
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-10px) scale(1)';
        });
    });

    // Функция показа деталей партнера (исправленная)
function showPartnerDetails(partner) {
    const partnerData = {
        'nvidia': {
            name: 'NVIDIA',
            description: 'Мировой лидер в области GPU-технологий и искусственного интеллекта. Компания, которая revolutionized индустрию компьютерной графики и высокопроизводительных вычислений.',
            collaboration: 'Совместная разработка высокопроизводительных вычислений на базе GPU, оптимизация AI/ML инфраструктуры, интеграция CUDA технологий в облачные решения.',
            benefits: ['GPU-ускорение серверов', 'AI/ML инфраструктура', 'Технологии CUDA', 'Оптимизация рендеринга']
        },
        'redbull': {
            name: 'Red Bull',
            description: 'Глобальный бренд в области спорта, экстремальных мероприятий и киберспорта. Организатор масштабных международных событий.',
            collaboration: 'Хостинг мировых спортивных и киберспортивных событий, обеспечение стабильного стриминга, глобальная CDN для трансляций.',
            benefits: ['Глобальная CDN сеть', 'Event хостинг', 'Стриминг платформы', 'Киберспортивные турниры']
        },
        'cloudflare': {
            name: 'Cloudflare', 
            description: 'Ведущая платформа для безопасности и производительности веб-сайтов. Мировой лидер в области защиты от DDoS атак и ускорения контента.',
            collaboration: 'Интегрированная сеть доставки контента, многоуровневая защита от DDoS атак, Web Application Firewall, глобальное кэширование.',
            benefits: ['DDoS защита', 'Глобальный кэшинг', 'Web Application Firewall', 'Ускорение CDN']
        },
        'razer': {
            name: 'Razer',
            description: 'Ведущий бренд игрового оборудования и программного обеспечения. Пионер в области игровых технологий и киберспорта.',
            collaboration: 'Оптимизированная инфраструктура для игровых серверов, интеграция с Razer Gold, low-latency сеть для многопользовательских игр.',
            benefits: ['Игровые серверы', 'Low-latency сеть', 'Razer Gold интеграция', 'Киберспортивные платформы']
        },
        'logitech': {
            name: 'Logitech G',
            description: 'Инновационные решения для геймеров и контент-создателей. Мировой лидер в области игровых периферийных устройств.',
            collaboration: 'Стриминговые платформы для контент-создателей, игровые сообщества, оптимизация доставки видеоконтента.',
            benefits: ['Стриминг платформы', 'Контент доставка', 'Игровые сообщества', 'Видео хостинг']
        }
    };
    
    const data = partnerData[partner];
    if (!data) return;
    
    // Создаем HTML для модального окна (используем CSS классы вместо inline стилей)
    const modalHtml = `
        <div class="partner-modal">
            <div class="modal-content">
                <h3>${data.name}</h3>
                <p><strong>Описание:</strong> ${data.description}</p>
                <p><strong>Сотрудничество:</strong> ${data.collaboration}</p>
                <div style="margin-bottom: 1.5rem;">
                    <strong>Преимущества:</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                        ${data.benefits.map(benefit => `<span class="benefit">${benefit}</span>`).join('')}
                    </div>
                </div>
                <button class="close-modal">Закрыть</button>
            </div>
        </div>
    `;
    
    // Создаем модальное окно
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    const modal = modalContainer.querySelector('.partner-modal');
    const modalContent = modalContainer.querySelector('.modal-content');
    
    // Анимация появления
    setTimeout(() => {
        modal.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
    }, 10);
    
    // Закрытие модального окна
    function closeModal() {
        modal.style.opacity = '0';
        modalContent.style.transform = 'scale(0.8)';
        setTimeout(() => {
            if (document.body.contains(modalContainer)) {
                document.body.removeChild(modalContainer);
            }
        }, 300);
    }
    
    // Обработчики закрытия
    modalContainer.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Закрытие по ESC
    function handleEscape(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    }
    document.addEventListener('keydown', handleEscape);
}

    // Обработчики CTA кнопок
    const primaryBtn = document.querySelector('.cta-buttons .btn-primary');
    const secondaryBtn = document.querySelector('.cta-buttons .btn-secondary');
    
    if (primaryBtn) {
        primaryBtn.addEventListener('click', function() {
            // Перенаправляем на страницу поддержки с параметром
            window.location.href = 'support.html?type=partnership';
        });
    }
    
    if (secondaryBtn) {
        secondaryBtn.addEventListener('click', function() {
            alert('Условия партнерства будут отправлены на вашу почту! Для получения информации свяжитесь с support@nexthost.kz');
        });
    }

    // Инициализация видимых элементов
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }
    }, 500);
});