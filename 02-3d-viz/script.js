(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header: scroll state + mobile menu */
  const header = document.querySelector('.header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  /* Reveal on scroll */
  const reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(el);
    });
  }

  /* Gallery filters */
  const filters = document.querySelectorAll('.filter');
  const cards = Array.from(document.querySelectorAll('.card'));
  filters.forEach((btn) => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    cards.forEach((c) => {
      const show = f === 'all' || c.dataset.type === f;
      if (show) {
        c.classList.remove('is-hidden');
        if (!reduce) {
          c.classList.add('is-fading');
          requestAnimationFrame(() => requestAnimationFrame(() => c.classList.remove('is-fading')));
        }
      } else {
        c.classList.add('is-hidden');
      }
    });
  }));

  /* Lightbox */
  const lb = document.getElementById('lightbox');
  const lbImg = lb.querySelector('.lightbox__img');
  const lbCap = lb.querySelector('.lightbox__cap');
  let current = 0;
  let lastFocus = null;
  const visibleBtns = () => cards.filter((c) => !c.classList.contains('is-hidden')).map((c) => c.querySelector('.card__btn'));

  const show = (i) => {
    const list = visibleBtns();
    if (!list.length) return;
    current = (i + list.length) % list.length;
    const b = list[current];
    lbImg.src = b.dataset.full;
    lbImg.alt = b.querySelector('img').alt;
    lbCap.textContent = b.dataset.caption || '';
  };
  const open = (btn) => {
    lastFocus = btn;
    show(visibleBtns().indexOf(btn));
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => lb.classList.add('is-open'));
    lb.querySelector('.lightbox__close').focus();
  };
  const close = () => {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { lb.hidden = true; }, reduce ? 0 : 300);
    if (lastFocus) lastFocus.focus();
  };

  document.getElementById('gallery').addEventListener('click', (e) => {
    const btn = e.target.closest('.card__btn');
    if (btn) open(btn);
  });
  lb.querySelector('.lightbox__close').addEventListener('click', close);
  lb.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(current - 1));
  lb.querySelector('.lightbox__nav--next').addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'Tab') {
      const f = Array.from(lb.querySelectorAll('button'));
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  /* Before / after slider */
  const ba = document.getElementById('ba');
  const range = ba.querySelector('.ba__range');
  // Плавная шторка: целевая позиция догоняется lerp в rAF
  let posCur = 50, posTarget = 50, raf = 0;
  const paint = (p) => ba.style.setProperty('--pos', `${p}%`);
  const tick = () => {
    posCur += (posTarget - posCur) * 0.18;
    if (Math.abs(posTarget - posCur) < 0.05) { posCur = posTarget; raf = 0; paint(posCur); return; }
    paint(posCur);
    raf = requestAnimationFrame(tick);
  };
  const setPos = (v) => {
    posTarget = Math.max(0, Math.min(100, v));
    range.value = String(Math.round(posTarget));
    if (reduce) { posCur = posTarget; paint(posCur); return; }
    if (!raf) raf = requestAnimationFrame(tick);
  };
  range.addEventListener('input', () => setPos(Number(range.value)));
  const fromPointer = (e) => {
    const r = ba.getBoundingClientRect();
    setPos(((e.clientX - r.left) / r.width) * 100);
  };
  let dragging = false;
  ba.addEventListener('pointerdown', (e) => {
    dragging = true; ba.classList.add('is-dragging');
    fromPointer(e);
  });
  window.addEventListener('pointermove', (e) => { if (dragging) fromPointer(e); });
  window.addEventListener('pointerup', () => { dragging = false; ba.classList.remove('is-dragging'); });

  /* Clip-path reveal for gallery cards */
  if (!reduce && 'IntersectionObserver' in window) {
    const mio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); mio.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    cards.forEach((c, i) => {
      c.classList.add('mask');
      c.style.transitionDelay = `${(i % 3) * 90}ms`;
      mio.observe(c);
    });
    filters.forEach((b) => b.addEventListener('click', () => cards.forEach((c) => c.classList.add('is-in'))));
  }

  /* Tilt (mouse only, ≤ 6°) */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduce && canHover) {
    const MAX = 6;
    document.querySelectorAll('.card__btn').forEach((btn) => {
      let fr = 0;
      btn.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(fr);
        fr = requestAnimationFrame(() => {
          btn.classList.add('is-tilting');
          btn.style.setProperty('--ry', `${(x * 2 * MAX).toFixed(2)}deg`);
          btn.style.setProperty('--rx', `${(-y * 2 * MAX).toFixed(2)}deg`);
        });
      });
      btn.addEventListener('pointerleave', () => {
        cancelAnimationFrame(fr);
        btn.classList.remove('is-tilting');
        btn.style.setProperty('--rx', '0deg');
        btn.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* Form (no submission) */
  const form = document.getElementById('form');
  const status = document.getElementById('form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = Array.from(form.querySelectorAll('[required]'));
    let ok = true;
    required.forEach((inp) => {
      const bad = !inp.value.trim();
      inp.closest('.field').classList.toggle('is-invalid', bad);
      inp.setAttribute('aria-invalid', String(bad));
      if (bad) ok = false;
    });
    if (!ok) {
      status.classList.add('is-error');
      status.textContent = 'Пожалуйста, укажите имя и способ связи.';
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    const name = form.elements.name.value.trim();
    status.classList.remove('is-error');
    status.textContent = `Спасибо, ${name}! Заявка принята — отвечу в течение дня. (Демо: данные никуда не отправлены.)`;
    form.reset();
  });
})();

// не даем браузеру тащить картинку вместо шторки
document.querySelectorAll('.ba').forEach(el => {
  el.addEventListener('dragstart', e => e.preventDefault());
  el.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') e.preventDefault(); });
});
