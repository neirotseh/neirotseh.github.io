(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 900px)');

  /* Меню */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* Проявка (сепия -> цвет) и появление блоков */
  const devs = document.querySelectorAll('.dev');
  const reveals = document.querySelectorAll('.reveal');
  if (reduce.matches || !('IntersectionObserver' in window)) {
    devs.forEach((d) => d.classList.add('is-dev'));
    reveals.forEach((r) => r.classList.add('is-in'));
  } else {
    const devIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const img = el.querySelector('img');
        const go = () => setTimeout(() => el.classList.add('is-dev'), 250);
        if (img && !img.complete) img.addEventListener('load', go, { once: true });
        else go();
        devIO.unobserve(el);
      });
    }, { threshold: 0.35 });
    devs.forEach((d) => devIO.observe(d));

    const revIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revIO.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((r) => revIO.observe(r));
  }

  /* Лента кадров: вертикальный скролл -> горизонтальный сдвиг (десктоп) */
  const film = document.getElementById('film');
  const track = document.getElementById('filmTrack');
  const viewport = document.getElementById('filmViewport');
  let pinned = false, start = 0, dist = 0, ticking = false, lastX = -1;

  const measure = () => {
    const want = desktop.matches && !reduce.matches;
    if (!want) {
      if (pinned) {
        pinned = false;
        film.classList.remove('is-pinned');
        film.style.height = '';
        track.style.transform = '';
      }
      return;
    }
    pinned = true;
    film.classList.add('is-pinned');
    track.style.transform = 'translate3d(0,0,0)';
    dist = Math.max(0, track.scrollWidth - viewport.clientWidth);
    film.style.height = (window.innerHeight + dist) + 'px';
    start = film.getBoundingClientRect().top + window.scrollY;
    lastX = -1;
    update();
  };

  const update = () => {
    ticking = false;
    if (!pinned) return;
    const p = Math.min(1, Math.max(0, (window.scrollY - start) / (dist || 1)));
    const x = Math.round(p * dist);
    if (x !== lastX) {
      track.style.transform = `translate3d(${-x}px,0,0)`;
      lastX = x;
    }
  };

  window.addEventListener('scroll', () => {
    if (pinned && !ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  let rt;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(measure, 150); };
  window.addEventListener('resize', onResize, { passive: true });
  desktop.addEventListener('change', measure);
  reduce.addEventListener('change', measure);
  window.addEventListener('load', measure);
  measure();

  /* Выбор пакета из карточки цены */
  const packSelect = document.getElementById('packSelect');
  document.querySelectorAll('[data-pack]').forEach((a) => {
    a.addEventListener('click', () => { packSelect.value = a.dataset.pack; });
  });

  /* Форма брони (без отправки) */
  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('formMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstBad = null;
    form.querySelectorAll('[required]').forEach((f) => {
      const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim();
      const wrap = f.closest('.field');
      if (wrap) wrap.classList.toggle('is-error', bad);
      if (bad && !firstBad) firstBad = f;
    });
    if (firstBad) {
      msg.className = 'form__msg is-err';
      msg.textContent = 'Заполните, пожалуйста, отмеченные поля и согласие на обработку данных.';
      firstBad.focus();
      return;
    }
    const names = form.names.value.trim();
    const d = form.date.value ? new Date(form.date.value + 'T12:00:00') : null;
    const dateText = d ? d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    msg.className = 'form__msg is-ok';
    msg.textContent = `Спасибо, ${names}! Проверю ${dateText} и напишу вам в течение дня.`;
    form.reset();
    packSelect.value = 'Репортаж 10 часов';
  });
  form.addEventListener('input', (e) => {
    const wrap = e.target.closest('.field');
    if (wrap) wrap.classList.remove('is-error');
  });
})();
