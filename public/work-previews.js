/* Recorded work previews stay passive so page scrolling always wins. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var staticMode = document.documentElement.classList.contains('no-motion') || reduce.matches;
  var paused = false, items = Array.prototype.slice.call(document.querySelectorAll('[data-work-preview]'));
  try { paused = sessionStorage.getItem('kombu-previews-paused') === 'true'; } catch (e) {}
  if (!items.length) return;

  function setButtons() { document.querySelectorAll('[data-work-previews-toggle]').forEach(function (b) { b.hidden = staticMode; b.setAttribute('aria-pressed', String(paused)); b.textContent = paused ? 'Play previews' : 'Pause previews'; }); }
  function stop(item) { var video = item.querySelector('video'); item._wanted = false; if (video) video.pause(); item.classList.remove('is-playing'); }
  function load(item) { var video = item.querySelector('video'); if (video && !video.src) { video.src = video.dataset.src; video.load(); } }
  function restart(item) {
    var video = item.querySelector('video');
    if (!video || item._restarting) return;
    item._restarting = true; item.classList.add('is-restarting');
    setTimeout(function () {
      item._restarting = false; item.classList.remove('is-restarting');
      if (!item._wanted || staticMode || paused || document.hidden) return;
      video.currentTime = 0; play(item);
    }, 190);
  }
  function play(item) {
    var video = item.querySelector('video');
    if (!video || staticMode || paused || document.hidden) return;
    item._wanted = true; video.muted = true;
    load(item);
    if (video.ended) { restart(item); return; }
    if (!video.paused) { item.classList.add('is-playing'); return; }
    video.play().then(function () {
      if (item._wanted && !staticMode && !paused && !document.hidden) item.classList.add('is-playing');
      else video.pause();
    }).catch(function () {});
  }
  function update() {
    var midpoint = innerHeight / 2, limit = innerWidth < 768 ? 1 : 3;
    var active = items.filter(function (item) { var r = item.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; }).sort(function (a, b) {
      var ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
      return Math.abs(ar.top + ar.height / 2 - midpoint) - Math.abs(br.top + br.height / 2 - midpoint);
    }).slice(0, limit);
    items.forEach(function (item) {
      var selected = active.indexOf(item) > -1;
      item.classList.toggle('is-selected', selected);
      selected ? play(item) : stop(item);
    });
  }
  var pending = 0;
  function schedule() { if (!pending) pending = requestAnimationFrame(function () { pending = 0; update(); }); }

  var loader = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { if (entry.isIntersecting && !staticMode) load(entry.target); });
    schedule();
  }, { rootMargin: '320px 0px' });
  items.forEach(function (item) {
    loader.observe(item);
    item.querySelector('video').addEventListener('ended', function () { if (item._wanted && !paused && !staticMode) restart(item); });
  });
  document.querySelectorAll('[data-work-previews-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      paused = !paused;
      try { sessionStorage.setItem('kombu-previews-paused', String(paused)); } catch (e) {}
      if (paused) items.forEach(stop); else update();
      setButtons();
    });
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', function () { if (document.hidden) items.forEach(stop); else update(); });
  reduce.addEventListener('change', function () { staticMode = reduce.matches || document.documentElement.classList.contains('no-motion'); if (staticMode) items.forEach(stop); else update(); setButtons(); });
  setButtons();
  if (!staticMode) update();
})();
