/* Case studies: the opening film, the swipe strips and the full-screen viewer.
   Everything works without it except the film and the viewer: the strips are
   plain horizontal scrollers and every piece is still on the page. */
(function () {
  var html = document.documentElement;
  var still = html.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = matchMedia('(max-width: 767px)');

  /* ---------- Film: portrait on phones, landscape above; plays only on screen ---------- */
  document.querySelectorAll('[data-film]').forEach(function (box) {
    var video = box.querySelector('video');
    var toggle = box.parentElement.querySelector('[data-film-toggle]');
    var paused = false, inView = false;
    if (still || !video) return;
    function sync() {
      if (inView && !paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else video.pause();
    }
    function pick() {
      var src = phone.matches ? box.dataset.tall : box.dataset.wide;
      if (video.dataset.current !== src) {
        video.dataset.current = src;
        box.classList.remove('is-playing');
        video.src = src; video.load();
      }
      sync();
    }
    video.addEventListener('playing', function () { box.classList.add('is-playing'); });
    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener('click', function () {
        paused = !paused;
        toggle.setAttribute('aria-pressed', String(paused));
        toggle.textContent = paused ? 'Play film' : 'Pause film';
        sync();
      });
    }
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView && !video.dataset.current) pick(); else sync();
    }, { rootMargin: '120px 0px' }).observe(box);
    phone.addEventListener('change', function () { if (video.dataset.current) pick(); });
  });

  /* ---------- Strips: Back / Next and a count ---------- */
  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var track = rail.querySelector('.rail-track');
    var items = Array.prototype.slice.call(track.children);
    var now = rail.querySelector('[data-rail-now]');
    var prev = rail.querySelector('[data-rail-prev]');
    var next = rail.querySelector('[data-rail-next]');
    var queued = false;
    function pad() { return parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0; }
    function current() {
      var x = track.scrollLeft, p = pad(), best = 0;
      if (x + track.clientWidth >= track.scrollWidth - 2) return items.length - 1;
      items.forEach(function (it, i) {
        if (Math.abs(it.offsetLeft - p - x) < Math.abs(items[best].offsetLeft - p - x)) best = i;
      });
      return best;
    }
    function update() {
      queued = false;
      var i = current();
      if (now) now.textContent = i + 1;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }
    function go(step) {
      var i = Math.max(0, Math.min(items.length - 1, current() + step));
      track.scrollTo({ left: items[i].offsetLeft - pad(), behavior: still ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  });

  /* ---------- Story loops in the strips: play only while mostly on screen ---------- */
  if (!still && 'IntersectionObserver' in window) {
    var loopIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.src) { v.src = v.dataset.src; v.addEventListener('playing', function () { v.classList.add('is-playing'); }, { once: true }); }
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else v.pause();
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.rail-video').forEach(function (v) { loopIO.observe(v); });
  }

  /* ---------- Viewer: one group at a time, swipe or arrow keys between pieces ---------- */
  var groups = {};
  document.querySelectorAll('[data-view]').forEach(function (b) {
    var g = b.dataset.view;
    (groups[g] = groups[g] || []).push(b);
    b.addEventListener('click', function () { open(g, groups[g].indexOf(b), b); });
  });
  if (!Object.keys(groups).length) return;

  var ov, stage, img, vid, hint, count, prevB, nextB, closeB, group = null, idx = 0, opener = null, startX = 0, startY = 0;
  var pointers = 0, multi = false, dragged = false;
  var turnMq = matchMedia('(max-width: 767px) and (orientation: portrait)');
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function button(cls, text) { var b = el('button', cls, text); b.type = 'button'; return b; }
  function build() {
    ov = el('div', 'viewer');
    ov.hidden = true;
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('data-lenis-prevent', '');
    stage = el('div', 'viewer-stage');
    img = el('img');
    img.decoding = 'async';
    stage.appendChild(img);
    vid = el('video');
    vid.muted = true; vid.loop = true; vid.playsInline = true; vid.hidden = true;
    vid.setAttribute('playsinline', '');
    stage.appendChild(vid);
    hint = el('p', 'viewer-hint', 'Turn your phone sideways to see the spread bigger.');
    stage.appendChild(hint);
    var bar = el('div', 'viewer-bar');
    closeB = button('pill pill--sm', 'Close');
    var nav = el('div', 'viewer-nav');
    prevB = button('pill pill--sm', 'Back');
    count = el('span', 'viewer-count');
    count.setAttribute('aria-live', 'polite');
    nextB = button('pill pill--sm', 'Next');
    nav.appendChild(prevB); nav.appendChild(count); nav.appendChild(nextB);
    bar.appendChild(closeB); bar.appendChild(nav);
    ov.appendChild(stage); ov.appendChild(bar);
    document.body.appendChild(ov);
    closeB.addEventListener('click', close);
    prevB.addEventListener('click', function () { step(-1); });
    nextB.addEventListener('click', function () { step(1); });
    // A tap on the empty stage closes; a drag never does, wherever it starts.
    stage.addEventListener('click', function (e) { if (e.target === stage && !dragged) close(); dragged = false; });
    stage.addEventListener('pointerdown', function (e) {
      pointers++;
      if (pointers > 1) multi = true;
      startX = e.clientX; startY = e.clientY; dragged = false;
    });
    function lift(e) {
      pointers = Math.max(0, pointers - 1);
      if (e.type === 'pointerup' && !multi) {
        var dx = e.clientX - startX, dy = e.clientY - startY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) dragged = true;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
      }
      if (pointers === 0) multi = false;
    }
    stage.addEventListener('pointerup', lift);
    stage.addEventListener('pointercancel', lift);
  }
  function show() {
    var list = groups[group], b = list[idx], thumb = b.querySelector('img');
    var tall = Number(b.dataset.h) / Number(b.dataset.w) > 1.9;
    ov.classList.toggle('is-tall', tall);
    hint.hidden = !(Number(b.dataset.w) / Number(b.dataset.h) > 1.5 && turnMq.matches);
    var clip = b.dataset.video;
    img.hidden = !!clip; vid.hidden = !clip;
    if (clip) {
      img.removeAttribute('src');
      vid.poster = b.dataset.full; vid.src = clip;
      vid.setAttribute('aria-label', thumb ? thumb.alt : '');
      if (still) vid.controls = true; else { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {}); }
    } else {
      vid.pause(); vid.removeAttribute('src'); vid.load();
      img.src = b.dataset.full;
    }
    img.alt = thumb ? thumb.alt : '';
    ov.setAttribute('aria-label', img.alt || 'Full screen view');
    stage.scrollTop = 0;
    count.textContent = (idx + 1) + ' of ' + list.length;
    prevB.disabled = idx === 0;
    nextB.disabled = idx === list.length - 1;
    [idx - 1, idx + 1].forEach(function (n) { if (list[n]) { var pre = new Image(); pre.src = list[n].dataset.full; } });
  }
  function step(d) {
    var n = idx + d;
    if (!group || n < 0 || n >= groups[group].length) return;
    idx = n; show();
  }
  function open(g, i, trigger) {
    if (!ov) build();
    group = g; idx = i; opener = trigger;
    show();
    ov.hidden = false;
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();
    document.addEventListener('keydown', onKey);
    turnMq.addEventListener('change', onTurn);
    closeB.focus();
  }
  function close() {
    if (!ov || ov.hidden) return;
    ov.hidden = true;
    img.removeAttribute('src');
    vid.pause(); vid.removeAttribute('src'); vid.load();
    document.body.style.overflow = '';
    if (window.__lenis) window.__lenis.start();
    document.removeEventListener('keydown', onKey);
    turnMq.removeEventListener('change', onTurn);
    if (opener) opener.focus();
  }
  function onTurn() {
    if (!group) return;
    var b = groups[group][idx];
    hint.hidden = !(Number(b.dataset.w) / Number(b.dataset.h) > 1.5 && turnMq.matches);
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {
      var f = [vid, closeB, prevB, nextB].filter(function (b) { return b === vid ? (!vid.hidden && vid.controls) : !b.disabled; });
      var at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }
})();
