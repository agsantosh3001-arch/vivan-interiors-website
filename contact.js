(() => {
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const form = document.querySelector('#enquiry-form');
  const status = document.querySelector('#form-status');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const digits = String(data.get('phone') || '').replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      const phone = form.elements.namedItem('phone');
      phone.setCustomValidity('Enter a phone number with 10 to 15 digits.');
      phone.reportValidity();
      phone.addEventListener('input', () => phone.setCustomValidity(''), { once: true });
      return;
    }

    const lines = [
      `Name: ${data.get('name')}`,
      `Phone: ${data.get('phone')}`,
      `Email: ${data.get('email')}`,
      `Project type: ${data.get('projectType') || 'Not specified'}`,
      `Location: ${data.get('location') || 'Not specified'}`,
      `Approximate size: ${data.get('size') || 'Not specified'}`,
      `Estimated budget: ${data.get('budget') || 'Not specified'}`,
      '',
      `Project details: ${data.get('message') || 'Not provided'}`
    ];
    const mailto = `mailto:hello@vivaninteriors.com?subject=${encodeURIComponent(`Project enquiry — ${data.get('name')}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
    status.innerHTML = '<strong>THANK YOU.</strong>Your email app should open with your enquiry. Send it there and we’ll get back to you shortly.';
    window.location.href = mailto;
  });
})();
