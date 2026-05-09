'use strict';
(function initReadingProgress() {
  const bar = document.querySelector('.reading-progress');
  if (!bar) return;

  function update() {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = `${Math.min(progress, 100).toFixed(1)}%`;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
(function initTocHighlight() {
  const tocLinks = document.querySelectorAll('.toc__link');
  const articles = document.querySelectorAll('article[id]');

  if (!tocLinks.length || !articles.length) return;

  let activeId = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const id         = entry.target.getAttribute('id');
      const activeLink = document.querySelector(`.toc__link[href="#${id}"]`);

      if (!activeLink) return;
      if (activeId !== id) {
        activeId = id;
        console.log('[toc] active', id);
      }
      tocLinks.forEach(link => link.classList.remove('active'));
      activeLink.classList.add('active');
    });
  }, {
    rootMargin: '-10% 0px -70% 0px',
    threshold:  0,
  });

  articles.forEach(article => observer.observe(article));
})();
