(() => {
  const doc = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');

  // Шапка: фон при скролле
  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Бургер
  const burger = document.getElementById('burger');
  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  burger.addEventListener('click', () => setOpen(!header.classList.contains('is-open')));
  document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  // Появление при скролле
  const items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
  } else {
    // легкий каскад внутри одной сетки
    items.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 4) * 0.08}s`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));
    // страховка при резкой прокрутке: показываем все, что уже выше нижнего края экрана
    let tick = 0;
    window.addEventListener('scroll', () => {
      if (tick) return;
      tick = requestAnimationFrame(() => {
        tick = 0;
        document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-visible'); io.unobserve(el); }
        });
      });
    }, { passive: true });
  }

  // Пар над чашкой: ставим над ободком с учетом object-fit: cover
  const steam = document.querySelector('.steam');
  const heroImg = document.querySelector('.hero__media img');
  if (steam && heroImg && !reduce) {
    // координаты ободка чашки в долях исходного кадра (картинка отзеркалена через scaleX(-1))
    const CUP = { x: 0.39, y: 0.545, w: 0.13 };
    const place = () => {
      const box = heroImg.parentElement.getBoundingClientRect();
      const iw = heroImg.naturalWidth || 1600, ih = heroImg.naturalHeight || 900;
      const k = Math.max(box.width / iw, box.height / ih);
      const rw = iw * k, rh = ih * k;
      const pos = getComputedStyle(heroImg).objectPosition.split(' ').map(parseFloat);
      const ox = (box.width - rw) * (pos[0] / 100), oy = (box.height - rh) * (pos[1] / 100);
      const w = rw * CUP.w, h = w * 1.7;
      steam.style.width = `${w}px`; steam.style.height = `${h}px`;
      steam.style.transform = `translate3d(${box.width - (ox + rw * CUP.x) - w / 2}px, ${oy + rh * CUP.y - h}px, 0)`;
      steam.classList.add('is-ready');
    };
    if (heroImg.complete) place(); else heroImg.addEventListener('load', place);
    let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(place, 120); });
  }

  // Свечение за курсором на карточках меню (только мышь)
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.menu__col').forEach((card) => {
      let raf = 0, x = 0, y = 0;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(() => {
          card.style.setProperty('--mx', `${x}px`); card.style.setProperty('--my', `${y}px`); raf = 0;
        });
      });
    });
  }

  // Форма: режим «столик / навынос»
  const form = document.getElementById('form');
  const msg = document.getElementById('form-msg');
  const setMode = (mode) => {
    const radio = form.querySelector(`input[name="mode"][value="${mode}"]`);
    if (radio) radio.checked = true;
    form.querySelectorAll('[data-for]').forEach((f) => { f.hidden = f.dataset.for !== mode; });
  };
  form.addEventListener('change', (e) => { if (e.target.name === 'mode') setMode(e.target.value); });
  document.querySelectorAll('a[data-mode]').forEach((a) => a.addEventListener('click', () => setMode(a.dataset.mode)));

  // Дата по умолчанию — сегодня
  const date = form.elements.date;
  const today = new Date();
  const iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  date.min = iso; date.value = iso;

  // Отправка без сервера
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements.name;
    const phone = form.elements.phone;
    const digits = phone.value.replace(/\D/g, '');
    let ok = true;
    [name, phone].forEach((f) => f.classList.remove('is-invalid'));
    if (name.value.trim().length < 2) { name.classList.add('is-invalid'); ok = false; }
    if (digits.length < 10) { phone.classList.add('is-invalid'); ok = false; }
    msg.className = 'form__msg';
    if (!ok) {
      msg.classList.add('is-err');
      msg.textContent = 'Проверьте, пожалуйста, имя и телефон.';
      return;
    }
    const mode = form.elements.mode.value;
    msg.classList.add('is-ok');
    msg.textContent = mode === 'table'
      ? `Спасибо, ${name.value.trim()}! Столик придержим — скоро перезвоним для подтверждения.`
      : `Спасибо, ${name.value.trim()}! Заказ приняли — перезвоним, когда все будет готово.`;
    form.reset();
    date.value = iso;
    setMode(mode);
  });
})();

// perf: пар крутится, только пока hero на экране
(() => {
  const hero = document.querySelector('.hero');
  if (!hero || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => hero.classList.toggle('is-off', !e.isIntersecting)).observe(hero);
})();
