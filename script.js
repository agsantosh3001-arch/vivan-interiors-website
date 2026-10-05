(() => {
  const canvas = document.querySelector('#sequence');
  const ctx = canvas.getContext('2d', { alpha: false });
  const story = document.querySelector('.story');
  const copy = document.querySelector('.hero-copy');
  const topbar = document.querySelector('.topbar');
  const chrome = document.querySelectorAll('.caption, .progress');
  const openingCard = document.querySelector('.opening-card');
  const openingDim = document.querySelector('.opening-dim');
  const endDim = document.querySelector('.end-dim');
  const progress = document.querySelector('#progress');
  const total = 240;
  const images = new Map();
  let width = 0, height = 0, dpr = 1, current = 0, lastDrawn = -1, raf = 0;

  const urlFor = (index) => `./FRAMES%20JPG/ezgif-frame-${String(index + 1).padStart(3, '0')}.jpg`;
  function load(index) {
    if (index < 0 || index >= total || images.has(index)) return;
    const img = new Image();
    img.decoding = 'async';
    images.set(index, img);
    img.onload = () => { if (index === current || index === 0) draw(); };
    img.src = urlFor(index);
  }
  function warm(center) {
    const start = Math.max(0, Math.floor(center) - 2);
    const end = Math.min(total - 1, start + 13);
    for (let i = start; i <= end; i++) load(i);
    for (const key of images.keys()) if (key < start - 3 || key > end + 3) images.delete(key);
  }
  function resize() {
    const rect = canvas.getBoundingClientRect();
    // Preserve sharpness on high-density screens; the sequence is only drawn
    // once per displayed frame so this larger backing store stays responsive.
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    draw();
  }
  function paint(index, alpha) {
    const img = images.get(index);
    if (!img || !img.complete || !img.naturalWidth) return false;
    ctx.globalAlpha = alpha;
    // Fill the viewport at every aspect ratio. On portrait screens this crops
    // the sides of the landscape source instead of adding a blurred backdrop.
    const sourceRatio = img.naturalWidth / img.naturalHeight;
    const viewportRatio = width / height;
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (sourceRatio > viewportRatio) {
      sw = img.naturalHeight * viewportRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / viewportRatio;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
    return true;
  }
  function draw() {
    const a = Math.max(0, Math.min(total - 1, current));
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#e9e3da'; ctx.fillRect(0, 0, width, height);
    if (!paint(a, a === 0 ? .88 : 1)) {
      let nearest = a;
      for (let d = 1; d < 15 && !images.get(nearest)?.complete; d++) {
        if (images.get(a - d)?.complete) nearest = a - d;
        else if (images.get(a + d)?.complete) nearest = a + d;
      }
      paint(nearest, 1);
    }
    ctx.globalAlpha = 1;
    lastDrawn = a;
  }
  function update() {
    raf = 0;
    const max = story.offsetHeight - window.innerHeight;
    const p = Math.max(0, Math.min(1, -story.getBoundingClientRect().top / max));
    // Finish the image sequence before the final title card begins.
    const openingTransition = .09;
    const sequenceProgress = Math.max(0, Math.min(1, (p - openingTransition) / (.82 - openingTransition)));
    const frame = Math.round(sequenceProgress * (total - 1));
    if (frame !== current || lastDrawn < 0) {
      current = frame;
      warm(current);
      draw();
    }
    if (progress) progress.style.transform = `scaleX(${p})`;
    const titleProgress = Math.max(0, Math.min(1, (p - .91) / .07));
    if (copy) {
      copy.style.opacity = String(titleProgress);
      copy.style.transform = `translateY(${(1 - titleProgress) * 12}px)`;
    }
    if (endDim) endDim.style.opacity = String(Math.max(0, Math.min(.4, (p - .78) * 5)));
    if (topbar) topbar.classList.toggle('is-over-dark', p >= .82);
    const chromeOpacity = String(1 - Math.max(0, Math.min(1, (p - .86) / .06)));
    chrome.forEach((element) => { element.style.opacity = chromeOpacity; });
    const openingOpacity = 1 - Math.max(0, Math.min(1, p / openingTransition));
    if (openingCard) openingCard.style.opacity = String(openingOpacity);
    if (openingDim) openingDim.style.opacity = String(.36 * (1 - Math.max(0, Math.min(1, p / .16))));
  }
  function request() { if (!raf) raf = requestAnimationFrame(update); }
  load(0);
  warm(0);
  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', request, { passive: true });
  request();
})();
