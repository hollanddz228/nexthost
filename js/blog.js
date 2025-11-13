// 🎯 ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', function() {
    initializeBlog();
    initializeFilters();
    initializeSearch();
    initializeNewsletter();
});

// ⚡ ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ БЛОГА
function initializeBlog() {
    initializeAnimations();
    initializeCardInteractions();
}

// 🎭 АНИМАЦИИ ПОЯВЛЕНИЯ
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

    // Наблюдаем за карточками статей и виджетами
    const elementsToAnimate = document.querySelectorAll('.blog-card, .sidebar-widget');
    
    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
}

// 🎯 ФИЛЬТРАЦИЯ ПО КАТЕГОРИЯМ
function initializeFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            filterBlogCards(category);
        });
    });
    
    function filterBlogCards(category) {
        blogCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
}

// 🔍 ПОИСК ПО СТАТЬЯМ
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        blogCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const content = card.querySelector('p').textContent.toLowerCase();
            const category = card.getAttribute('data-category');
            
            if (title.includes(searchTerm) || content.includes(searchTerm) || category.includes(searchTerm)) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// 📧 РАССЫЛКА
function initializeNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Имитация успешной подписки
            alert(`Спасибо за подписку! На адрес ${email} отправлено письмо с подтверждением.`);
            this.reset();
        });
    }
}

// 🎪 ИНТЕРАКТИВНЫЕ ЭЛЕМЕНТЫ
function initializeCardInteractions() {
    const blogCards = document.querySelectorAll('.blog-card');
    
    blogCards.forEach(card => {
        // Дополнительные hover-эффекты
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-10px) scale(1)';
        });
    });
    
    // Клик по тегам
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.textContent.replace('#', '');
            const searchInput = document.querySelector('.search-input');
            searchInput.value = tagText;
            initializeSearch(); // Вызываем поиск
        });
    });
}

// 📊 ПАГИНАЦИЯ
function initializePagination() {
    const pageBtns = document.querySelectorAll('.page-btn');
    
    pageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('active')) return;
            
            // Убираем активный класс у всех кнопок
            pageBtns.forEach(b => b.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            // Имитация загрузки новой страницы
            simulatePageLoad();
        });
    });
    
    function simulatePageLoad() {
        const blogGrid = document.querySelector('.blog-grid');
        blogGrid.style.opacity = '0.5';
        
        setTimeout(() => {
            blogGrid.style.opacity = '1';
            // В реальном проекте здесь загрузка новых статей
        }, 500);
    }
}

// 🌟 ИНИЦИАЛИЗАЦИЯ ПАГИНАЦИИ ПРИ ЗАГРУЗКЕ
initializePagination();

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

// 📈 СТАТИСТИКА ПРОСМОТРОВ (имитация)
function simulateViewCount() {
    const viewElements = document.querySelectorAll('.views');
    viewElements.forEach(element => {
        const currentViews = parseInt(element.textContent);
        // Увеличиваем просмотры на случайное число (имитация)
        const newViews = currentViews + Math.floor(Math.random() * 10);
        element.textContent = newViews.toLocaleString();
    });
}

// Запускаем обновление просмотров каждые 30 секунд
setInterval(simulateViewCount, 30000);