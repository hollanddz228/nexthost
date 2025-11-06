// js/reviews.js — исправленная версия под твою HTML-структуру с аватарками
document.addEventListener("DOMContentLoaded", () => {
    const reviews = [
      { name: "Нурбек", rating: 5, message: "NextHost — просто огонь! Мой сайт грузится мгновенно!", avatar: "images/nurbek.jpg" },
      { name: "Нурдаулет", rating: 4, message: "Отличный сервис и отзывчивая поддержка!", avatar: "images/nurda.jpg" },
      { name: "Альфараби", rating: 5, message: "Использую уже 6 месяцев, никаких проблем!", avatar: "images/alfa.jpg" },
      { name: "Асельхан", rating: 5, message: "Дизайн панели крутой и всё понятно!", avatar: "images/aselya.jpg" },
      { name: "Райхан", rating: 5, message: "Настоящий премиум-хостинг, респект команде NextHost!", avatar: "images/raikhan.jpg" },
      { name: "Арлан", rating: 4, message: "Хорошая скорость, можно чуть дешевле 😅", avatar: "images/arlan.jpg" },
      { name: "Ануар", rating: 5, message: "Все работает стабильно, доволен!", avatar: "images/anuar.jpg" },
      { name: "Мухаммедали", rating: 5, message: "Перешел с другого хостинга — не пожалел!", avatar: "images/muha.jpg" },
    ];
  
    const slider = document.querySelector('.reviews-slider');
    const track = document.getElementById('reviews-track');
  
    if (!slider) return console.error('reviews.js: .reviews-slider не найден в DOM');
    if (!track) return console.error('reviews.js: #reviews-track не найден в DOM');
  
    track.innerHTML = '';
    track.classList.add('reviews-track');

    function escapeHtml(s) {
      return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
  
    function makeCard(r) {
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        ${r.avatar ? `<img src="${r.avatar}" alt="${escapeHtml(r.name)}">` : ''}
        <h3>${escapeHtml(r.name)}</h3>
        <div class="rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        <p>${escapeHtml(r.message)}</p>
      `;
      return card;
    }
  
    reviews.forEach(r => track.appendChild(makeCard(r)));

    const firstClone = makeCard(reviews[0]);
    const lastClone = makeCard(reviews[reviews.length - 1]);
    track.insertBefore(lastClone.cloneNode(true), track.firstChild);
    track.appendChild(firstClone.cloneNode(true));
  
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

    window.addEventListener('resize', () => {
      slides = Array.from(track.children);
      slideWidth = calcSlideWidth();
      track.style.transition = 'none';
      track.style.transform = `translateX(-${index * slideWidth}px)`;
      track.getBoundingClientRect();
      track.style.transition = 'transform 0.6s ease';
    });

    startAutoplay();

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

    const form = document.getElementById("review-form");
    const feedback = document.getElementById("review-feedback");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const newReview = {
          name: fd.get("name") || 'Аноним',
          rating: parseInt(fd.get("rating") || 5),
          message: fd.get("message") || '',
          avatar: fd.get("avatar") || '' // здесь можно добавить ссылку на аватар из формы
        };
  
        reviews.push(newReview);
        const newCard = makeCard(newReview);
        track.insertBefore(newCard, track.lastElementChild);
        slides = Array.from(track.children);
        slideWidth = calcSlideWidth();
  
        if (feedback) {
          feedback.textContent = '✅ Спасибо! Отзыв добавлен локально.';
          setTimeout(() => feedback.textContent = '', 3500);
        }
        form.reset();
        ratingValue.value = 0;
        if (stars) stars.forEach(st => st.classList.remove('active'));
  
        goTo(slides.length - 2);
      });
    }
  });

const cards = document.querySelectorAll('.review-card');
let currentIndex = 0;

function showSlide(index) {
  cards.forEach((card, i) => {
    card.classList.remove('active');
    card.style.transform = `translateX(${100 * (i - index)}%)`;
  });
  cards[index].classList.add('active');
}

showSlide(currentIndex);

setInterval(() => {
  currentIndex = (currentIndex + 1) % cards.length;
  showSlide(currentIndex);
}, 4000);
