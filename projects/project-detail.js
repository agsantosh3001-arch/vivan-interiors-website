(() => {
  const slug = window.location.pathname.split('/').filter(Boolean).pop();
  const project = window.VIVAN_PROJECTS?.find((item) => item.slug === slug);
  if (!project) return;

  const $ = (selector) => document.querySelector(selector);
  const galleryRoot = $('#project-photo-grid');
  const lightbox = $('#project-lightbox');
  const lightboxImage = $('#lightbox-image');
  const counter = $('#lightbox-counter');
  const caption = $('#lightbox-caption');
  const photoPath = (file) => `./images/${file}`;
  const galleryFigures = [];
  const useBalancedGallery = project.balancedGallery === true;
  let galleryLayoutFrame = 0;
  let lastGalleryWidth = 0;
  let activeImage = 0;
  let touchStartX = 0;

  document.title = `${project.name} | Vivan Interiors`;
  $('#detail-title').textContent = project.name;
  $('#detail-site').textContent = project.siteName;
  $('#project-detail-hero').style.backgroundImage = `url("${photoPath(project.hero || project.gallery[20].file)}")`;
  $('#detail-description').textContent = project.projectDescription;
  $('#info-project').textContent = project.name;
  $('#info-type').textContent = project.type;
  $('#info-location').textContent = `${project.siteName}, ${project.location}`;
  $('#info-status').textContent = project.status;
  $('#detail-approach-copy').textContent = project.approach;
  $('#detail-closing-copy').textContent = project.closing;

  const openImage = (index) => {
    activeImage = (index + project.gallery.length) % project.gallery.length;
    const item = project.gallery[activeImage];
    lightboxImage.src = photoPath(item.file);
    lightboxImage.alt = item.alt;
    counter.textContent = `${String(activeImage + 1).padStart(2, '0')} / ${String(project.gallery.length).padStart(2, '0')}`;
    caption.textContent = item.alt;
    if (!lightbox.open) lightbox.showModal();
  };
  const step = (amount) => openImage(activeImage + amount);

  project.gallery.forEach((item, index) => {
    const figure = document.createElement('figure');
    figure.className = 'project-photo';
    figure.setAttribute('role', 'listitem');
    const button = document.createElement('button');
    button.className = 'project-photo-button';
    button.type = 'button';
    button.setAttribute('aria-label', `Open image ${index + 1}: ${item.alt}`);
    const image = document.createElement('img');
    image.src = photoPath(item.file);
    image.alt = item.alt;
    image.width = item.width;
    image.height = item.height;
    image.loading = 'lazy';
    image.decoding = 'async';
    button.append(image);
    button.addEventListener('click', () => openImage(index));
    figure.append(button);
    galleryFigures.push(figure);
  });

  const layoutGallery = () => {
    galleryLayoutFrame = 0;
    const galleryWidth = galleryRoot.clientWidth;
    if (!useBalancedGallery) return;
    if (!galleryWidth || !galleryFigures.length || Math.abs(galleryWidth - lastGalleryWidth) < 1) return;
    lastGalleryWidth = galleryWidth;
    const styles = getComputedStyle(galleryRoot);
    const columnCount = window.matchMedia('(max-width: 720px)').matches ? 2 : 3;
    const columnGap = parseFloat(styles.columnGap) || 0;
    const columnWidth = (galleryWidth - columnGap * (columnCount - 1)) / columnCount;
    const items = galleryFigures.map((figure, index) => {
      const image = figure.querySelector('img');
      const width = Number(image.getAttribute('width')) || image.naturalWidth || 1;
      const height = Number(image.getAttribute('height')) || image.naturalHeight || 1;
      return { figure, index, height: columnWidth * height / width };
    }).sort((a, b) => b.height - a.height || a.index - b.index);
    const columns = Array.from({ length: columnCount }, () => ({ height: 0, items: [] }));
    items.forEach((item) => {
      const column = columns.reduce((shortest, current) => current.height < shortest.height ? current : shortest);
      column.items.push(item);
      column.height += item.height + columnGap;
    });
    const columnNodes = columns.map((column) => {
      const node = document.createElement('div');
      node.className = 'project-photo-column';
      node.setAttribute('role', 'presentation');
      column.items.sort((a, b) => a.index - b.index).forEach(({ figure }) => node.append(figure));
      return node;
    });
    galleryRoot.replaceChildren(...columnNodes);
  };
  const requestGalleryLayout = () => {
    if (galleryLayoutFrame) cancelAnimationFrame(galleryLayoutFrame);
    galleryLayoutFrame = requestAnimationFrame(layoutGallery);
  };
  if (useBalancedGallery) {
    galleryRoot.classList.add('is-balanced');
    requestGalleryLayout();
  } else {
    galleryFigures.forEach((figure) => galleryRoot.append(figure));
  }
  if (useBalancedGallery && 'ResizeObserver' in window) {
    const galleryObserver = new ResizeObserver(requestGalleryLayout);
    galleryObserver.observe(galleryRoot);
  } else if (useBalancedGallery) {
    window.addEventListener('resize', requestGalleryLayout, { passive: true });
  }

  $('#project-detail-shots').append(...project.details.map((item) => {
    const figure = document.createElement('figure');
    figure.className = 'detail-shot';
    const index = project.gallery.findIndex((photo) => photo.file === item.file);
    const button = document.createElement('button');
    button.className = 'project-photo-button';
    button.type = 'button';
    button.setAttribute('aria-label', `Open detail: ${item.alt}`);
    const image = document.createElement('img');
    image.src = photoPath(item.file);
    image.alt = item.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    button.append(image);
    button.addEventListener('click', () => openImage(index));
    figure.append(button);
    return figure;
  }));

  $('#lightbox-close').addEventListener('click', () => lightbox.close());
  $('.lightbox-prev').addEventListener('click', () => step(-1));
  $('.lightbox-next').addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
  });
  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0]?.clientX || 0;
  }, { passive: true });
  lightbox.addEventListener('touchend', (event) => {
    const distance = (event.changedTouches[0]?.clientX || touchStartX) - touchStartX;
    if (Math.abs(distance) < 45) return;
    step(distance < 0 ? 1 : -1);
  }, { passive: true });
})();
