(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rub = function (n) { return n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽'; };

  /* ---------- данные ---------- */
  var SERVICES = [
    { id: 'cut', name: 'Мужская стрижка', desc: 'Машинка и ножницы, фейд или классика, мытье и укладка', time: 60, price: { master: 1800, top: 2500 } },
    { id: 'combo', name: 'Стрижка + борода', desc: 'Стрижка, моделирование бороды, контур опасной бритвой, горячее полотенце', time: 90, price: { master: 2900, top: 3800 } },
    { id: 'shave', name: 'Королевское бритье', desc: 'Распаривание, два прохода опасной бритвой, холодный компресс и бальзам', time: 45, price: { master: 1700, top: 2300 } },
    { id: 'beard', name: 'Оформление бороды', desc: 'Форма, длина, контур бритвой, масло для ухода', time: 40, price: { master: 1400, top: 1900 } },
    { id: 'kid', name: 'Детская стрижка', desc: 'Для мальчиков до 12 лет, мультфильмы на планшете по желанию', time: 45, price: { master: 1300, top: 1700 } },
    { id: 'grey', name: 'Камуфляж седины', desc: 'Тонирование головы или бороды, естественный результат на 4–6 недель', time: 30, price: { master: 1500, top: 1900 } }
  ];
  var MASTERS = [
    { id: 'timur', name: 'Тимур Галиев', short: 'Тимуру', tier: 'top', exp: '12 лет в профессии', text: 'Фейды любой сложности и короткие текстурные стрижки. Ведет обучение для мастеров зала.', img: 'master-timur' },
    { id: 'artem', name: 'Артем Ковалев', short: 'Артему', tier: 'top', exp: '9 лет в профессии', text: 'Бороды и королевское бритье. Неторопливый, внимательный к форме лица и росту волос.', img: 'master-artem' },
    { id: 'ildar', name: 'Ильдар Сафин', short: 'Ильдару', tier: 'master', exp: '5 лет в профессии', text: 'Классические стрижки с пробором и андеркаты. Любит длинные волосы и работу ножницами.', img: 'master-ildar' },
    { id: 'denis', name: 'Денис Морозов', short: 'Денису', tier: 'master', exp: '4 года в профессии', text: 'Кропы, детские стрижки и камуфляж седины. Находит общий язык с самыми юными гостями.', img: 'master-denis' }
  ];
  var TIER_NOTE = {
    master: 'Мастер — опыт от 3 лет, уверенно делает классику и фейды.',
    top: 'Топ-мастер — опыт от 8 лет, сложные формы, бороды и бритье, обучает команду.'
  };

  /* ---------- меню ---------- */
  var burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open);
    nav.classList.toggle('is-open', open);
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }); });

  /* ---------- кинетическая типографика ---------- */
  function split(el) {
    var i = 0, frag = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          part.split('').forEach(function (c) {
            var s = document.createElement('span'); s.className = 'ch'; s.textContent = c;
            s.style.setProperty('--i', i++); w.appendChild(s);
          });
          frag.appendChild(w);
        });
      } else { frag.appendChild(node.cloneNode(true)); }
    });
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    el.textContent = ''; el.appendChild(frag);
    $$('.w', el).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
  }
  var splitEls = $$('[data-split]');
  splitEls.forEach(split);

  /* ---------- появление ---------- */
  $$('.sec-head__text, .price, .tier, .masters__grid, .works__grid, .book, .reviews__grid, .cert__card, .cert__sums, .contacts__list, .hours').forEach(function (el) { el.classList.add('reveal'); });
  var toObserve = splitEls.concat($$('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    toObserve.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    toObserve.forEach(function (el) { io.observe(el); });
  }

  /* ---------- прайс ---------- */
  var tier = 'master';
  var priceList = $('#priceList');
  priceList.innerHTML = SERVICES.map(function (s) {
    return '<li class="price__row"><span class="price__name">' + s.name + '</span>' +
      '<span class="price__meta"><span class="price__time">' + s.time + ' мин</span><span class="price__val" data-id="' + s.id + '">' + rub(s.price.master) + '</span></span>' +
      '<p class="price__desc">' + s.desc + '</p></li>';
  }).join('');
  var tierBox = $('.tier');
  $$('.tier__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.tier === tier) return;
      tier = b.dataset.tier;
      $$('.tier__btn').forEach(function (x) { var on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-checked', on); });
      tierBox.classList.toggle('is-top', tier === 'top');
      $('#tierNote').textContent = TIER_NOTE[tier];
      $$('.price__val').forEach(function (v) {
        var s = SERVICES.filter(function (x) { return x.id === v.dataset.id; })[0];
        v.classList.add('is-swap');
        setTimeout(function () { v.textContent = rub(s.price[tier]); v.classList.remove('is-swap'); }, reduce ? 0 : 200);
      });
    });
  });

  /* ---------- мастера ---------- */
  $('#mastersGrid').innerHTML = MASTERS.map(function (m) {
    var src = 'img/' + m.img + '.jpg';
    return '<article class="mcard">' +
      '<div class="duo" data-initial="' + m.name.charAt(0) + '">' +
        '<img class="duo__base" src="' + src + '" alt="' + m.name + ', барбер" loading="lazy" decoding="async" onerror="this.hidden=true">' +
        '<span class="duo__tint"></span>' +
        '<img class="duo__color" src="' + src + '" alt="" aria-hidden="true" loading="lazy" decoding="async" onerror="this.hidden=true">' +
        '<span class="duo__badge">' + (m.tier === 'top' ? 'Топ-мастер' : 'Мастер') + '</span>' +
      '</div>' +
      '<div class="mcard__body"><h3 class="mcard__name">' + m.name + '</h3><p class="mcard__role">' + m.exp + '</p>' +
      '<p class="mcard__text">' + m.text + '</p>' +
      '<button type="button" class="btn" data-book="' + m.id + '">Записаться к ' + m.short + '</button></div></article>';
  }).join('');

  /* ---------- онлайн-запись ---------- */
  var st = { step: 1, service: null, master: null, day: null, time: null };
  var form = $('#bookForm'), btnNext = $('#bookNext'), btnBack = $('#bookBack'), err = $('#bookErr');
  var ANY = { id: 'any', name: 'Любой свободный', tier: 'master', exp: 'подберем по времени' };
  var findS = function (id) { return SERVICES.filter(function (s) { return s.id === id; })[0]; };
  var findM = function (id) { return id === 'any' ? ANY : MASTERS.filter(function (m) { return m.id === id; })[0]; };

  function optHTML(id, main, sub, right, lead) {
    return '<button type="button" class="opt" data-val="' + id + '">' + (lead || '<span class="opt__dot"></span>') +
      '<span class="opt__main"><b>' + main + '</b><small>' + sub + '</small></span>' +
      (right ? '<span class="opt__price">' + right + '</span>' : '') + '</button>';
  }
  $('#optServices').innerHTML = SERVICES.map(function (s) {
    return optHTML(s.id, s.name, s.time + ' мин', 'от ' + rub(s.price.master));
  }).join('');
  function renderMasters() {
    var s = findS(st.service);
    $('#optMasters').innerHTML = [ANY].concat(MASTERS).map(function (m) {
      var ava = '<span class="opt__ava">' + (m.id === 'any' ? '?' : m.name.charAt(0)) + '</span>';
      var sub = m.id === 'any' ? 'цена по уровню «мастер»' : (m.tier === 'top' ? 'Топ-мастер · ' : 'Мастер · ') + m.exp;
      return optHTML(m.id, m.name, sub, s ? rub(s.price[m.tier]) : '', ava);
    }).join('');
    mark('#optMasters', st.master);
  }
  var DOW = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  var MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  var days = [];
  (function () {
    var d0 = new Date(); d0.setHours(0, 0, 0, 0);
    for (var i = 0; i < 10; i++) { var d = new Date(d0); d.setDate(d0.getDate() + i); days.push(d); }
    $('#optDays').innerHTML = days.map(function (d, i) {
      return '<button type="button" class="day" data-val="' + i + '"><small>' + (i === 0 ? 'сег' : DOW[d.getDay()]) + '</small><b>' + d.getDate() + '</b></button>';
    }).join('');
  })();
  function hours(d) { var w = d.getDay(); return w === 6 ? [9, 21] : w === 0 ? [10, 19] : [10, 21]; }
  function renderSlots() {
    var box = $('#optSlots');
    if (st.day === null) { box.innerHTML = ''; return; }
    var d = days[st.day], h = hours(d), now = new Date(), out = [];
    var seed = (st.day + 3) * 7 + (st.master || 'any').length * 13;
    for (var t = h[0]; t <= h[1]; t++) {
      [0, 30].forEach(function (mm) {
        if (t === h[1] && mm === 30) return;
        var label = t + ':' + (mm ? '30' : '00');
        var busy = ((t * 2 + mm / 30) * 31 + seed) % 5 === 0;
        var past = st.day === 0 && (t * 60 + mm) <= now.getHours() * 60 + now.getMinutes() + 30;
        out.push('<button type="button" class="slot" data-val="' + label + '"' + (busy || past ? ' disabled' : '') + '>' + label + '</button>');
      });
    }
    box.innerHTML = out.join('');
    mark('#optSlots', st.time);
  }
  function mark(sel, val) { $$(sel + ' [data-val]').forEach(function (b) { var on = b.dataset.val === String(val); b.classList.toggle('is-sel', on); b.setAttribute('aria-pressed', on); }); }

  function dateLabel() {
    if (st.day === null || !st.time) return null;
    var d = days[st.day];
    return d.getDate() + ' ' + MON[d.getMonth()] + ', ' + DOW[d.getDay()] + ' · ' + st.time;
  }
  function summary() {
    var s = findS(st.service), m = st.master && findM(st.master);
    $('#sService').textContent = s ? s.name + ', ' + s.time + ' мин' : 'не выбрана';
    $('#sMaster').textContent = m ? m.name : 'не выбран';
    $('#sTime').textContent = dateLabel() || 'не выбрано';
    $('#sTotal').textContent = s ? (m ? rub(s.price[m.tier]) : 'от ' + rub(s.price.master)) : '—';
  }
  function go(n) {
    st.step = n; err.textContent = '';
    $$('.step', form).forEach(function (f) { f.classList.toggle('is-active', +f.dataset.step === n); });
    $$('.steps__item').forEach(function (li) {
      var k = +li.dataset.stepInd;
      li.classList.toggle('is-current', k === n); li.classList.toggle('is-done', k < n);
      if (k === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    btnBack.hidden = n === 1 || n === 4;
    btnNext.textContent = n === 3 ? 'Подтвердить запись' : 'Далее';
    form.classList.toggle('is-done', n === 4);
    if (n === 2) renderMasters();
    if (n === 3) renderSlots();
    summary();
  }
  form.addEventListener('click', function (e) {
    var b = e.target.closest('[data-val]'); if (!b || b.disabled) return;
    var box = b.parentElement.id;
    if (box === 'optServices') { st.service = b.dataset.val; mark('#optServices', st.service); }
    if (box === 'optMasters') { st.master = b.dataset.val; mark('#optMasters', st.master); }
    if (box === 'optDays') { st.day = +b.dataset.val; st.time = null; mark('#optDays', st.day); renderSlots(); }
    if (box === 'optSlots') { st.time = b.dataset.val; mark('#optSlots', st.time); }
    err.textContent = ''; summary();
  });
  btnBack.addEventListener('click', function () { go(st.step - 1); });
  btnNext.addEventListener('click', function () {
    if (st.step === 1) { if (!st.service) { err.textContent = 'Выберите услугу'; return; } go(st.master ? 3 : 2); return; }
    if (st.step === 2) { if (!st.master) { err.textContent = 'Выберите мастера'; return; } go(3); return; }
    if (st.step === 3) {
      var name = $('#fName').value.trim(), phone = $('#fPhone').value.replace(/\D/g, '');
      if (st.day === null || !st.time) { err.textContent = 'Выберите дату и время'; return; }
      if (name.length < 2) { err.textContent = 'Укажите имя'; $('#fName').focus(); return; }
      if (phone.length < 10) { err.textContent = 'Укажите телефон'; $('#fPhone').focus(); return; }
      var s = findS(st.service), m = findM(st.master);
      $('#doneName').textContent = name;
      $('#doneText').textContent = s.name + ' · ' + m.name + ' · ' + dateLabel() + '. Пришлем подтверждение на номер, оканчивающийся на ' + phone.slice(-4) + ', и напомним за два часа.';
      go(4);
    }
  });
  $('#bookAgain').addEventListener('click', function () {
    st = { step: 1, service: null, master: null, day: null, time: null };
    $('#fName').value = ''; $('#fPhone').value = '';
    mark('#optServices', null); mark('#optDays', null); go(1);
  });
  // «Записаться к …» — мастер выбран заранее
  $('#mastersGrid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-book]'); if (!b) return;
    st.master = b.dataset.book; st.time = null;
    go(st.service ? 3 : 1);
    $('#booking').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  go(1);

  /* ---------- сертификат ---------- */
  var sum = 3000;
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      sum = +c.dataset.sum;
      $$('.chip').forEach(function (x) { var on = x === c; x.classList.toggle('is-active', on); x.setAttribute('aria-checked', on); });
      $('#certSum').textContent = rub(sum);
    });
  });
  $('#certForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var p = $('#certPhone').value.replace(/\D/g, ''), msg = $('#certMsg');
    if (p.length < 10) { msg.textContent = 'Укажите телефон, чтобы мы связались с вами'; return; }
    msg.textContent = 'Спасибо! Сертификат на ' + rub(sum) + ' оформлен, администратор позвонит в течение 15 минут.';
    e.target.reset();
  });
})();
