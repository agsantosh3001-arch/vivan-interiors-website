(() => {
  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  document.querySelectorAll('.matrix-row a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target instanceof HTMLDetailsElement) target.open = true;
    });
  });

  const openLinkedService = () => {
    if (!window.location.hash) return;
    const linkedSection = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!(linkedSection instanceof HTMLDetailsElement)) return;
    linkedSection.open = true;
    window.requestAnimationFrame(() => linkedSection.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  openLinkedService();
  window.addEventListener('hashchange', openLinkedService);

  const track = document.querySelector('.timeline-track');
  if (!track || reduceMotion) return;
  let rafPending = false;
  const updateTimeline = () => {
    const rect = track.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (window.innerHeight * .72 - rect.top) / (rect.height + window.innerHeight * .45)));
    track.style.setProperty('--timeline-progress', String(progress));
    rafPending = false;
  };
  window.addEventListener('scroll', () => {
    if (rafPending) return;
    rafPending = true;
    window.requestAnimationFrame(updateTimeline);
  }, { passive: true });
  updateTimeline();
})();
