(() => {
  const cards = [...document.querySelectorAll('.gallery-card')];
  if (!cards.length) return;
  const masonry = document.querySelector('.home-gallery-grid');
  const masonryCards = masonry ? [...masonry.querySelectorAll('.gallery-card')] : [];

  document.documentElement.classList.add('gallery-ready');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let layoutFrame = 0;
  const layoutMasonry = () => {
    if (!masonry || !masonryCards.length) return;
    const gridWidth = masonry.clientWidth;
    if (!gridWidth) return;
    const styles = getComputedStyle(masonry);
    const columns = styles.gridTemplateColumns.split(' ').length;
    const rowSize = parseFloat(styles.gridAutoRows);
    const rowGap = parseFloat(styles.rowGap) || 0;
    const columnGap = parseFloat(styles.columnGap) || 0;
    const columnWidth = (gridWidth - columnGap * (columns - 1)) / columns;
    masonryCards.forEach((card) => {
      const image = card.querySelector('img');
      const sourceWidth = image.naturalWidth || Number(image.getAttribute('width'));
      const sourceHeight = image.naturalHeight || Number(image.getAttribute('height'));
      if (!sourceWidth || !sourceHeight) return;
      const targetHeight = columnWidth / (sourceWidth / sourceHeight);
      const rowSpan = Math.max(1, Math.ceil((targetHeight + rowGap) / (rowSize + rowGap)));
      card.style.gridRowEnd = `span ${rowSpan}`;
    });
  };
  const scheduleMasonry = () => {
    if (layoutFrame) cancelAnimationFrame(layoutFrame);
    layoutFrame = requestAnimationFrame(() => {
      layoutFrame = 0;
      layoutMasonry();
    });
  };
  masonryCards.forEach((card) => card.querySelector('img').addEventListener('load', scheduleMasonry));
  scheduleMasonry();
  window.addEventListener('resize', scheduleMasonry, { passive: true });
  if (masonry && 'ResizeObserver' in window) {
    const gridObserver = new ResizeObserver(scheduleMasonry);
    gridObserver.observe(masonry);
  }

  const reveal = (card, index) => {
    card.style.setProperty('--reveal-delay', `${(index % 3) * 90}ms`);
    card.classList.add('is-visible');
  };

  if (reduceMotion || !('IntersectionObserver' in window)) {
    cards.forEach(reveal);
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target, cards.indexOf(entry.target));
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    cards.forEach((card) => observer.observe(card));
  }

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    cards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty('--tilt-x', `${x * 2.2}deg`);
        card.style.setProperty('--tilt-y', `${y * -2.2}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }
})();
