(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ===== мобильное меню ===== */
  var burger = document.querySelector('.burger');
  var mnav = document.getElementById('mnav');
  if (burger && mnav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') !== 'true';
      burger.setAttribute('aria-expanded', String(open));
      mnav.classList.toggle('open', open);
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); mnav.classList.remove('open'); }
    });
  }

  /* ===== появление секций ===== */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  /* ===== аура за курсором ===== */
  var aura = document.querySelector('.aura');
  if (aura && fine && !reduce) {
    var ax = 0, ay = 0, tx = 0, ty = 0, raf = 0, shown = false;
    var tick = function () {
      ax += (tx - ax) * 0.12; ay += (ty - ay) * 0.12;
      aura.style.transform = 'translate3d(' + ax.toFixed(1) + 'px,' + ay.toFixed(1) + 'px,0)';
      if (Math.abs(tx - ax) > 0.5 || Math.abs(ty - ay) > 0.5) raf = requestAnimationFrame(tick); else raf = 0;
    };
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { ax = tx; ay = ty; aura.classList.add('on'); shown = true; }
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    document.addEventListener('pointerleave', function () { aura.classList.remove('on'); shown = false; });
  } else if (aura) { aura.remove(); }

  /* ===== терминал ===== */
  var termBody = document.getElementById('termBody');
  if (termBody) {
    var script = [
      [['t-p', '$ '], ['', 'npm create first-site']],
      [['t-dim', '  создаю проект... '], ['t-o', 'готово']],
      [],
      [['t-c', '// неделя 9: ваш первый JavaScript']],
      [['t-k', 'const '], ['', 'student = {']],
      [['', '  name: '], ['t-s', '"Вы"'], ['', ',']],
      [['', '  stack: ['], ['t-s', '"HTML"'], ['', ', '], ['t-s', '"CSS"'], ['', ', '], ['t-s', '"JS"'], ['', ', '], ['t-s', '"React"'], ['', '],']],
      [['', '  months: '], ['t-n', '4'], ['', ',']],
      [['', '};']],
      [],
      [['t-f', 'console'], ['', '.'], ['t-f', 'log'], ['', '(`Привет, ${student.name}!`);']],
      [['t-o', '> Привет, Вы!']],
      [],
      [['t-p', '$ '], ['', 'git push origin main']],
      [['t-o', '✓ '], ['t-dim', 'сайт опубликован на github.io']]
    ];
    var caret = document.createElement('span'); caret.className = 'caret';
    var badge = document.getElementById('termBadge');
    var term = document.getElementById('terminal');

    if (reduce) {
      script.forEach(function (line) {
        var d = document.createElement('div'); d.className = 'term-line';
        line.forEach(function (tk) { var s = document.createElement('span'); if (tk[0]) s.className = tk[0]; s.textContent = tk[1]; d.appendChild(s); });
        termBody.appendChild(d);
      });
      termBody.lastChild.appendChild(caret);
      if (badge) badge.classList.add('show');
    } else {
      var li = 0, ti = 0, ci = 0, lineEl = null, spanEl = null, visible = true, timer = 0;
      var step = function () {
        timer = 0;
        if (!visible) return;
        if (li >= script.length) { if (badge) badge.classList.add('show'); return; }
        var line = script[li];
        if (!lineEl) {
          lineEl = document.createElement('div'); lineEl.className = 'term-line';
          termBody.appendChild(lineEl); lineEl.appendChild(caret);
        }
        if (ti >= line.length) { li++; ti = 0; ci = 0; lineEl = null; spanEl = null; timer = setTimeout(step, line.length ? 160 : 80); return; }
        var tk = line[ti];
        if (!spanEl) { spanEl = document.createElement('span'); if (tk[0]) spanEl.className = tk[0]; lineEl.insertBefore(spanEl, caret); }
        // вывод терминала (не ввод) появляется сразу целиком
        var instant = tk[0] === 't-dim' || tk[0] === 't-o' || tk[0] === 't-p';
        if (instant) { spanEl.textContent = tk[1]; ci = tk[1].length; }
        else { spanEl.textContent += tk[1].charAt(ci); ci++; }
        if (ci >= tk[1].length) { ti++; ci = 0; spanEl = null; }
        timer = setTimeout(step, instant ? 120 : 18 + Math.random() * 30);
      };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          term.classList.toggle('paused', !visible);
          if (visible && !timer) timer = setTimeout(step, 60);
        }).observe(term);
      }
      timer = setTimeout(step, 500);
    }
  }

  /* ===== аккордеоны (программа + FAQ) ===== */
  var onAccToggle = null;
  document.querySelectorAll('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (onAccToggle) onAccToggle();
    });
  });

  /* ===== прогресс программы по скроллу ===== */
  var list = document.getElementById('modList');
  var fill = document.getElementById('progFill');
  if (list && fill) {
    var modules = Array.prototype.slice.call(list.querySelectorAll('.module'));
    var label = document.getElementById('progLabel');
    var pct = document.getElementById('progPct');
    var month = document.getElementById('progMonth');
    var top = 0, height = 1, tops = [], vh = window.innerHeight, ticking = false, cur = -1, lastP = -1;

    var measure = function () {
      var sy = window.scrollY;
      var r = list.getBoundingClientRect();
      top = r.top + sy; height = Math.max(1, r.height); vh = window.innerHeight;
      tops = modules.map(function (m) { return m.getBoundingClientRect().top + sy; });
      update();
    };
    var update = function () {
      ticking = false;
      var y = window.scrollY + vh * 0.55;
      var p = Math.min(1, Math.max(0, (y - top) / height));
      if (Math.abs(p - lastP) > 0.001) {
        lastP = p;
        fill.style.transform = 'scaleX(' + p.toFixed(4) + ')';
        pct.textContent = Math.round(p * 100) + '%';
      }
      var idx = 0;
      for (var i = 0; i < tops.length; i++) { if (tops[i] <= y) idx = i; }
      if (idx !== cur) {
        cur = idx;
        modules.forEach(function (m, i) { m.classList.toggle('current', i === idx); m.classList.toggle('done', i < idx); });
        var n = idx + 1;
        label.textContent = 'Модуль ' + (n < 10 ? '0' + n : n) + ' из 08';
        month.textContent = 'месяц ' + Math.ceil(n / 2);
      }
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', function () { requestAnimationFrame(measure); }, { passive: true });
    onAccToggle = function () { requestAnimationFrame(measure); };
    window.addEventListener('load', measure);
    measure();
  }

  /* ===== переключатель оплаты ===== */
  var billBtns = document.querySelectorAll('[data-bill]');
  var pill = document.getElementById('billPill');
  if (billBtns.length && pill) {
    var placePill = function (btn) {
      pill.style.width = btn.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + (btn.offsetLeft - 5) + 'px)';
    };
    var setBill = function (mode) {
      billBtns.forEach(function (b) {
        var on = b.getAttribute('data-bill') === mode;
        b.setAttribute('aria-pressed', String(on));
        if (on) placePill(b);
      });
      document.querySelectorAll('.price').forEach(function (pr) {
        var b = pr.querySelector('b'), per = pr.querySelector('.per');
        pr.classList.add('swap');
        setTimeout(function () {
          b.textContent = pr.getAttribute('data-' + mode) + ' ₽';
          per.textContent = mode === 'month' ? '/ мес' : 'за весь курс';
          pr.classList.remove('swap');
        }, reduce ? 0 : 180);
      });
      document.querySelectorAll('.price-note').forEach(function (n) { n.textContent = n.getAttribute('data-' + mode); });
    };
    billBtns.forEach(function (b) { b.addEventListener('click', function () { setBill(b.getAttribute('data-bill')); }); });
    placePill(document.querySelector('[data-bill][aria-pressed="true"]'));
    window.addEventListener('resize', function () { placePill(document.querySelector('[data-bill][aria-pressed="true"]')); }, { passive: true });
  }

  /* выбор тарифа подставляет его в форму */
  var planSel = document.getElementById('fPlan');
  document.querySelectorAll('[data-plan]').forEach(function (a) {
    a.addEventListener('click', function () { if (planSel) planSel.value = a.getAttribute('data-plan'); });
  });

  /* ===== форма записи ===== */
  var form = document.getElementById('trialForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#fName'), contact = form.querySelector('#fContact'), agree = form.querySelector('#fAgree');
      var ok = true;
      [name, contact].forEach(function (f) {
        var bad = f.value.trim().length < 2;
        f.classList.toggle('err', bad);
        f.setAttribute('aria-invalid', String(bad));
        if (bad) ok = false;
      });
      if (!agree.checked) ok = false;
      var msg = document.getElementById('formOk');
      if (!ok) { (name.classList.contains('err') ? name : contact).focus(); return; }
      msg.innerHTML = '';
      msg.appendChild(document.createTextNode('Спасибо, ' + name.value.trim() + '! Куратор напишет вам в течение часа и пришлет ссылку на урок (' + form.querySelector('#fTime').value + ').'));
      var c = document.createElement('code'); c.textContent = '// status: 200 OK, место забронировано'; msg.appendChild(c);
      msg.classList.add('show');
      form.querySelector('button[type="submit"]').disabled = true;
    });
  }
})();
