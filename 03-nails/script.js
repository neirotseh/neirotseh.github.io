(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* burger */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const setNav = open => { nav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню'); };
  burger.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });

  /* tabs */
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.price');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { const on = x === t; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', String(on)); });
    panels.forEach(p => { const on = p.dataset.panel === t.dataset.tab; p.hidden = !on; p.classList.toggle('is-active', on); });
  }));

  /* palette: colour spills from the drop over the section */
  const sec = document.getElementById('palette');
  const spill = sec.querySelector('.palette__spill');
  const drops = sec.querySelectorAll('.drop');
  const pName = document.getElementById('pName');
  const pDesc = document.getElementById('pDesc');
  const color = document.getElementById('color');
  let current = drops[0].dataset.c, pending = null;

  const commit = c => { sec.style.setProperty('--pbg', c); spill.classList.remove('is-run'); spill.style.transform = 'scale(0)'; pending = null; };
  let timer = 0;
  spill.addEventListener('transitionend', () => { if (pending) commit(pending); });

  function pick(drop, fromPointer) {
    const c = drop.dataset.c;
    drops.forEach(d => d.setAttribute('aria-selected', String(d === drop)));
    pName.textContent = drop.dataset.name;
    pDesc.textContent = drop.dataset.desc;
    sec.classList.toggle('is-dark', drop.dataset.dark === '1');
    if (c === current) return;
    current = c;
    if (pending) commit(pending);
    if (reduce) { commit(c); return; }
    const s = sec.getBoundingClientRect(), d = drop.getBoundingClientRect();
    const cx = d.left + d.width / 2 - s.left, cy = d.top + d.height / 2 - s.top;
    const R = Math.ceil(Math.hypot(Math.max(cx, s.width - cx), Math.max(cy, s.height - cy)));
    Object.assign(spill.style, { width: R * 2 + 'px', height: R * 2 + 'px', left: cx - R + 'px', top: cy - R + 'px', background: c });
    void spill.offsetWidth;
    spill.classList.add('is-run');
    spill.style.transform = 'scale(1)';
    pending = c;
    clearTimeout(timer);
    timer = setTimeout(() => { if (pending === c) commit(c); }, 950);
  }
  drops.forEach(d => {
    d.addEventListener('click', () => pick(d));
    if (canHover) d.addEventListener('pointerenter', () => pick(d, true));
  });
  document.getElementById('pBook').addEventListener('click', () => { color.value = pName.textContent; });

  /* reveal on scroll */
  const items = document.querySelectorAll('.section__head, .price__row, .gallery__item, .why__media, .why__list li, .review, .form');
  if (!reduce && 'IntersectionObserver' in window) {
    items.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));

    /* pause infinite animations off-screen */
    const po = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-off', !e.isIntersecting)));
    po.observe(document.querySelector('.hero'));
  }

  /* booking form */
  const form = document.getElementById('form');
  const msg = document.getElementById('formMsg');
  const date = document.getElementById('date');
  const t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset());
  date.min = t.toISOString().slice(0, 10);
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll('[required]').forEach(f => {
      let bad = !f.value.trim();
      if (f.type === 'tel') bad = f.value.replace(/\D/g, '').length < 10;
      if (f.type === 'date' && f.value && f.value < date.min) bad = true;
      f.closest('.field').classList.toggle('is-error', bad);
      if (bad) ok = false;
    });
    if (!ok) { msg.textContent = 'Проверьте отмеченные поля.'; msg.classList.add('is-error'); return; }
    const d = new Date(date.value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    msg.classList.remove('is-error');
    msg.textContent = `Спасибо, ${form.name.value.trim()}! Заявка на ${d}, ${form.time.value} принята — подтвержу запись в течение часа.`;
    form.reset();
  });
  form.addEventListener('input', e => e.target.closest('.field')?.classList.remove('is-error'));
})();
