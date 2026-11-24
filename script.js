(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* Шапка: линия после начала скролла */
  var header = document.getElementById("header");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Плавное появление блоков */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Фильтр работ */
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".card");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      cards.forEach(function (card) {
        var tags = card.getAttribute("data-tags").split(" ");
        card.classList.toggle("is-hidden", f !== "all" && tags.indexOf(f) === -1);
      });
    });
  });

  /* Было -> стало.
     Версии «до» лежат в img/ba-NN-before.jpg, список готовых — window.BEFORE_SHOTS
     (его пишет build_thumbs.py). Сначала показываем пары с готовой версией «до»,
     остальные слоты — с аккуратной заглушкой. */
  var NAMES = {
    "01": ["Кофейня", "Зерно и пар"],
    "02": ["3D-визуализатор", "Анна Лис"],
    "03": ["Мастер маникюра", "Nail Room Вера"],
    "04": ["Психолог", "Мария Светлова"],
    "05": ["Свадебный фотограф", "Свет & Пленка"],
    "06": ["Ремонт квартир", "Основа"],
    "07": ["Онлайн-школа", "Код с нуля"],
    "08": ["Йога-студия", "Тихая гавань"],
    "09": ["Цветочная студия", "Ботаника"],
    "10": ["Барбершоп", "Борода и Ко"]
  };
  var ready = (window.BEFORE_SHOTS || []).filter(function (n) { return NAMES[n]; });
  var slots = document.querySelectorAll(".ba");
  var order = ready.slice();
  slots.forEach(function (s) {
    var d = s.getAttribute("data-site");
    if (order.indexOf(d) === -1) order.push(d);
  });

  slots.forEach(function (slot, i) {
    var nn = order[i];
    var after = slot.querySelector(".ba__after");
    var beforeImg = slot.querySelector(".ba__before-img");
    var ph = slot.querySelector(".ba__ph");
    if (nn !== slot.getAttribute("data-site")) {
      slot.setAttribute("data-site", nn);
      after.src = "img/ba-" + nn + "-after.jpg";
      slot.querySelector(".ba__niche").textContent = NAMES[nn][0];
      slot.querySelector(".ba__name").textContent = NAMES[nn][1];
    }
    if (ready.indexOf(nn) !== -1) {
      beforeImg.src = "img/ba-" + nn + "-before.jpg";
      beforeImg.hidden = false;
      ph.hidden = true;
    }

    var range = slot.querySelector(".ba__range");
    var outer = slot.querySelector(".ba__before");
    var inner = slot.querySelector(".ba__before-in");
    var handle = slot.querySelector(".ba__handle");
    function set(v) {
      var p = Math.max(0, Math.min(100, +v));
      outer.style.transform = "translateX(" + (p - 100) + "%)";
      inner.style.transform = "translateX(" + (100 - p) + "%)";
      handle.style.transform = "translateX(" + (p - 50) + "%)";
    }
    range.addEventListener("input", function () { set(range.value); });
    set(range.value);
  });
})();
