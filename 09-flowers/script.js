/* Ботаника — общий скрипт для всех страниц */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Каталог ---------- */
  var PRODUCTS = [
    { id: 'p01', name: 'Пионовое утро', desc: '15 розовых пионов, эвкалипт, пудровая бумага', price: 6900, img: 'peony', occ: ['birthday', 'simply'], color: 'pink', pop: 98, isNew: false, badge: 'Хит' },
    { id: 'p02', name: 'Луговой сбор', desc: 'Сезонные полевые: ромашки, васильки, колоски', price: 3400, img: 'field', occ: ['simply', 'birthday'], color: 'mix', pop: 90, isNew: false, badge: 'Хит' },
    { id: 'p03', name: 'Алая классика', desc: 'Монобукет из 25 красных роз, 60 см', price: 5900, img: 'roses', occ: ['birthday', 'simply'], color: 'red', pop: 95, isNew: false, badge: '' },
    { id: 'p04', name: 'Шляпная коробка «Зефир»', desc: 'Розы, кустовые розы и гвоздика в коробке', price: 7400, img: 'box', occ: ['birthday'], color: 'pink', pop: 96, isNew: false, badge: 'Хит' },
    { id: 'p05', name: 'Тихий сад', desc: 'Сухоцветы: пампас, лагурус, лунария, лаванда', price: 3900, img: 'dried', occ: ['simply'], color: 'beige', pop: 80, isNew: true, badge: 'Новинка' },
    { id: 'p06', name: 'Белое обещание', desc: 'Букет невесты: пионовидные розы, ранункулюс', price: 8500, img: 'wedding', occ: ['wedding'], color: 'white', pop: 88, isNew: false, badge: '' },
    { id: 'p07', name: 'Весенние тюльпаны', desc: '35 желтых и кремовых тюльпанов, крафт', price: 4200, img: 'tulips', occ: ['birthday', 'simply'], color: 'yellow', pop: 92, isNew: false, badge: 'Хит' },
    { id: 'p08', name: 'Корзина с дачи', desc: 'Садовые розы, гортензия, ягоды в корзине', price: 9800, img: 'basket', occ: ['birthday', 'wedding'], color: 'yellow', pop: 84, isNew: false, badge: '' },
    { id: 'p09', name: 'Пионы и эвкалипт', desc: '11 белых пионов с серебристой зеленью', price: 8200, img: 'peony', occ: ['wedding', 'birthday'], color: 'white', pop: 86, isNew: true, badge: 'Новинка' },
    { id: 'p10', name: 'Розовое облако', desc: '9 веток кустовой розы, нежная упаковка', price: 4700, img: 'roses', occ: ['simply', 'birthday'], color: 'pink', pop: 82, isNew: false, badge: '' },
    { id: 'p11', name: 'Букет невесты «Осень»', desc: 'Кремовые розы, сухоцветы, атласная лента', price: 7200, img: 'wedding', occ: ['wedding'], color: 'beige', pop: 70, isNew: true, badge: 'Новинка' },
    { id: 'p12', name: 'Коробка «Комплимент»', desc: 'Малая коробка: белые розы и эустома', price: 4900, img: 'box', occ: ['simply', 'birthday'], color: 'white', pop: 78, isNew: false, badge: '' },
    { id: 'p13', name: 'Сухоцвет-мини', desc: 'Маленький букет на полку, стоит до года', price: 2200, img: 'dried', occ: ['simply'], color: 'beige', pop: 74, isNew: false, badge: '' },
    { id: 'p14', name: 'Белые тюльпаны', desc: '25 белых тюльпанов в молочной бумаге', price: 3600, img: 'tulips', occ: ['wedding', 'simply'], color: 'white', pop: 76, isNew: false, badge: '' },
    { id: 'p15', name: 'Летняя корзина', desc: 'Хризантемы, альстромерия и зелень', price: 6800, img: 'basket', occ: ['birthday'], color: 'mix', pop: 72, isNew: false, badge: '' }
  ];
  var BY_ID = {};
  PRODUCTS.forEach(function (p) { BY_ID[p.id] = p; });

  var fmt = function (n) { return n.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- Хранилище корзины ---------- */
  var KEY = 'botanika-cart-v1';
  var memCart = [];
  function loadCart() {
    try {
      var raw = localStorage.getItem(KEY);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr.filter(function (i) { return i && BY_ID[i.id] && i.qty > 0; });
    } catch (e) { return memCart.slice(); }
  }
  function saveCart(cart) {
    memCart = cart.slice();
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* приватный режим — живем в памяти */ }
  }
  var cart = loadCart();

  function cartCount() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function cartSum() { return cart.reduce(function (s, i) { return s + i.qty * BY_ID[i.id].price; }, 0); }

  function addToCart(id) {
    var item = cart.find(function (i) { return i.id === id; });
    if (item) item.qty = Math.min(item.qty + 1, 20); else cart.push({ id: id, qty: 1 });
    saveCart(cart);
    renderCart();
  }
  function setQty(id, qty) {
    cart = cart.map(function (i) { return i.id === id ? { id: id, qty: qty } : i; }).filter(function (i) { return i.qty > 0; });
    saveCart(cart);
    renderCart();
  }

  // синхронизация между вкладками
  window.addEventListener('storage', function (e) { if (e.key === KEY) { cart = loadCart(); renderCart(); } });

  /* ---------- Разметка корзины (одна на все страницы) ---------- */
  var bagSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
  document.body.insertAdjacentHTML('beforeend',
    '<div class="overlay" data-close></div>' +
    '<aside class="drawer" id="cart" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true">' +
      '<div class="drawer__head"><h2 id="cart-title">Корзина</h2><button class="x" type="button" data-close aria-label="Закрыть корзину">×</button></div>' +
      '<div class="drawer__body" id="cart-body"></div>' +
      '<div class="drawer__foot" id="cart-foot">' +
        '<label for="card-text">Текст для открытки <small style="font-weight:400;color:var(--muted)">(бесплатно)</small></label>' +
        '<textarea id="card-text" maxlength="200" placeholder="Например: С днем рождения, мама! Ты лучше всех"></textarea>' +
        '<div class="totals"><div><span>Букеты</span><span id="t-items"></span></div><div><span>Доставка по Казани</span><span id="t-del"></span></div><div class="total"><span>Итого</span><span id="t-sum"></span></div></div>' +
        '<button class="btn btn--block" type="button" id="checkout">Оформить заказ</button>' +
      '</div>' +
    '</aside>');

  var drawer = document.getElementById('cart');
  var overlay = document.querySelector('.overlay');
  var body = document.getElementById('cart-body');
  var foot = document.getElementById('cart-foot');
  var countEls = document.querySelectorAll('.cart-count');
  var lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    drawer.classList.add('open'); overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock');
    setTimeout(function () { drawer.querySelector('.x').focus(); }, 50);
  }
  function closeCart() {
    drawer.classList.remove('open'); overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lock');
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('.cart-btn').forEach(function (b) { b.addEventListener('click', openCart); });
  document.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', closeCart); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart(); });

  function phHTML(img, alt) {
    return '<div class="ph ph--' + img + '"><img src="img/bouquet-' + img + '.jpg" alt="' + esc(alt || '') + '" loading="lazy" decoding="async" onerror="this.classList.add(\'noimg\')"></div>';
  }

  function renderCart() {
    var n = cartCount();
    countEls.forEach(function (el) { el.textContent = n; el.classList.toggle('has', n > 0); });
    document.querySelectorAll('.cart-btn').forEach(function (b) { b.setAttribute('aria-label', 'Корзина, товаров: ' + n); });

    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty">' + bagSvg.replace('<svg', '<svg style="color:var(--sage)"') +
        '<b>Пока пусто</b><p>Загляните в каталог — соберем букет сегодня.</p><p style="margin-top:18px"><a class="btn btn--ghost" href="catalog.html">В каталог</a></p></div>';
      foot.style.display = 'none';
      return;
    }
    foot.style.display = '';
    body.innerHTML = cart.map(function (i) {
      var p = BY_ID[i.id];
      return '<div class="citem" data-id="' + p.id + '">' + phHTML(p.img, '') +
        '<div><div class="citem__name">' + esc(p.name) + '</div><div class="citem__price">' + fmt(p.price) + '</div>' +
        '<div class="qty"><button type="button" data-q="-1" aria-label="Меньше">−</button><span>' + i.qty + '</span><button type="button" data-q="1" aria-label="Больше">+</button></div></div>' +
        '<div><div class="citem__sum">' + fmt(p.price * i.qty) + '</div><button class="citem__del" type="button" data-del>Убрать</button></div></div>';
    }).join('');
    var sum = cartSum();
    var del = sum >= 5000 ? 0 : 390;
    document.getElementById('t-items').textContent = fmt(sum);
    document.getElementById('t-del').textContent = del ? fmt(del) : 'бесплатно';
    document.getElementById('t-sum').textContent = fmt(sum + del);
  }

  body.addEventListener('click', function (e) {
    var row = e.target.closest('.citem');
    if (!row) return;
    var id = row.getAttribute('data-id');
    var item = cart.find(function (i) { return i.id === id; });
    if (!item) return;
    var q = e.target.closest('[data-q]');
    if (q) setQty(id, Math.min(20, item.qty + Number(q.getAttribute('data-q'))));
    if (e.target.closest('[data-del]')) setQty(id, 0);
  });

  document.getElementById('checkout').addEventListener('click', function () {
    var note = document.getElementById('card-text').value.trim();
    cart = []; saveCart(cart); renderCart();
    document.getElementById('card-text').value = '';
    body.innerHTML = '<div class="order-ok"><svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="#C9D5C0"/><path d="M20 33l8 8 16-17" stroke="#4D5B3F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<b>Спасибо!</b><p>Заказ принят. Флорист перезвонит в течение 10 минут, чтобы уточнить адрес и время доставки' + (note ? ', а открытку подпишем от руки' : '') + '. Оплата — после звонка.</p>' +
      '<button class="btn btn--ghost" type="button" data-close2>Вернуться к букетам</button></div>';
    body.querySelector('[data-close2]').addEventListener('click', closeCart);
  });

  /* ---------- Полет товара в корзину ---------- */
  function visibleCartBtn() {
    var btns = document.querySelectorAll('.cart-btn');
    for (var i = 0; i < btns.length; i++) if (btns[i].offsetParent !== null) return btns[i];
    return btns[0];
  }
  function flyToCart(fromEl, imgName) {
    var target = visibleCartBtn();
    if (!target) return;
    var cbtn = target;
    var bump = function () { cbtn.classList.remove('bump'); void cbtn.offsetWidth; cbtn.classList.add('bump'); };
    if (reduced || !fromEl) { bump(); return; }
    var a = fromEl.getBoundingClientRect();
    var b = target.getBoundingClientRect();
    var dot = document.createElement('div');
    dot.className = 'fly ph--' + imgName;
    var imgEl = fromEl.querySelector('img');
    if (imgEl && imgEl.naturalWidth) dot.style.backgroundImage = 'url("' + imgEl.currentSrc + '")';
    else { dot.style.background = 'var(--powder)'; dot.classList.add('ph'); }
    var sx = a.left + a.width / 2 - 35, sy = a.top + a.height / 2 - 35;
    var ex = b.left + b.width / 2 - 35, ey = b.top + b.height / 2 - 35;
    dot.style.transform = 'translate(' + sx + 'px,' + sy + 'px) scale(1.4)';
    document.body.appendChild(dot);
    var anim = dot.animate([
      { transform: 'translate(' + sx + 'px,' + sy + 'px) scale(1.4)', opacity: 1 },
      { transform: 'translate(' + (sx + (ex - sx) * .5) + 'px,' + (Math.min(sy, ey) - 120) + 'px) scale(.9)', opacity: 1, offset: .5 },
      { transform: 'translate(' + ex + 'px,' + ey + 'px) scale(.25)', opacity: .3 }
    ], { duration: 750, easing: 'cubic-bezier(.45,.05,.55,.95)' });
    anim.onfinish = function () { dot.remove(); bump(); };
  }

  /* ---------- Карточка товара ---------- */
  var plusSvg = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>';
  function cardHTML(p) {
    return '<article class="card bloom" data-id="' + p.id + '">' +
      (p.badge ? '<span class="card__badge">' + p.badge + '</span>' : '') +
      phHTML(p.img, 'Букет «' + p.name + '»') +
      '<div class="card__body"><h3 class="card__name">' + esc(p.name) + '</h3><p class="card__desc">' + esc(p.desc) + '</p>' +
      '<div class="card__foot"><span class="card__price">' + fmt(p.price) + '</span>' +
      '<button class="add" type="button" data-add="' + p.id + '">' + plusSvg + '<span>В корзину</span></button></div></div></article>';
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]');
    if (!btn) return;
    var id = btn.getAttribute('data-add');
    var p = BY_ID[id];
    if (!p) return;
    addToCart(id);
    var card = btn.closest('.card');
    flyToCart(card ? card.querySelector('.ph') : btn, p.img);
    btn.classList.add('done');
    var label = btn.querySelector('span');
    if (label) {
      label.textContent = 'Добавлено';
      clearTimeout(btn._t);
      btn._t = setTimeout(function () { label.textContent = 'В корзину'; btn.classList.remove('done'); }, 1400);
    }
  });

  /* ---------- Появление (распускание) ---------- */
  var io = ('IntersectionObserver' in window && !reduced) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 }) : null;
  function observe(root) {
    (root || document).querySelectorAll('.bloom:not(.in), .reveal:not(.in)').forEach(function (el, i) {
      if (!io) { el.classList.add('in'); return; }
      if (el.classList.contains('bloom')) el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- Хиты на главной ---------- */
  var hits = document.getElementById('hits-grid');
  if (hits) {
    hits.innerHTML = PRODUCTS.filter(function (p) { return p.badge === 'Хит'; }).slice(0, 4).map(cardHTML).join('');
  }

  /* ---------- Каталог и фильтры ---------- */
  var grid = document.getElementById('catalog-grid');
  if (grid) {
    var state = { occ: 'all', max: 10000, colors: [], sort: 'pop' };
    var params = new URLSearchParams(location.search);
    var po = params.get('occasion');
    if (po && ['birthday', 'wedding', 'simply'].indexOf(po) > -1) state.occ = po;

    var occBtns = document.querySelectorAll('[data-occ]');
    var range = document.getElementById('price');
    var rangeOut = document.getElementById('price-out');
    var colorInputs = document.querySelectorAll('input[name="color"]');
    var sortSel = document.getElementById('sort');
    var countEl = document.getElementById('found');
    var empty = document.getElementById('empty');

    var plural = function (n) {
      var m10 = n % 10, m100 = n % 100;
      if (m10 === 1 && m100 !== 11) return 'букет';
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'букета';
      return 'букетов';
    };

    function syncUI() {
      occBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-occ') === state.occ)); });
      range.value = state.max;
      rangeOut.textContent = 'до ' + fmt(state.max);
      colorInputs.forEach(function (c) { c.checked = state.colors.indexOf(c.value) > -1; });
      sortSel.value = state.sort;
    }

    function apply() {
      var list = PRODUCTS.filter(function (p) {
        return (state.occ === 'all' || p.occ.indexOf(state.occ) > -1) &&
          p.price <= state.max &&
          (!state.colors.length || state.colors.indexOf(p.color) > -1);
      });
      var sorters = {
        pop: function (a, b) { return b.pop - a.pop; },
        asc: function (a, b) { return a.price - b.price; },
        desc: function (a, b) { return b.price - a.price; },
        'new': function (a, b) { return (b.isNew - a.isNew) || (b.pop - a.pop); }
      };
      list.sort(sorters[state.sort]);
      grid.innerHTML = list.map(cardHTML).join('');
      countEl.textContent = 'Найдено: ' + list.length + ' ' + plural(list.length);
      empty.classList.toggle('show', list.length === 0);
      observe(grid);
      if (history.replaceState) {
        var u = state.occ === 'all' ? location.pathname : location.pathname + '?occasion=' + state.occ;
        history.replaceState(null, '', u);
      }
    }

    occBtns.forEach(function (b) {
      b.addEventListener('click', function () { state.occ = b.getAttribute('data-occ'); syncUI(); apply(); });
    });
    var rAF = 0;
    range.addEventListener('input', function () {
      state.max = Number(range.value);
      rangeOut.textContent = 'до ' + fmt(state.max);
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(apply);
    });
    colorInputs.forEach(function (c) {
      c.addEventListener('change', function () {
        state.colors = Array.prototype.filter.call(colorInputs, function (x) { return x.checked; }).map(function (x) { return x.value; });
        apply();
      });
    });
    sortSel.addEventListener('change', function () { state.sort = sortSel.value; apply(); });
    document.querySelectorAll('[data-reset]').forEach(function (b) {
      b.addEventListener('click', function () { state = { occ: 'all', max: 10000, colors: [], sort: state.sort }; syncUI(); apply(); });
    });

    // на десктопе фильтры всегда раскрыты
    var det = document.getElementById('filters');
    if (det && window.matchMedia('(min-width: 960px)').matches) det.open = true;

    syncUI(); apply();
  }

  /* ---------- Лепестки в hero (десктоп, 6 шт.) ---------- */
  var petals = document.querySelector('.petals');
  if (petals && !reduced && window.matchMedia('(min-width: 960px) and (hover: hover) and (pointer: fine)').matches) {
    var cfg = [
      [8, 18, 22, 0, 60], [24, 14, 26, 7, -40], [46, 20, 24, 13, 70],
      [63, 12, 28, 4, -60], [80, 16, 25, 17, 50], [92, 13, 30, 10, -30]
    ];
    petals.innerHTML = cfg.map(function (c) {
      return '<i class="petal" style="--x:' + c[0] + '%;--s:' + c[1] + 'px;--d:' + c[2] + 's;--delay:' + c[3] + 's;--sway:' + c[4] + 'px"></i>';
    }).join('');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        petals.classList.toggle('paused', !en[0].isIntersecting);
      }).observe(petals.parentElement);
    }
    document.addEventListener('visibilitychange', function () { petals.classList.toggle('paused', document.hidden); });
  }

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = mnav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) { mnav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
  }

  /* ---------- Формы (без отправки) ---------- */
  document.querySelectorAll('form[data-thanks]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var box = f.querySelector('.thanks');
      if (box) { box.classList.add('show'); box.textContent = f.getAttribute('data-thanks'); }
      f.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"]').forEach(function (i) { i.value = ''; });
    });
  });

  // фото-заглушки: если картинки нет, оставляем CSS-фон (lazy-картинки еще не загружены — их не трогаем, ошибку ловит onerror)
  document.querySelectorAll('.ph img').forEach(function (img) {
    if (img.loading !== 'lazy' && img.complete && img.naturalWidth === 0) img.classList.add('noimg');
  });

  renderCart();
  observe();
  window.__botanika = { open: openCart, close: closeCart };
})();
