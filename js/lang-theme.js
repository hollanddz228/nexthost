// lang-theme.js - Исправленная версия
class LanguageThemeManager {
    constructor() {
        this.currentLang = localStorage.getItem('nexthost-language') || 'kk'; // Казахский по умолчанию
        this.currentTheme = localStorage.getItem('nexthost-theme') || 'dark';
        this.translationsData = {};
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.applyLanguage(this.currentLang);
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
            });
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // Переключатели языка
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = e.currentTarget.dataset.lang;
                this.changeLanguage(lang);
            });
        });

        // Переключатель темы
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('change', () => {
                this.toggleTheme();
            });
        }
    }

    async changeLanguage(lang) {
        // Проверяем, существует ли такой язык
        if (!translations[lang]) {
            console.error(`Language ${lang} not found`);
            return;
        }

        this.currentLang = lang;
        localStorage.setItem('nexthost-language', lang);
        await this.applyLanguage(lang);
        this.updateLanguageButtons(lang);

    
        
        // ДОБАВЛЯЕМ СОБЫТИЕ ДЛЯ ОБНОВЛЕНИЯ ОТЗЫВОВ
        const event = new CustomEvent('languageChanged', { detail: { language: lang } });
        document.dispatchEvent(event);
    }

    async applyLanguage(lang) {
        // Проверяем наличие переводов
        if (!translations[lang]) {
            console.error(`Translations for ${lang} not found`);
            return;
        }

        console.log('Applying language:', lang);

        // Переводим все элементы с data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            if (translations[lang][key]) {
                this.safeTranslateElement(element, translations[lang][key], lang);
            }
        });

        // Переводим placeholder'ы
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.dataset.translatePlaceholder;
            if (translations[lang][key]) {
                element.placeholder = translations[lang][key];
            }
        });

        // Переводим title атрибуты
        document.querySelectorAll('[data-translate-title]').forEach(element => {
            const key = element.dataset.translateTitle;
            if (translations[lang][key]) {
                element.title = translations[lang][key];
            }
        });

        // Обновляем lang атрибут документа
        document.documentElement.lang = lang;
    }

    safeTranslateElement(element, translation, lang) {
        const originalClasses = element.className;
        
        // ОБРАБОТКА GRADIENT-TEXT ДЛЯ ВСЕХ ЯЗЫКОВ
        if (element.classList.contains('hero-title')) {
            element.innerHTML = translation;
            element.classList.add('gradient-text');
            return;
        }

        // Для заголовков секций с gradient-text
        if (element.classList.contains('section-header') && element.querySelector('h2')) {
            const h2 = element.querySelector('h2');
            if (h2) {
                let gradientText = translation;
                if (lang === 'ru') {
                    gradientText = translation.replace('NextHost', '<span class="gradient-text">NextHost</span>')
                                             .replace('тарифы', '<span class="gradient-text">тарифы</span>')
                                             .replace('лидеры', '<span class="gradient-text">лидеры</span>');
                } else if (lang === 'kk') {
                    gradientText = translation.replace('NextHost', '<span class="gradient-text">NextHost</span>')
                                             .replace('тарифтер', '<span class="gradient-text">тарифтер</span>')
                                             .replace('көшбасшылар', '<span class="gradient-text">көшбасшылар</span>');
                } else if (lang === 'en') {
                    gradientText = translation.replace('NextHost', '<span class="gradient-text">NextHost</span>')
                                             .replace('Plans', '<span class="gradient-text">Plans</span>')
                                             .replace('Leaders', '<span class="gradient-text">Leaders</span>');
                }
                h2.innerHTML = gradientText;
            }
            return;
        }

        // Для кнопок и других элементов
        if (element.classList.contains('secondary-btn') || element.getAttribute('data-translate') === 'btn_contact_us') {
            element.textContent = translation;
            return;
        }

        // Для элементов с вложенными элементами
        if (element.children.length > 0) {
            this.replaceTextNodes(element, translation);
        } else {
            element.textContent = translation;
        }

        element.className = originalClasses;
    }

    replaceTextNodes(element, translation) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim()) {
                textNodes.push(node);
            }
        }

        if (textNodes.length > 0) {
            textNodes[0].textContent = translation;
            
            for (let i = 1; i < textNodes.length; i++) {
                textNodes[i].textContent = '';
            }
        } else {
            element.textContent = translation;
        }
    }

    updateLanguageButtons(lang) {
        document.querySelectorAll('[data-lang]').forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('nexthost-theme', this.currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(`${theme}-theme`);

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = theme === 'light';
        }
    }

    updateNavigationTranslation() {
        // Дополнительная логика для навигации если нужно
    }

    // Публичный метод для получения текущего языка
    getCurrentLanguage() {
        return this.currentLang;
    }

    // Публичный метод для получения текущей темы
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Метод для получения перевода по ключу
    translate(key) {
        return translations[this.currentLang]?.[key] || key;
    }
}

// Глобальная инициализация
let langThemeManager;

// Инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        langThemeManager = new LanguageThemeManager();
        window.langThemeManager = langThemeManager;
    });
} else {
    langThemeManager = new LanguageThemeManager();
    window.langThemeManager = langThemeManager;
}