// Анимация карточек при скролле
const plans = document.querySelectorAll('.plan-card, .reason');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

plans.forEach(plan => observer.observe(plan));

// Добавим плавное проявление
const style = document.createElement('style');
style.textContent = `
.visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
.plan-card, .reason {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}
`;
document.head.appendChild(style);

// Обработка нажатия кнопки “Выбрать”
document.querySelectorAll('.plan-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const plan = btn.parentElement.querySelector('h2').textContent;
    alert(`✅ Тариф «${plan}» выбран.\nФункция оплаты будет доступна после подключения базы данных.`);
  });
});
