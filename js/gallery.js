'use strict';

(function initLightbox() {
  const lightbox      = document.getElementById('lightbox');
  if (!lightbox) return;

  const lightboxImg   = lightbox.querySelector('.lightbox__img');
  const lightboxTitle = lightbox.querySelector('.lightbox__title');
  const lightboxDesc  = lightbox.querySelector('.lightbox__desc');
  const closeBtn      = lightbox.querySelector('.lightbox__close');

  function openLightbox(item) {
    const src   = item.dataset.src;
    const title = item.dataset.title   ?? '';
    const desc  = item.dataset.desc    ?? '';
    lightboxImg.src = '';
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent  = desc;
    lightbox.showModal();
    lightboxImg.src = src;
    console.log('[lightbox] open', { title, src });
  }

  function closeLightbox(reason) {
    lightbox.close();
    console.log('[lightbox] close', { reason });
  }
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Lihat foto: ${item.dataset.title ?? 'foto'}`);

    item.addEventListener('click', () => openLightbox(item));

    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });
  closeBtn?.addEventListener('click', () => closeLightbox('button'));
  lightbox.addEventListener('click', e => {
    const rect = lightbox.getBoundingClientRect();
    const clickedOutside = (
      e.clientX < rect.left   ||
      e.clientX > rect.right  ||
      e.clientY < rect.top    ||
      e.clientY > rect.bottom
    );
    if (clickedOutside) closeLightbox('backdrop');
  });
  lightbox.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox('escape');
  });
})();
