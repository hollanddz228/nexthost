// 🎯 ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ СТАТЬИ
document.addEventListener('DOMContentLoaded', function() {
    initializeBlogPost();
    initializeSocialShare();
    initializeComments();
    initializeReadingProgress();
});

// ⚡ ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ СТРАНИЦЫ СТАТЬИ
function initializeBlogPost() {
    initializeLikeSystem();
    initializeBookmarkSystem();
    initializeTableOfContents();
}

// ❤️ СИСТЕМА ЛАЙКОВ
function initializeLikeSystem() {
    const likeBtn = document.querySelector('.like-btn');
    const likeCount = document.querySelector('.like-count');
    
    if (likeBtn && likeCount) {
        // Проверяем, лайкал ли пользователь уже эту статью
        const postId = window.location.pathname;
        const hasLiked = localStorage.getItem(`liked_${postId}`);
        
        if (hasLiked) {
            likeBtn.classList.add('active');
        }
        
        likeBtn.addEventListener('click', function() {
            if (likeBtn.classList.contains('active')) {
                // Убираем лайк
                likeBtn.classList.remove('active');
                const currentCount = parseInt(likeCount.textContent);
                likeCount.textContent = Math.max(0, currentCount - 1);
                localStorage.removeItem(`liked_${postId}`);
            } else {
                // Ставим лайк
                likeBtn.classList.add('active');
                const currentCount = parseInt(likeCount.textContent);
                likeCount.textContent = currentCount + 1;
                localStorage.setItem(`liked_${postId}`, 'true');
                
                // Анимация лайка
                likeBtn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    likeBtn.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }
}

// 📑 СИСТЕМА СОХРАНЕНИЯ СТАТЕЙ
function initializeBookmarkSystem() {
    const bookmarkBtn = document.querySelector('.bookmark-btn');
    
    if (bookmarkBtn) {
        const postId = window.location.pathname;
        const isBookmarked = localStorage.getItem(`bookmarked_${postId}`);
        
        if (isBookmarked) {
            bookmarkBtn.textContent = '📑 Бетбелгілерде';
            bookmarkBtn.classList.add('active');
        }
        
        bookmarkBtn.addEventListener('click', function() {
            if (bookmarkBtn.classList.contains('active')) {
                // Бетбелгілерден алып тастаймыз
                bookmarkBtn.textContent = '📑 Сақтау';
                bookmarkBtn.classList.remove('active');
                localStorage.removeItem(`bookmarked_${postId}`);
            } else {
                // Бетбелгілерге қосамыз
                bookmarkBtn.textContent = '📑 Бетбелгілерде';
                bookmarkBtn.classList.add('active');
                localStorage.setItem(`bookmarked_${postId}`, 'true');
                
                // Анимация
                bookmarkBtn.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    bookmarkBtn.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }
}

// 📤 СИСТЕМА ПОДЕЛИТЬСЯ
function initializeSocialShare() {
    const shareBtns = document.querySelectorAll('.share-btn');
    
    shareBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            const text = encodeURIComponent('Посмотрите эту интересную статью!');
            
            let shareUrl = '';
            
            switch(platform) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'copy':
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Сілтеме алмасу буферіне көшірілді!');
                    });
                    return;
                default:
                    // Общая кнопка поделиться
                    if (navigator.share) {
                        navigator.share({
                            title: document.title,
                            text: text,
                            url: window.location.href,
                        });
                        return;
                    } else {
                        // Desktop үшін фолбэк
                        navigator.clipboard.writeText(window.location.href).then(() => {
                            alert('Сілтеме алмасу буферіне көшірілді!');
                        });
                        return;
                    }
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
}

// 💬 СИСТЕМА КОММЕНТАРИЕВ
function initializeComments() {
    const commentForm = document.querySelector('.comment-form');
    const commentsList = document.querySelector('.comments-list');
    const commentsCount = document.querySelector('.comments-count');
    
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const textarea = this.querySelector('textarea');
            const commentText = textarea.value.trim();
            
            if (commentText) {
                addNewComment(commentText);
                textarea.value = '';
                
                // Обновляем счетчик комментариев
                if (commentsCount) {
                    const currentCount = parseInt(commentsCount.textContent);
                    commentsCount.textContent = currentCount + 1;
                }
            }
        });
    }
}

function addNewComment(text) {
    const commentsList = document.querySelector('.comments-list');
    if (!commentsList) return;
    
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.innerHTML = `
        <div class="comment-author">
            <img src="../images/avatars/default-user.jpg" alt="Пользователь">
            <div>
                <strong>Вы</strong>
                <span>только что</span>
            </div>
        </div>
        <div class="comment-text">
            <p>${text}</p>
        </div>
    `;
    
    commentsList.appendChild(commentDiv);
    
    // Плавное появление
    setTimeout(() => {
        commentDiv.style.opacity = '1';
        commentDiv.style.transform = 'translateY(0)';
    }, 10);
}

// 📊 ПРОГРЕСС ЧТЕНИЯ
function initializeReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: var(--accent-color);
        z-index: 1001;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        
        progressBar.style.width = scrollPercent + '%';
    });
}

// 📑 АВТОМАТИЧЕСКОЕ ОГЛАВЛЕНИЕ
function initializeTableOfContents() {
    const headings = document.querySelectorAll('.post-content h2, .post-content h3');
    if (headings.length > 2) {
        createTableOfContents(headings);
    }
}

function createTableOfContents(headings) {
    const toc = document.createElement('div');
    toc.className = 'table-of-contents';
    toc.innerHTML = '<h3>📑 Мазмұны</h3><ul></ul>';
    
    const tocList = toc.querySelector('ul');
    let tocHTML = '';
    
    headings.forEach((heading, index) => {
        const id = `section-${index}`;
        heading.id = id;
        
        const level = heading.tagName.toLowerCase();
        const indent = level === 'h3' ? '20px' : '0';
        
        tocHTML += `
            <li style="margin-left: ${indent}">
                <a href="#${id}">${heading.textContent}</a>
            </li>
        `;
    });
    
    tocList.innerHTML = tocHTML;
    
    // Вставляем после первого параграфа
    const firstParagraph = document.querySelector('.post-content p');
    if (firstParagraph) {
        firstParagraph.parentNode.insertBefore(toc, firstParagraph.nextSibling);
    }
    
    // Стили для оглавления
    const style = document.createElement('style');
    style.textContent = `
        .table-of-contents {
            background: rgba(255, 255, 255, 0.05);
            padding: 1.5rem;
            border-radius: 10px;
            margin: 2rem 0;
            border-left: 4px solid var(--accent-color);
        }
        .table-of-contents h3 {
            margin-top: 0;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        .table-of-contents ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .table-of-contents li {
            margin-bottom: 0.5rem;
        }
        .table-of-contents a {
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 0.3s ease;
        }
        .table-of-contents a:hover {
            color: var(--accent-color);
        }
    `;
    document.head.appendChild(style);
}

// 🕒 ВРЕМЯ ЧТЕНИЯ
function updateReadingTime() {
    const content = document.querySelector('.post-content');
    if (content) {
        const text = content.textContent;
        const wordCount = text.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // 200 слов в минуту
        
        const readingTimeElement = document.querySelector('.post-date');
        if (readingTimeElement) {
            const currentText = readingTimeElement.textContent;
            readingTimeElement.textContent = currentText.replace(/\d+ мин/, readingTime + ' мин');
        }
    }
}

// 📱 АДАПТИВНОСТЬ ДЛЯ МОБИЛЬНЫХ
function initializeMobileOptimizations() {
    // Увеличиваем размер шрифта для мобильных при длительном чтении
    if (window.innerWidth < 768) {
        document.querySelector('.post-content').style.fontSize = '1.1rem';
    }
    
    // Скрываем некоторые элементы на мобильных
    const socialShare = document.querySelector('.social-share');
    if (window.innerWidth < 768 && socialShare) {
        socialShare.style.display = 'none';
    }
}

// 🌟 ДОПОЛНИТЕЛЬНЫЕ ФИЧИ
function initializeExtraFeatures() {
    // Подсветка кода
    highlightCodeBlocks();
    
    // Ленивая загрузка изображений
    initializeLazyLoading();
    
    // Плавная прокрутка к якорям
    initializeSmoothScroll();
}

function highlightCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        block.style.cssText = `
            background: #1a1a1a;
            padding: 1rem;
            border-radius: 8px;
            display: block;
            overflow-x: auto;
            color: #f8f8f2;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            line-height: 1.4;
        `;
    });
}

function initializeLazyLoading() {
    const images = document.querySelectorAll('.post-content img');
    images.forEach(img => {
        img.loading = 'lazy';
    });
}

function initializeSmoothScroll() {
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
}

// 🚀 ЗАПУСК ВСЕХ ФУНКЦИЙ
updateReadingTime();
initializeMobileOptimizations();
initializeExtraFeatures();