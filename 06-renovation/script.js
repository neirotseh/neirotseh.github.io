(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ');

  /* картинки-заглушки: если файла нет, остается CSS-фон */
  const markMissing = img => img.classList.add('is-missing');
  $$('.ph > img').forEach(img => {
    img.addEventListener('error', () => markMissing(img));
    img.addEventListener('load', () => img.classList.remove('is-missing'));
    if (img.complete && img.naturalWidth === 0) markMissing(img);
  });

  /* шапка и меню */
  const header = $('.header'), burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- калькулятор ---------- */
  const PRICE = { cosm: 7900, cap: 14500, des: 23000 };
  const BATH = { cosm: 85000, cap: 165000, des: 260000 };
  const NAMES = { cosm: 'Косметический', cap: 'Капитальный', des: 'Дизайнерский' };
  const OPTS = {
    demo: { t: 'Демонтаж', m2: 650 },
    elec: { t: 'Электрика', m2: 1900 },
    floor: { t: 'Теплый пол', fix: 38000 },
    ceil: { t: 'Натяжные потолки', m2: 950 },
    design: { t: 'Дизайн-проект', m2: 1800 },
    clean: { t: 'Клининг', m2: 220 }
  };
  const form = $('#calcForm'), area = $('#area'), areaOut = $('#areaOut');
  const bathOut = $('#bathOut'), bMinus = $('#bathMinus'), bPlus = $('#bathPlus');
  let baths = 1;
  const counters = {};

  function countTo(el, to) {
    const st = counters[el.id] || (counters[el.id] = { v: 0, raf: 0 });
    cancelAnimationFrame(st.raf);
    if (reduce) { st.v = to; el.textContent = fmt(to); return; }
    const from = st.v, t0 = performance.now(), dur = 700;
    const tick = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      st.v = from + (to - from) * e;
      el.textContent = fmt(st.v);
      if (k < 1) st.raf = requestAnimationFrame(tick);
    };
    st.raf = requestAnimationFrame(tick);
  }

  let lastCalc = '';
  function calc() {
    const type = form.querySelector('[name=type]:checked').value;
    const s = +area.value;
    areaOut.textContent = s + ' м²';
    area.style.setProperty('--fill', ((s - area.min) / (area.max - area.min) * 100) + '%');
    bathOut.textContent = baths;
    bMinus.disabled = baths <= 0; bPlus.disabled = baths >= 4;

    const rows = [[NAMES[type] + ' ремонт, ' + s + ' м²', PRICE[type] * s]];
    if (baths) rows.push(['Санузлы × ' + baths, BATH[type] * baths]);
    const opts = $$('[name=opt]:checked', form).map(i => i.value);
    opts.forEach(k => { const o = OPTS[k]; rows.push([o.t, o.fix || o.m2 * s]); });
    const total = rows.reduce((a, r) => a + r[1], 0);

    const base = { cosm: [3, 20], cap: [6, 9], des: [9, 7] }[type];
    let weeks = base[0] + s / base[1] + Math.max(0, baths - 1) + (opts.includes('design') ? 3 : 0);
    weeks = Math.round(weeks);
    const crew = Math.min(7, 2 + Math.ceil(s / 45) + (type === 'des' ? 1 : 0));

    countTo($('#sum'), total);
    countTo($('#per'), total / s);
    countTo($('#weeks'), weeks);
    countTo($('#crew'), crew);
    $('#breakdown').innerHTML = rows.map(r => `<li><span>${r[0]}</span><span>${fmt(r[1])} ₽</span></li>`).join('');
    lastCalc = `${NAMES[type]} ремонт, ${s} м², санузлов: ${baths}, ≈ ${fmt(total)} ₽, ${weeks} нед.`;
  }
  form.addEventListener('input', calc);
  bMinus.addEventListener('click', () => { baths = Math.max(0, baths - 1); calc(); });
  bPlus.addEventListener('click', () => { baths = Math.min(4, baths + 1); calc(); });
  $('#calcCta').addEventListener('click', () => {
    $('#calcHidden').value = lastCalc;
    const p = $('#reqCalc'); p.hidden = false; p.textContent = 'Расчет: ' + lastCalc;
  });
  // первый count-up — когда калькулятор появился на экране
  let calcStarted = false;
  new IntersectionObserver((en, ob) => {
    if (en[0].isIntersecting && !calcStarted) { calcStarted = true; calc(); ob.disconnect(); }
  }, { threshold: .05 }).observe($('#calc'));

  /* ---------- до / после ---------- */
  const CASES = [
    { img: 'case1', t: 'Гостиная в ЖК «Светлая долина»', a: 'Ново-Савиновский район · вторичка 2009 года', s: '61 м²', d: '11 недель', c: '1 480 000 ₽',
      x: 'Сняли старые обои и линолеум, выровняли стены по маякам, заменили всю проводку. Дубовая инженерная доска, теплый свет, скрытый карниз.' },
    { img: 'case2', t: 'Кухня-столовая на Чистопольской', a: 'Новостройка без отделки · 3 комнаты', s: '74 м²', d: '13 недель', c: '1 960 000 ₽',
      x: 'Перенесли мойку к окну с подъемом пола под трапы, вывели 14 розеток под технику, фартук из керамогранита 60×120 без видимых швов.' },
    { img: 'case3', t: 'Санузел в сталинке на Баумана', a: 'Вахитовский район · дом 1953 года', s: '5,8 м²', d: '4 недели', c: '412 000 ₽',
      x: 'Демонтаж чугунной ванны и старой плитки до кирпича, новые стояки, гидроизоляция с проверкой проливом, инсталляция и душ с трапом.' }
  ];
  const ba = $('#ba'), baR = $('#baRange'), bImg = $('#baBefore'), aImg = $('#baAfter');
  const setW = () => ba.style.setProperty('--w', ba.clientWidth + 'px');
  setW(); addEventListener('resize', setW, { passive: true });
  let raf = 0;
  baR.addEventListener('input', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => ba.style.setProperty('--p', baR.value));
  });
  // перетаскивание пальцем/мышью по всей картинке (iOS не двигает range по тапу на дорожку)
  let dragBA = false;
  const fromX = x => { const r = ba.getBoundingClientRect(); const v = Math.max(0, Math.min(100, Math.round((x - r.left) / r.width * 100)));
    baR.value = v; ba.style.setProperty('--p', v); };
  ba.addEventListener('pointerdown', e => { dragBA = true; fromX(e.clientX); try { ba.setPointerCapture(e.pointerId); } catch (_) {} });
  ba.addEventListener('pointermove', e => { if (dragBA) fromX(e.clientX); }, { passive: true });
  ['pointerup', 'pointercancel'].forEach(t => ba.addEventListener(t, () => { dragBA = false; }));
  function showCase(i, first) {
    const c = CASES[i], info = $('#caseInfo');
    const apply = () => {
      bImg.src = `img/${c.img}-before.jpg`; aImg.src = `img/${c.img}-after.jpg`;
      bImg.alt = c.t + ' до ремонта'; aImg.alt = c.t + ' после ремонта';
      $('#caseTitle').textContent = c.t; $('#caseAddr').textContent = c.a;
      $('#caseArea').textContent = c.s; $('#caseTerm').textContent = c.d;
      $('#caseCost').textContent = c.c; $('#caseTxt').textContent = c.x;
      baR.value = 50; ba.style.setProperty('--p', 50);
      ba.classList.remove('is-switching'); info.classList.remove('is-switching');
    };
    if (first || reduce) return apply();
    ba.classList.add('is-switching'); info.classList.add('is-switching');
    setTimeout(apply, 250);
  }
  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b));
    showCase(+b.dataset.case);
  }));
  showCase(0, true);

  /* ---------- чертежная линия по этапам ---------- */
  const body = $('#stepsBody'), svg = $('#blueprint'), line = $('#bpLine'), bg = $('#bpBg');
  const steps = $$('.step'), marks = steps.map(s => $('.step__n', s));
  let len = 0, bodyTop = 0, bodyH = 0, stops = [];
  function build() {
    const br = body.getBoundingClientRect();
    bodyTop = br.top + scrollY; bodyH = br.height;
    svg.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`);
    const pts = marks.map(m => {
      const r = m.getBoundingClientRect();
      return [r.left - br.left + r.width / 2, r.top - br.top + r.height / 2];
    });
    let d = `M${pts[0][0]} ${pts[0][1] - 40}L${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      if (Math.abs(x1 - x0) < 2) d += `L${x1} ${y1}`;
      else { const my = (y0 + y1) / 2; d += `L${x0} ${my}L${x1} ${my}L${x1} ${y1}`; }
    }
    line.setAttribute('d', d); bg.setAttribute('d', d);
    len = line.getTotalLength();
    line.style.strokeDasharray = len;
    stops = pts.map(p => p[1]);
    update();
  }
  function update() {
    const center = scrollY + innerHeight * 0.6 - bodyTop;
    const k = Math.max(0, Math.min(1, center / bodyH));
    line.style.strokeDashoffset = reduce ? 0 : len * (1 - k);
    steps.forEach((s, i) => s.classList.toggle('is-on', reduce || center >= stops[i] - 10));
  }
  let tick = false;
  addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', scrollY > 10);
    if (!tick) { tick = true; requestAnimationFrame(() => { update(); tick = false; }); }
  }, { passive: true });
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); }, { passive: true });
  addEventListener('load', build);
  document.fonts && document.fonts.ready.then(build);
  build();

  /* ---------- появление блоков ---------- */
  const rvEls = $$('.head, .g-card, .review, details, .team__photo, .case__meta, .req__form');
  if (!reduce && 'IntersectionObserver' in window) {
    rvEls.forEach(e => e.classList.add('rv'));
    const io = new IntersectionObserver(en => en.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    rvEls.forEach(e => io.observe(e));
  }

  /* ---------- заявка ---------- */
  const rf = $('#reqForm'), msg = $('#reqMsg');
  rf.addEventListener('submit', e => {
    e.preventDefault();
    const name = rf.elements.name.value.trim(), phone = rf.elements.phone.value.replace(/\D/g, '');
    rf.elements.name.classList.toggle('is-err', !name);
    rf.elements.phone.classList.toggle('is-err', phone.length < 10);
    if (!name || phone.length < 10 || !rf.elements.agree.checked) {
      msg.className = 'req__msg err';
      msg.textContent = 'Проверьте имя и телефон — нужно не меньше 10 цифр.';
      return;
    }
    msg.className = 'req__msg';
    msg.textContent = `Спасибо, ${name}! Перезвоним в течение 15 минут и согласуем время замера.`;
    rf.reset(); $('#reqCalc').hidden = true;
  });
})();
