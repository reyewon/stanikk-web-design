/* Case studies: the film at the top, the swipe strips and the full-screen viewer.
   Everything works without it except the film and the viewer: the film stays a
   still, the strips are plain horizontal scrollers and every piece is still on
   the page. */
(function () {
  var html = document.documentElement;
  var still = html.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = matchMedia('(max-width: 767px)');

  /* ---------- The film at the top: 4:5 on phones, 16:9 above ----------
     Plays muted and looped while at least a quarter of it is on screen, and
     pauses when it scrolls away. "Play with sound" starts it from the top with
     the music on; "Pause" holds it until pressed again. Reduced motion,
     ?nomotion and Save-Data keep it a still until someone presses Play. */
  document.querySelectorAll('[data-promo]').forEach(function (box) {
    var video = box.querySelector('video');
    var soundB = box.querySelector('[data-promo-sound]');
    var pauseB = box.querySelector('[data-promo-pause]');
    if (!video || !soundB || !pauseB) return;
    var saveData = navigator.connection && navigator.connection.saveData;
    var held = still || !!saveData, inView = false;
    function wanted() { return phone.matches ? box.dataset.tall : box.dataset.wide; }
    function load() {
      var src = wanted();
      if (video.dataset.current === src) return;
      var at = video.dataset.current ? video.currentTime : 0;
      video.dataset.current = src;
      box.classList.remove('is-playing');
      video.src = src; video.load();
      if (at) video.addEventListener('loadedmetadata', function once() { video.removeEventListener('loadedmetadata', once); video.currentTime = at; });
    }
    function render() {
      soundB.textContent = video.muted ? 'Play with sound' : 'Mute';
      soundB.setAttribute('aria-pressed', String(!video.muted));
      pauseB.textContent = held ? 'Play' : 'Pause';
      pauseB.setAttribute('aria-pressed', String(held));
    }
    function sync() {
      if (inView && !held) {
        load();
        var p = video.play();
        // a browser that refuses sound here falls back to the silent loop rather than sticking
        if (p && p.catch) p.catch(function () { if (!video.muted) { video.muted = true; render(); video.play().catch(function () {}); } });
      }
      else if (!video.paused) video.pause();
      render();
    }
    function track(name) { if (window.gtag) window.gtag('event', name, { film: box.dataset.name || '', film_cut: phone.matches ? 'tall' : 'wide' }); }
    soundB.addEventListener('click', function () {
      if (video.muted) { load(); video.muted = false; video.currentTime = 0; held = false; track('film_sound_on'); }
      else { video.muted = true; track('film_mute'); }
      sync();
    });
    pauseB.addEventListener('click', function () { held = !held; track(held ? 'film_pause' : 'film_play'); sync(); });
    video.addEventListener('playing', function () { box.classList.add('is-playing'); });
    soundB.hidden = false; pauseB.hidden = false;
    render();
    new IntersectionObserver(function (entries) {
      inView = entries[0].intersectionRatio >= 0.25;
      sync();
    }, { threshold: [0, 0.25] }).observe(box);
    phone.addEventListener('change', function () { if (video.dataset.current) { load(); sync(); } });
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
