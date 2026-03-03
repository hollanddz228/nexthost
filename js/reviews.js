// js/reviews.js — аудармалары бар түзетілген нұсқа
document.addEventListener("DOMContentLoaded", () => {
  // Функция для получения перевода в зависимости от языка
  function getTranslation(key) {
      const lang = window.langThemeManager?.getCurrentLanguage() || 'ru';
      return translations[lang]?.[key] || key;
  }

  // Отзывы с переводами
  const reviews = [
      { 
          name: "Нурбек", 
          rating: 5, 
          message: {
              ru: "NextHost — просто огонь! Мой сайт грузится мгновенно!",
              kk: "NextHost — жай отын! Менің сайтым лезде жүктеледі!",
              en: "NextHost is just fire! My website loads instantly!"
          },
          avatar: "images/nurbek.jpg" 
      },
      { 
          name: "Нурдаулет", 
          rating: 4, 
          message: {
              ru: "Отличный сервис и отзывчивая поддержка!",
              kk: "Керемет қызмет және жылы қолдау!",
              en: "Excellent service and responsive support!"
          },
          avatar: "images/nurda.jpg" 
      },
      { 
          name: "Альфараби", 
          rating: 5, 
          message: {
              ru: "Использую уже 6 месяцев, никаких проблем!",
              kk: "6 ай бойы пайдаланып жүрмін, ешқандай мәселе жоқ!",
              en: "I've been using it for 6 months, no problems at all!"
          },
          avatar: "images/alfa.jpg" 
      },
      { 
          name: "Асельхан", 
          rating: 5, 
          message: {
              ru: "Дизайн панели крутой и всё понятно!",
              kk: "Панель дизайны керемет және бәрі түсінікті!",
              en: "Panel design is awesome and everything is clear!"
          },
          avatar: "images/aselya.jpg" 
      },
      { 
          name: "Райхан", 
          rating: 5, 
          message: {
              ru: "Настоящий премиум-хостинг, респект команде NextHost!",
              kk: "Нағыз премиум-хостинг, NextHost командасына ризашылық!",
              en: "Real premium hosting, respect to the NextHost team!"
          },
          avatar: "images/raikhan.jpg" 
      },
      { 
          name: "Арлан", 
          rating: 4, 
          message: {
              ru: "Хорошая скорость, можно чуть дешевле 😅",
              kk: "Жақсы жылдамдық, сәл арзанырақ болуы мүмкін 😅",
              en: "Good speed, could be a bit cheaper 😅"
          },
          avatar: "images/arlan.jpg" 
      },
      { 
          name: "Ануар", 
          rating: 5, 
          message: {
              ru: "Все работает стабильно, доволен!",
              kk: "Барлығы тұрақты жұмыс істейді, қанағаттанарлық!",
              en: "Everything works stable, satisfied!"
          },
          avatar: "images/anuar.jpg" 
      },
      { 
          name: "Мухаммедали", 
          rating: 5, 
          message: {
              ru: "Перешел с другого хостинга — не пожалел!",
              kk: "Басқа хостингтен ауыстырып — өкінбеймін!",
              en: "Switched from another hosting - no regrets!"
          },
          avatar: "images/muha.jpg" 
      },
  ];

  const slider = document.querySelector('.reviews-slider');
  const track = document.getElementById('reviews-track');

  if (!slider) return console.error('reviews.js: .reviews-slider DOM-да табылмады');
  if (!track) return console.error('reviews.js: #reviews-track DOM-да табылмады');

  track.innerHTML = '';
  track.classList.add('reviews-track');

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Функция для получения текущего перевода сообщения
  function getCurrentMessage(messageObj) {
      const lang = window.langThemeManager?.getCurrentLanguage() || 'ru';
      return messageObj[lang] || messageObj.ru || '';
  }

  function makeCard(r) {
      const card = document.createElement('div');
      card.className = 'review-card';
      const currentMessage = getCurrentMessage(r.message);
      card.innerHTML = `
          ${r.avatar ? `<img src="${r.avatar}" alt="${escapeHtml(r.name)}">` : ''}
          <h3>${escapeHtml(r.name)}</h3>
          <div class="rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          <p>${escapeHtml(currentMessage)}</p>
      `;
      return card;
  }

  function renderReviews() {
      track.innerHTML = '';
      reviews.forEach(r => track.appendChild(makeCard(r)));
      
      // Добавляем клоны для бесконечного слайдера
      if (reviews.length > 0) {
          const firstClone = makeCard(reviews[0]);
          const lastClone = makeCard(reviews[reviews.length - 1]);
          track.insertBefore(lastClone.cloneNode(true), track.firstChild);
          track.appendChild(firstClone.cloneNode(true));
      }
      
      initSlider();
  }

  function initSlider() {
      let slides = Array.from(track.children);

      function calcSlideWidth() {
          const sample = slides[1] || slides[0];
          const rect = sample.getBoundingClientRect();
          const style = window.getComputedStyle(sample);
          const marginRight = parseFloat(style.marginRight) || 0;
          return Math.round(rect.width + marginRight);
      }

      let slideWidth = calcSlideWidth();
      let index = 1;
      track.style.transform = `translateX(-${index * slideWidth}px)`;
      track.style.transition = 'transform 0.6s ease';

      function goTo(newIndex) {
          index = newIndex;
          track.style.transition = 'transform 0.6s ease';
          track.style.transform = `translateX(-${index * slideWidth}px)`;
      }
      
      // Функции для стрелок
      function goNext() {
          goTo(index + 1);
      }
      
      function goPrev() {
          goTo(index - 1);
      }

      track.addEventListener('transitionend', () => {
          slides = Array.from(track.children);
          if (index === slides.length - 1) {
              track.style.transition = 'none';
              index = 1;
              track.style.transform = `translateX(-${index * slideWidth}px)`;
              track.getBoundingClientRect();
              track.style.transition = 'transform 0.6s ease';
          }
          if (index === 0) {
              track.style.transition = 'none';
              index = slides.length - 2;
              track.style.transform = `translateX(-${index * slideWidth}px)`;
              track.getBoundingClientRect();
              track.style.transition = 'transform 0.6s ease';
          }
      });

      let autoplayInterval = 3500;
      let timer = null;
      function startAutoplay() { stopAutoplay(); timer = setInterval(() => goTo(index + 1), autoplayInterval); }
      function stopAutoplay() { if (timer) { clearInterval(timer); timer = null; } }
      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', startAutoplay);
      
      // Обработчики стрелок
      const prevBtn = document.getElementById('sliderPrev');
      const nextBtn = document.getElementById('sliderNext');
      
      if (prevBtn) {
          prevBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              goPrev();
          });
      }
      
      if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              goNext();
          });
      }

      window.addEventListener('resize', () => {
          slides = Array.from(track.children);
          slideWidth = calcSlideWidth();
          track.style.transition = 'none';
          track.style.transform = `translateX(-${index * slideWidth}px)`;
          track.getBoundingClientRect();
          track.style.transition = 'transform 0.6s ease';
      });

      startAutoplay();
  }

  // Инициализация рейтинга звезд
  const stars = document.querySelectorAll("#rating-stars span");
  const ratingValue = document.getElementById("rating-value");
  if (stars && ratingValue) {
      stars.forEach(s => {
          s.addEventListener("click", () => {
              const r = s.dataset.rate;
              ratingValue.value = r;
              stars.forEach(st => st.classList.toggle("active", st.dataset.rate <= r));
          });
          s.addEventListener("mouseenter", () => {
              const r = s.dataset.rate;
              stars.forEach(st => st.classList.toggle("active", st.dataset.rate <= r));
          });
          s.addEventListener("mouseleave", () => {
              const cur = parseInt(ratingValue.value) || 0;
              stars.forEach(st => st.classList.toggle("active", st.dataset.rate <= cur));
          });
      });
  }

  // Загрузка отзывов из БД
  async function loadReviewsFromDB() {
      try {
          const response = await fetch("backend/reviews_api.php");
          const result = await response.json();
          
          if (result.success && result.data.length > 0) {
              // Добавляем отзывы из БД к статическим
              result.data.forEach(r => {
                  // Проверяем что такого отзыва ещё нет
                  const exists = reviews.some(rev => rev.name === r.name && rev.message?.ru === r.text);
                  if (!exists) {
                      reviews.push({
                          name: r.name,
                          rating: parseInt(r.rating) || 5,
                          message: {
                              ru: r.text || '',
                              kk: r.text || '',
                              en: r.text || ''
                          },
                          avatar: '',
                          fromDB: true
                      });
                  }
              });
              renderReviews();
          }
      } catch (err) {
          console.error("Пікірлерді жүктеу қатесі:", err);
      }
  }

  // Обработка формы
  const form = document.getElementById("review-form");
  const feedback = document.getElementById("review-feedback");
  if (form) {
      form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const fd = new FormData(form);
          
          const name = fd.get("name") || getTranslation('reviews_anonymous');
          const rating = parseInt(fd.get("rating") || 5);
          const message = fd.get("message") || '';
          
          // Отправляем в БД
          try {
              const response = await fetch("backend/reviews_api.php", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, rating, message })
              });
              
              const result = await response.json();
              
              if (result.success) {
                  // Добавляем в локальный массив
                  const newReview = {
                      name: name,
                      rating: rating,
                      message: {
                          ru: message,
                          kk: message,
                          en: message
                      },
                      avatar: '',
                      fromDB: true
                  };
                  
                  reviews.push(newReview);
                  renderReviews();
                  
                  if (feedback) {
                      feedback.textContent = getTranslation('reviews_thank_you') || 'Пікіріңіз үшін рахмет!';
                      feedback.style.color = '#2ecc71';
                      setTimeout(() => feedback.textContent = '', 3500);
                  }
                  
                  form.reset();
                  ratingValue.value = 0;
                  if (stars) stars.forEach(st => st.classList.remove('active'));
              } else {
                  if (feedback) {
                      feedback.textContent = result.message || 'Қате кетті';
                      feedback.style.color = '#e74c3c';
                  }
              }
          } catch (err) {
              console.error("Пікір жіберу қатесі:", err);
              if (feedback) {
                  feedback.textContent = 'Сервер қатесі';
                  feedback.style.color = '#e74c3c';
              }
          }
      });
  }

  // Первоначальная отрисовка
  renderReviews();
  
  // Загружаем отзывы из БД
  loadReviewsFromDB();

  // Обновление отзывов при смене языка
  if (window.langThemeManager) {
      // Слушаем изменения языка и перерисовываем отзывы
      const originalChangeLanguage = window.langThemeManager.changeLanguage;
      window.langThemeManager.changeLanguage = function(lang) {
          originalChangeLanguage.call(this, lang);
          renderReviews();
      };
  }
});