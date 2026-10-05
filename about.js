(() => {
  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        activeObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const heroPhoto = document.querySelector('.hero-image');
  if (!heroPhoto || reduceMotion) return;
  let scheduled = false;
  const movePhoto = () => {
    const rect = heroPhoto.getBoundingClientRect();
    const distance = (window.innerHeight - rect.top) / (window.innerHeight + rect.height) - .5;
    heroPhoto.style.setProperty('--photo-shift', `${Math.max(-12, Math.min(12, distance * 22))}px`);
    scheduled = false;
  };
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(movePhoto);
  }, { passive: true });
  movePhoto();
})();
