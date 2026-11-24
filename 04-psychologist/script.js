(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header border on scroll (passive + rAF)
  const header = document.querySelector('.header');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('is-scrolled', scrollY > 10);
      ticking = false;
    });
  }, { passive: true });

  // mobile menu
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  // reveal
  const items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 90 + 'ms';
      io.observe(el);
    });
  }

  // breathing circle: pause offscreen, toggle by click
  const hero = document.querySelector('.hero');
  const breath = document.getElementById('breath');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => hero.classList.toggle('is-offscreen', !en.isIntersecting))
      .observe(hero);
  }
  breath.addEventListener('click', () => breath.classList.toggle('is-paused'));

  // accordion
  document.querySelectorAll('.acc__q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  // price buttons preselect format
  const form = document.getElementById('form');
  document.querySelectorAll('[data-format]').forEach((b) => {
    b.addEventListener('click', () => {
      const r = form.querySelector(`input[name="format"][value="${b.dataset.format}"]`);
      if (r) r.checked = true;
    });
  });

  // form (no sending)
  const msg = document.getElementById('formMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    ['name', 'contact'].forEach((n) => {
      const inp = form.elements[n];
      const bad = inp.value.trim().length < 2;
      inp.closest('.field').classList.toggle('is-error', bad);
      if (bad) ok = false;
    });
    const agree = form.elements.agree;
    agree.closest('.check').classList.toggle('is-error', !agree.checked);
    if (!agree.checked) ok = false;

    if (!ok) {
      msg.classList.add('is-error');
      msg.textContent = 'Пожалуйста, заполните имя, контакт и отметьте согласие.';
      return;
    }
    const name = form.elements.name.value.trim();
    msg.classList.remove('is-error');
    msg.textContent = `Спасибо, ${name}! Я напишу вам в течение дня, чтобы договориться о времени.`;
    form.reset();
  });
})();
