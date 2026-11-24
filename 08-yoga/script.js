(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header + burger */
  var header = document.querySelector('.header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var ticking = false;
  window.addEventListener('scroll', function(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){ header.classList.toggle('is-scrolled', window.scrollY > 10); ticking = false; });
  }, {passive:true});
  burger.addEventListener('click', function(){
    var open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', function(e){ if (e.target.tagName === 'A'){ burger.setAttribute('aria-expanded','false'); nav.classList.remove('is-open'); } });

  /* blobs pause offscreen */
  var hero = document.getElementById('hero');
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ hero.classList.toggle('is-paused', !en[0].isIntersecting); }).observe(hero);
  }

  /* schedule data */
  var T = {a:'Алина Гарифуллина', r:'Рустем Ахметов', e:'Елена Сорокина'};
  var P = {hatha:'Хатха-йога', nidra:'Йога-нидра', stretch:'Растяжка', med:'Медитация', back:'Йога для спины'};
  var LV = {beg:['Начальный',''], mid:['Средний','level--mid'], all:['Все уровни','level--all']};
  var DUR = {hatha:75, nidra:60, stretch:60, med:45, back:60};
  function L(t,p,tr,lv,s){ return {time:t, p:p, tr:tr, lv:lv, seats:s}; }
  var days = [
    {s:'Пн', f:'Понедельник', l:[L('7:30','hatha','a','all',5),L('12:00','back','a','beg',3),L('18:30','stretch','e','all',2),L('20:00','med','r','all',8),L('21:00','nidra','r','all',6)]},
    {s:'Вт', f:'Вторник', l:[L('8:00','med','r','all',9),L('10:00','stretch','e','beg',4),L('19:00','hatha','a','mid',1),L('20:30','back','a','beg',5)]},
    {s:'Ср', f:'Среда', l:[L('7:30','hatha','e','all',6),L('12:00','back','a','beg',2),L('18:30','stretch','e','mid',4),L('20:00','nidra','r','all',7),L('21:00','med','r','all',10)]},
    {s:'Чт', f:'Четверг', l:[L('8:00','med','r','all',8),L('10:00','hatha','a','beg',5),L('19:00','stretch','e','all',3),L('20:30','back','a','beg',4)]},
    {s:'Пт', f:'Пятница', l:[L('7:30','hatha','a','all',4),L('18:00','back','a','beg',6),L('19:30','stretch','e','all',2),L('21:00','nidra','r','all',0)]},
    {s:'Сб', f:'Суббота', l:[L('10:00','hatha','e','all',7),L('11:30','stretch','e','beg',5),L('13:00','med','r','all',9),L('17:00','hatha','a','mid',3),L('18:30','nidra','r','all',6)]},
    {s:'Вс', f:'Воскресенье', l:[L('10:00','med','r','all',11),L('11:00','hatha','a','beg',6),L('12:30','back','a','beg',4),L('17:00','stretch','e','all',5),L('18:30','nidra','r','all',8)]}
  ];

  var daysEl = document.getElementById('days');
  var filtersEl = document.getElementById('filters');
  var sched = document.getElementById('sched');
  var lessonSel = document.getElementById('lesson');
  var today = (new Date().getDay() + 6) % 7;
  var state = {day: today, p: 'all'};

  var ink = document.createElement('span'); ink.className = 'days__ink'; ink.setAttribute('aria-hidden','true');
  daysEl.appendChild(ink);
  days.forEach(function(d, i){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'day'; b.setAttribute('role','tab'); b.id = 'tab-' + i;
    b.setAttribute('aria-controls','sched');
    b.innerHTML = d.s + (i === today ? '<small>сегодня</small>' : '');
    b.setAttribute('aria-label', d.f);
    b.addEventListener('click', function(){ select(i); });
    daysEl.appendChild(b);
  });
  daysEl.addEventListener('keydown', function(e){
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var n = (state.day + (e.key === 'ArrowRight' ? 1 : 6)) % 7; select(n); daysEl.querySelectorAll('.day')[n].focus();
  });
  function placeInk(){
    ink.style.width = 'calc((100% - 10px) / 7)';
    ink.style.transform = 'translateX(calc(5px + ' + state.day + ' * 100%))';
  }

  var fl = [['all','Все']].concat(Object.keys(P).map(function(k){ return [k, P[k]]; }));
  fl.forEach(function(f){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.p = f[0]; b.textContent = f[1];
    b.setAttribute('aria-pressed', f[0] === state.p);
    b.addEventListener('click', function(){
      if (state.p === f[0]) return; state.p = f[0];
      filtersEl.querySelectorAll('.chip').forEach(function(c){ c.setAttribute('aria-pressed', c.dataset.p === state.p); });
      flow();
    });
    filtersEl.appendChild(b);
  });

  function label(di, x){ return days[di].f + ', ' + x.time + ' — ' + P[x.p] + ' (' + T[x.tr] + ')'; }
  function endTime(t, m){ var a = t.split(':'); var v = +a[0]*60 + +a[1] + m; return Math.floor(v/60) + ':' + String(v%60).padStart(2,'0'); }

  function render(){
    var list = days[state.day].l.filter(function(x){ return state.p === 'all' || x.p === state.p; });
    if (!list.length){
      sched.innerHTML = '<p class="sched__empty">В этот день нет занятий по выбранному направлению. Посмотрите другой день или выберите «Все».</p>';
      return;
    }
    sched.innerHTML = list.map(function(x, i){
      var lv = LV[x.lv], full = x.seats === 0;
      var idx = days[state.day].l.indexOf(x);
      return '<article class="lesson" style="--i:' + i + '">' +
        '<p class="lesson__time">' + x.time + '<small>до ' + endTime(x.time, DUR[x.p]) + '</small></p>' +
        '<h3>' + P[x.p] + '</h3>' +
        '<p class="lesson__who">' + T[x.tr] + ' · ' + DUR[x.p] + ' мин</p>' +
        '<div class="lesson__row"><span class="level ' + lv[1] + '">' + lv[0] + '</span>' +
        (full ? '<span class="lesson__seats">Мест нет · лист ожидания</span>' : '<span class="lesson__seats">Свободно мест: ' + x.seats + '</span>') +
        '<button type="button" class="lesson__btn" data-key="' + state.day + '-' + idx + '">' + (full ? 'В лист ожидания' : 'Записаться') + '</button></div>' +
        '</article>';
    }).join('');
  }

  var busy = null;
  function flow(){
    if (reduce){ render(); return; }
    clearTimeout(busy);
    sched.classList.add('is-leaving');
    busy = setTimeout(function(){ render(); sched.classList.remove('is-leaving'); }, 280);
  }
  function select(i){
    if (i === state.day && sched.children.length) return;
    state.day = i;
    daysEl.querySelectorAll('.day').forEach(function(b, k){ b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
    placeInk();
    flow();
  }
  state.day = -1; select(today);

  /* form select options */
  days.forEach(function(d, di){
    var g = document.createElement('optgroup'); g.label = d.f;
    d.l.forEach(function(x, li){
      var o = document.createElement('option'); o.value = di + '-' + li;
      o.textContent = x.time + ' — ' + P[x.p] + ', ' + T[x.tr].split(' ')[0] + (x.seats === 0 ? ' (лист ожидания)' : '');
      g.appendChild(o);
    });
    lessonSel.appendChild(g);
  });
  var chosen = document.getElementById('chosen');
  function showChosen(){
    var v = lessonSel.value;
    if (!v){ chosen.hidden = true; return; }
    var a = v.split('-');
    chosen.hidden = false;
    chosen.innerHTML = '<b>Вы выбрали:</b> ' + label(+a[0], days[+a[0]].l[+a[1]]);
  }
  lessonSel.addEventListener('change', showChosen);
  sched.addEventListener('click', function(e){
    var b = e.target.closest('.lesson__btn'); if (!b) return;
    lessonSel.value = b.dataset.key; showChosen();
    document.getElementById('signup').scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
  });
  var plan = document.getElementById('plan');
  document.querySelectorAll('[data-plan]').forEach(function(a){
    a.addEventListener('click', function(){ plan.value = a.dataset.plan; });
  });

  /* form */
  var form = document.getElementById('form'), msg = document.getElementById('formMsg');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var ok = true;
    ['name','phone','lesson'].forEach(function(n){
      var el = form.elements[n]; var bad = !el.value.trim() || (n === 'phone' && el.value.replace(/\D/g,'').length < 10);
      el.closest('.field').classList.toggle('is-error', bad); if (bad) ok = false;
    });
    if (!form.elements.agree.checked) ok = false;
    msg.classList.toggle('is-error', !ok);
    if (!ok){ msg.textContent = 'Проверьте имя, телефон и выбранное занятие.'; return; }
    msg.textContent = 'Спасибо, ' + form.elements.name.value.trim() + '! Мы перезвоним в течение 30 минут и подтвердим запись.';
    form.reset(); showChosen();
  });

  /* reveal */
  if (!reduce && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(en){
      en.forEach(function(x){ if (x.isIntersecting){ x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, {rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.head, .pcard, .tcard, .price, .review, .first__photo, .first__text, .form, .map').forEach(function(el){ el.classList.add('reveal'); io.observe(el); });
  }
})();
