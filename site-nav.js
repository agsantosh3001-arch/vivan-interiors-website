(() => {
  const headers = document.querySelectorAll('.nav-shell');
  const close = (header, focus = false) => {
    const button = header.querySelector('.menu-toggle');
    const nav = header.querySelector('.site-menu');
    if (!button || !nav) return;
    nav.classList.remove('is-open');
    header.classList.remove('menu-open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open menu');
    if (focus) button.focus();
  };

  headers.forEach((header) => {
    const button = header.querySelector('.menu-toggle');
    const nav = header.querySelector('.site-menu');
    if (!button || !nav) return;
    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', opening);
      header.classList.toggle('menu-open', opening);
      button.setAttribute('aria-expanded', String(opening));
      button.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) close(header);
    });
    document.addEventListener('click', (event) => {
      if (!header.contains(event.target)) close(header);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    headers.forEach((header) => {
      const button = header.querySelector('.menu-toggle');
      if (button?.getAttribute('aria-expanded') === 'true') close(header, true);
    });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) headers.forEach((header) => close(header));
  }, { passive: true });
})();
