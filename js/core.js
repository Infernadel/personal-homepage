'use strict';
const CONFIG = {
  scrollHideThreshold: 80,
  revealThreshold: 0.2,
  revealRootMargin: '0px 0px -20px 0px',
};
(function initTheme() {
  const html        = document.documentElement;
  const STORAGE_KEY = 'portfolio-theme';
  const saved = localStorage.getItem(STORAGE_KEY) ?? 'light';
  html.setAttribute('data-theme', saved);

  function setToggleLabel(toggle, theme) {
    toggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'
    );
  }

  function bindToggle() {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle || toggle.dataset.themeBound === 'true') return;

    toggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next    = current === 'dark' ? 'light' : 'dark';

      html.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
      console.log('[theme] set to ' + next);
      setToggleLabel(toggle, next);
    });

    toggle.dataset.themeBound = 'true';
    setToggleLabel(toggle, html.getAttribute('data-theme') || saved);
  }

  bindToggle();
  document.addEventListener('includes:loaded', bindToggle);
})();
(function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let lastScrollY  = 0;
  let ticking      = false;

  function update() {
    const scrollY        = window.scrollY;
    const isScrollingDown = scrollY > lastScrollY;
    header.classList.toggle('scrolled', scrollY > 8);
    if (scrollY > CONFIG.scrollHideThreshold) {
      header.classList.toggle('hidden', isScrollingDown);
    } else {
      header.classList.remove('hidden');
    }

    lastScrollY = scrollY;
    ticking     = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();
(function initIncludes() {
  const targets = document.querySelectorAll('[data-include]');
  if (!targets.length) return;

  const requests = Array.from(targets).map(async target => {
    const url = target.getAttribute('data-include');
    if (!url) return;

    const cacheKey = 'include:' + url;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      target.innerHTML = cached;
    }

    try {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const html = await response.text();
      target.innerHTML = html;
      sessionStorage.setItem(cacheKey, html);
    } catch (error) {
      console.warn('[include] failed: ' + url, error);
    }
  });

  Promise.all(requests).then(() => {
    document.dispatchEvent(new Event('includes:loaded'));
  });
})();
(function initActiveNav() {
  function applyActiveNav() {
    const currentFile = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.site-nav__link').forEach(link => {
      const href = link.getAttribute('href');
      const isHome = (currentFile === '' || currentFile === 'index.html') && href === 'index.html';

      if (href === currentFile || isHome) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  applyActiveNav();
  document.addEventListener('includes:loaded', applyActiveNav);
})();
(function initReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-group');
  if (!elements.length) return;

  const START_DELAY = 150;
  let startTime = null;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < START_DELAY) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, START_DELAY - elapsed);
      } else {
        entry.target.classList.add('revealed');
      }

      observer.unobserve(entry.target);
    });
  }, {
    threshold:  CONFIG.revealThreshold,
    rootMargin: CONFIG.revealRootMargin,
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      startTime = Date.now();
      elements.forEach(el => observer.observe(el));
    });
  });
})();
(function initViewTransitions() {
  if (!document.startViewTransition) return;

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    const isInternal = (
      href.endsWith('.html') &&
      !href.startsWith('http') &&
      !href.startsWith('#') &&
      !href.startsWith('mailto') &&
      !href.startsWith('tel')
    );

    if (!isInternal) return;

    e.preventDefault();

    document.startViewTransition(() => {
      window.location.href = href;
    });
  });
})();
(function initFormValidation() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMessage = document.getElementById('form-success');

  function setValidity(field, isValid, errorMsg = '') {
    const hint = field.parentElement.querySelector('.form-hint');

    field.classList.toggle('valid',   isValid);
    field.classList.toggle('invalid', !isValid);

    if (hint) {
      hint.textContent = isValid ? '' : errorMsg;
      hint.className   = 'form-hint' + (isValid ? '' : ' form-hint--error');
    }
  }

  form.querySelectorAll('.form-input, .form-textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validateField(field);
    });
  });

  function validateField(field) {
    const value = field.value.trim();

    if (field.id === 'nama') {
      setValidity(field, value.length >= 2, 'Nama harus minimal 2 karakter.');
    } else if (field.id === 'email') {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setValidity(field, isEmail, 'Masukkan alamat email yang valid.');
    } else if (field.id === 'pesan') {
      setValidity(field, value.length >= 10, 'Pesan harus minimal 10 karakter.');
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    let allValid = true;
    form.querySelectorAll('.form-input, .form-textarea').forEach(field => {
      validateField(field);
      if (field.classList.contains('invalid') || !field.value.trim()) {
        allValid = false;
        if (!field.value.trim()) setValidity(field, false, 'Field ini wajib diisi.');
      }
    });

    if (!allValid) {
      console.log('[form] validation failed');
      return;
    }
    form.style.display = 'none';
    if (successMessage) {
      successMessage.classList.add('show');
      successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      console.log('[form] validation passed');
    }
  });

  form.addEventListener('reset', () => {
    console.log('[form] reset');
  });
})();
