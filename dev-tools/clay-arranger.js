/* Clay arranger engine (dev only). Layout.astro inlines this file only under `npm run dev`
   (import.meta.env.DEV), so it never reaches a build or kombu.uk.

   Open any page with ?arrange and it hands over to the harness (dev-tools/arrange.html), which
   shows the page inside a phone, tablet, laptop or desktop frame with the controls beside it.
   Inside that frame this engine does the work: click a clay prop or any block of the page
   (heading, paragraph, form, pill, image), drag to move it, drag the corner square to resize,
   and for props drag the dot to rotate. Everything saves in localStorage per page and per width
   band (phone up to 640px, tablet 641 to 900, laptop 901 to 1440, wide above that), and the
   harness's "Copy all" hands the lot over as JSON so it can be baked into the real CSS. */
(function () {
  if (!/[?&]arrange(=|&|$)/.test(location.search)) return;
  var LIB = window.__clayLib || { base: '', names: [], harness: '' };
  var tierOf = function (w) { return w <= 640 ? 'phone' : w <= 900 ? 'tablet' : w <= 1440 ? 'laptop' : 'wide'; };

  // Opened directly: hand over to the harness, which frames this page at a chosen device size.
  if (window.top === window && !/[?&]arrange=inner/.test(location.search)) {
    if (LIB.harness) location.replace(LIB.harness + '?page=' + encodeURIComponent(location.pathname) + '&device=' + tierOf(innerWidth));
    return;
  }

  var KEY = 'kombu-clay-arrange-v3';
  var root = document.documentElement, path = location.pathname, tier = tierOf(innerWidth);
  var items = [], blocks = {}, sel = null, drag = null, listeners = [];

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function bucket(s) { s[path] = s[path] || {}; s[path][tier] = s[path][tier] || {}; return s[path][tier]; }
  function notify() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }

  // ---------- undo / redo ----------
  var HKEY = KEY + ':history:' + path + ':' + tier;
  var hist = (function () { try { return JSON.parse(sessionStorage.getItem(HKEY)) || { undo: [], redo: [] }; } catch (e) { return { undo: [], redo: [] }; } })();
  function saveHist() { try { sessionStorage.setItem(HKEY, JSON.stringify(hist)); } catch (e) {} }
  function snap(s) {
    if (s.kind === 'prop') { var i = s.it; return { kind: 'prop', name: i.name, present: true, x: i.x, y: i.y, w: i.w, rot: i.rot, hidden: !!i.hidden, note: i.note || '', added: !!i.added, cardIndex: cards().indexOf(i.card) }; }
    var b = s.b; return { kind: 'block', key: b.key, dx: b.dx, dy: b.dy, w: b.w, note: b.note || '' };
  }
  function record(before, after) {
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    hist.undo.push({ before: before, after: after });
    if (hist.undo.length > 300) hist.undo.shift();
    hist.redo = []; saveHist();
  }
  function sameAsOrig(it) {
    var o = it.orig;
    return !!o && Math.round(o.x) === Math.round(it.x) && Math.round(o.y) === Math.round(it.y) && Math.round(o.w) === Math.round(it.w) && o.rot === it.rot && !!o.hidden === !!it.hidden && !it.note;
  }
  function saveProp(it) {
    // back where the site puts it: forget the saved entry, so it reads as untouched
    if (sameAsOrig(it)) { var s = load(); delete bucket(s)[it.name]; save(s); } else persistProp(it);
  }
  function restore(st) {
    if (Array.isArray(st)) { st.forEach(restore); return; }
    if (st.kind === 'prop') {
      var it = items.filter(function (i) { return i.name === st.name; })[0];
      if (!st.present) {
        if (it) {
          it.el.remove(); items = items.filter(function (i) { return i !== it; });
          var s = load(); delete bucket(s)[it.name]; save(s);
          if (sel && sel.it === it) sel = null;
        }
        placeBoxes(); return;
      }
      if (!it) { var card = cards()[st.cardIndex]; if (!card) return; it = addProp(makeImg(st.name), card, st, { added: true }); }
      it.x = st.x; it.y = st.y; it.w = st.w; it.rot = st.rot; it.hidden = st.hidden; it.note = st.note;
      applyProp(it); saveProp(it);
      select({ kind: 'prop', it: it });
    } else {
      var el = document.querySelector(st.key); if (!el) return;
      var b = blockFor(el); b.dx = st.dx; b.dy = st.dy; b.w = st.w; b.note = st.note;
      applyBlock(b); persistBlock(b);
      select({ kind: 'block', b: b });
    }
  }
  // Everything moved at this size, straight from what's saved, so an item can be reset even when
  // it's hard to click on the page (it got dragged under something, or off the edge).
  function movedList() {
    var bk = bucket(load()), out = [];
    Object.keys(bk).forEach(function (n) {
      if (n === '__blocks') return;
      out.push({ id: 'p:' + n, label: n.replace(/-/g, ' ') + (bk[n].added ? ' (added)' : '') + (bk[n].hidden ? ' (off)' : '') });
    });
    Object.keys(bk.__blocks || {}).forEach(function (k) {
      var e = bk.__blocks[k], el = document.querySelector(k);
      out.push({ id: 'b:' + k, label: (el ? labelOf(el) : e.what) + (e.card ? ' in ' + e.card : '') });
    });
    return out;
  }
  function resetOne(id, batch) {
    var before, after;
    if (id.slice(0, 2) === 'p:') {
      var name = id.slice(2), it = items.filter(function (i) { return i.name === name; })[0];
      if (!it) { var s = load(); delete bucket(s)[name]; save(s); return; }
      before = snap({ kind: 'prop', it: it });
      if (it.added) {
        it.el.remove(); items = items.filter(function (i) { return i !== it; });
        var s2 = load(); delete bucket(s2)[name]; save(s2);
        if (sel && sel.it === it) sel = null;
        after = { kind: 'prop', name: name, present: false };
      } else {
        it.x = it.orig.x; it.y = it.orig.y; it.w = it.orig.w; it.rot = it.orig.rot; it.hidden = !!it.orig.hidden; it.note = '';
        applyProp(it); saveProp(it); after = snap({ kind: 'prop', it: it });
      }
    } else {
      var key = id.slice(2), el = document.querySelector(key);
      if (!el) { var s3 = load(), bk = bucket(s3); if (bk.__blocks) delete bk.__blocks[key]; save(s3); return; }
      var b = blockFor(el); before = snap({ kind: 'block', b: b });
      b.dx = 0; b.dy = 0; b.w = null; b.note = ''; applyBlock(b); persistBlock(b);
      after = snap({ kind: 'block', b: b });
    }
    if (batch) { batch.before.push(before); batch.after.push(after); } else record(before, after);
  }
  function resetAll() {
    var batch = { before: [], after: [] };
    movedList().forEach(function (m) { resetOne(m.id, batch); });
    if (batch.before.length) record(batch.before, batch.after);
    placeBoxes(); notify();
  }
  function selectById(id) {
    if (id.slice(0, 2) === 'p:') { var it = items.filter(function (i) { return i.name === id.slice(2); })[0]; if (it) { select({ kind: 'prop', it: it }); it.el.scrollIntoView({ block: 'center' }); } }
    else { var el = document.querySelector(id.slice(2)); if (el) { select({ kind: 'block', b: blockFor(el) }); el.scrollIntoView({ block: 'center' }); } }
    placeBoxes();
  }
  function undo() { var e = hist.undo.pop(); if (!e) return; restore(e.before); hist.redo.push(e); saveHist(); notify(); }
  function redo() { var e = hist.redo.pop(); if (!e) return; restore(e.after); hist.undo.push(e); saveHist(); notify(); }

  root.classList.add('clay-arrange');
  root.classList.remove('clay-armed');
  try { if (window.__lenis) window.__lenis.destroy(); } catch (e) {}
  var css = document.createElement('style');
  css.textContent =
    'html.clay-arrange{scroll-behavior:auto!important}' +
    'html.clay-arrange main,html.clay-arrange main *{user-select:none!important;-webkit-user-select:none!important}' +
    'html.clay-arrange .clay{opacity:1!important;scale:1!important;translate:none!important;transition:none!important;' +
    'pointer-events:auto!important;cursor:grab;touch-action:none;-webkit-user-drag:none;z-index:40}' +
    'html.clay-arrange .clay.ca-off{opacity:.28!important}' +
    '.ca-box{position:absolute;z-index:2147483000;pointer-events:none;display:none;box-sizing:border-box}' +
    '.ca-sel{outline:2px dashed #D4714E;outline-offset:3px}' +
    '.ca-hover{outline:2px dotted rgba(31,74,60,.8);outline-offset:2px}' +
    '.ca-h{position:absolute;width:18px;height:18px;box-sizing:border-box;background:#fff;border:2px solid #141210;pointer-events:auto;touch-action:none}' +
    '.ca-h--size{right:-12px;bottom:-12px;cursor:nwse-resize;border-radius:4px}' +
    '.ca-h--rot{left:50%;top:-40px;margin-left:-9px;border-radius:50%;cursor:grab}' +
    '.ca-h--rot::after{content:"";position:absolute;left:6px;top:16px;width:2px;height:20px;background:#141210}';
  document.head.appendChild(css);

  var selBox = document.createElement('div'), hoverBox = document.createElement('div');
  selBox.className = 'ca-box ca-sel';
  hoverBox.className = 'ca-box ca-hover';
  selBox.innerHTML = '<span class="ca-h ca-h--size" title="Drag to resize"></span><span class="ca-h ca-h--rot" title="Drag to rotate"></span>';
  var sizeH = selBox.firstChild, rotH = selBox.lastChild;

  function cards() { return [].slice.call(document.querySelectorAll('.card')); }
  function cardLabel(c) {
    if (!c) return '';
    var h = c.querySelector('h1,h2,h3');
    return h ? '"' + h.textContent.trim().replace(/\s+/g, ' ').slice(0, 48) + '"' : c.className.split(' ').slice(0, 3).join('.');
  }
  function snippet(el) { return el.textContent.trim().replace(/\s+/g, ' ').slice(0, 36); }
  function labelOf(el) {
    var cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.');
    var txt = snippet(el);
    if (el.tagName === 'IMG' || el.tagName === 'VIDEO') {   // images are named by their file, e.g. image "padharo-menu"
      var src = (el.currentSrc || el.getAttribute('src') || el.getAttribute('poster') || '').split('/').pop().replace(/\?.*$/, '').replace(/\.\w+$/, '');
      return (el.tagName === 'IMG' ? 'image' : 'video') + (src ? ' "' + src + '"' : '');
    }
    return el.tagName.toLowerCase() + (cls ? '.' + cls : '') + (txt ? ' "' + txt + '"' : '');
  }
  function nameOf(el) { return (el.getAttribute('data-ca-name') || el.getAttribute('src') || '').split('/').pop().replace(/\.\w+(\?.*)?$/, ''); }

  // ---------- props ----------
  function applyProp(it) {
    var s = it.el.style;
    s.position = 'absolute'; s.left = it.x + 'px'; s.top = it.y + 'px'; s.width = it.w + 'px';
    s.height = 'auto'; s.maxWidth = 'none'; s.margin = '0'; s.right = 'auto'; s.bottom = 'auto';
    s.rotate = it.rot + 'deg'; s.display = 'block';
    it.el.classList.toggle('ca-off', !!it.hidden);
  }
  function touches(el, r) {
    var hits = [], card = el.closest('.card') || document.body;
    card.querySelectorAll('h1,h2,h3,p,a,button,input,li').forEach(function (t) {
      if (t === el || t.contains(el) || el.contains(t)) return;
      var rects = [t.getBoundingClientRect()];
      if (/^(H1|H2|H3|P|LI)$/.test(t.tagName)) { var rg = document.createRange(); rg.selectNodeContents(t); rects = [].slice.call(rg.getClientRects()); }
      var hit = rects.some(function (q) {
        var ox = Math.min(r.right, q.right) - Math.max(r.left, q.left), oy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
        return q.width > 0 && ox > 2 && oy > 2;
      });
      if (hit) hits.push(t.tagName.toLowerCase() + ' "' + snippet(t).slice(0, 30) + '"');
    });
    return hits;
  }
  function persistProp(it) {
    var s = load(), b = bucket(s), c = it.card, h = it.el.offsetHeight;
    b[it.name] = {
      x: Math.round(it.x), y: Math.round(it.y), w: Math.round(it.w), h: h, rot: it.rot,
      right: Math.round(c.clientWidth - it.x - it.w), bottom: Math.round(c.clientHeight - it.y - h),
      hidden: !!it.hidden, added: !!it.added, note: it.note || '',
      cardIndex: cards().indexOf(c), card: cardLabel(c), cardSize: c.clientWidth + 'x' + c.clientHeight,
      viewport: innerWidth + 'x' + innerHeight, touches: touches(it.el, it.el.getBoundingClientRect()), saved: new Date().toISOString()
    };
    save(s);
  }
  function addProp(el, card, geo, extra) {
    var it = { el: el, name: nameOf(el), card: card, x: geo.x, y: geo.y, w: geo.w, rot: geo.rot || 0, hidden: false, note: '', added: false, wasHidden: false };
    for (var k in extra) it[k] = extra[k];
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
    card.appendChild(el);
    el.addEventListener('load', function () { placeBoxes(); });
    applyProp(it);
    items.push(it);
    return it;
  }
  function makeImg(name) {
    var img = document.createElement('img');
    img.className = 'clay'; img.alt = ''; img.setAttribute('aria-hidden', 'true');
    img.setAttribute('data-ca-name', name);
    img.src = encodeURI(LIB.base + name.replace(/-\d+$/, '') + '.webp');
    return img;
  }
  function addFromLibrary(base) {
    var cx = innerWidth / 2, cy = innerHeight / 2, card = null, under = document.elementsFromPoint(cx, cy);
    for (var i = 0; i < under.length && !card; i++) card = under[i].closest && under[i].closest('.card');
    card = card || cards()[0];
    if (!card) return;
    var name = base, n = 2;
    while (items.some(function (it) { return it.name === name; })) name = base + '-' + n++;
    var c = card.getBoundingClientRect(), w = Math.min(140, card.clientWidth / 3);
    var it = addProp(makeImg(name), card, { x: cx - c.left - w / 2, y: Math.max(16, cy - c.top - w / 2), w: w, rot: 0 }, { added: true });
    select({ kind: 'prop', it: it }); persistProp(it);
    record({ kind: 'prop', name: name, present: false }, snap({ kind: 'prop', it: it }));
    notify();
  }

  // ---------- blocks (any part of the page's content) ----------
  function pickBlock(t) {
    while (t && t.nodeType === 1 && t !== document.body) {
      if (!t.closest('main')) return null;                  // the nav and footer stay put
      if (t.tagName === 'MAIN' || t.tagName === 'SECTION') return null;
      if (/^(BR|PICTURE|SOURCE)$/.test(t.tagName) || getComputedStyle(t).display === 'inline') { t = t.parentElement; continue; }
      return t;
    }
    return null;
  }
  function keyOf(el) {
    var parts = [];
    while (el && el.tagName !== 'MAIN' && el !== document.body) {
      var p = el.parentElement;
      parts.unshift(el.tagName.toLowerCase() + ':nth-child(' + ([].indexOf.call(p.children, el) + 1) + ')');
      el = p;
    }
    return 'main > ' + parts.join(' > ');
  }
  function blockFor(el) {
    var key = keyOf(el);
    if (!blocks[key]) blocks[key] = { el: el, key: key, dx: 0, dy: 0, w: null, note: '', label: labelOf(el) };
    return blocks[key];
  }
  function applyBlock(b) {
    b.el.style.translate = (b.dx || b.dy) ? b.dx + 'px ' + b.dy + 'px' : '';
    b.el.style.width = b.w ? b.w + 'px' : '';
    b.el.style.maxWidth = b.w ? 'none' : '';
  }
  function persistBlock(b) {
    var s = load(), bk = bucket(s);
    bk.__blocks = bk.__blocks || {};
    if (!b.dx && !b.dy && !b.w && !b.note) delete bk.__blocks[b.key];
    else bk.__blocks[b.key] = {
      what: b.label, card: cardLabel(b.el.closest('.card')), dx: Math.round(b.dx), dy: Math.round(b.dy), w: b.w ? Math.round(b.w) : null,
      note: b.note || '', viewport: innerWidth + 'x' + innerHeight, touches: touches(b.el, b.el.getBoundingClientRect()), saved: new Date().toISOString()
    };
    save(s);
  }

  // ---------- selection boxes ----------
  function boxOf(s) {
    if (s.kind === 'prop') {
      var it = s.it, c = it.card.getBoundingClientRect();
      return { l: c.left + it.card.clientLeft + it.x + scrollX, t: c.top + it.card.clientTop + it.y + scrollY, w: it.w, h: it.el.offsetHeight, rot: it.rot };
    }
    var r = s.b.el.getBoundingClientRect();
    return { l: r.left + scrollX, t: r.top + scrollY, w: r.width, h: r.height, rot: 0 };
  }
  function drawBox(box, b) {
    box.style.display = 'block';
    box.style.left = b.l + 'px'; box.style.top = b.t + 'px'; box.style.width = b.w + 'px'; box.style.height = b.h + 'px';
    box.style.rotate = b.rot + 'deg';
  }
  function placeBoxes() {
    if (sel) { drawBox(selBox, boxOf(sel)); rotH.style.display = sel.kind === 'prop' ? '' : 'none'; } else selBox.style.display = 'none';
  }
  function select(s) { sel = s; hoverBox.style.display = 'none'; placeBoxes(); notify(); }

  // ---------- pointer: move, resize, rotate ----------
  function propOf(t) { return items.filter(function (i) { return i.el === t; })[0]; }
  document.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    var t = e.target;
    if ((t === sizeH || t === rotH) && sel) { e.preventDefault(); start(e, t === sizeH ? 'size' : 'rot'); return; }
    var it = propOf(t);
    if (it) { e.preventDefault(); select({ kind: 'prop', it: it }); start(e, 'move'); return; }
    var el = pickBlock(t);
    if (el) { e.preventDefault(); select({ kind: 'block', b: blockFor(el) }); start(e, 'move'); }
  }, true);
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('main')) { e.preventDefault(); e.stopPropagation(); } }, true);
  function start(e, mode) {
    var r = (sel.kind === 'prop' ? sel.it.el : sel.b.el).getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    drag = { mode: mode, sx: e.clientX, sy: e.clientY, cx: cx, cy: cy, a0: Math.atan2(e.clientY - cy, e.clientX - cx), moved: false, before: snap(sel) };
    if (sel.kind === 'prop') { drag.x = sel.it.x; drag.y = sel.it.y; drag.w = sel.it.w; drag.rot = sel.it.rot; }
    else { drag.x = sel.b.dx; drag.y = sel.b.dy; drag.w = sel.b.w || r.width; }
    try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
  }
  document.addEventListener('pointermove', function (e) {
    if (!drag) {
      var t = e.target, el = propOf(t) ? t : pickBlock(t);
      if (el && !(sel && ((sel.kind === 'prop' && sel.it.el === el) || (sel.kind === 'block' && sel.b.el === el)))) {
        var r = el.getBoundingClientRect(); drawBox(hoverBox, { l: r.left + scrollX, t: r.top + scrollY, w: r.width, h: r.height, rot: 0 });
      } else hoverBox.style.display = 'none';
      return;
    }
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    if (sel.kind === 'prop') {
      var it = sel.it;
      if (drag.mode === 'move') { it.x = Math.round(drag.x + dx); it.y = Math.round(drag.y + dy); }
      else if (drag.mode === 'size') { var th = drag.rot * Math.PI / 180; it.w = Math.max(32, Math.round(drag.w + dx * Math.cos(th) + dy * Math.sin(th))); }
      else { var a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx); it.rot = Math.round((drag.rot + (a - drag.a0) * 180 / Math.PI) * 2) / 2; }
      applyProp(it);
    } else {
      var b = sel.b;
      if (drag.mode === 'move') { b.dx = Math.round(drag.x + dx); b.dy = Math.round(drag.y + dy); }
      else if (drag.mode === 'size') b.w = Math.max(40, Math.round(drag.w + dx));
      applyBlock(b);
    }
    placeBoxes();
  });
  function end() {
    if (!drag) return;
    var moved = drag.moved, before = drag.before; drag = null;
    if (!moved) return notify();
    if (sel.kind === 'prop') { if (sel.it.hidden) { sel.it.hidden = false; applyProp(sel.it); } saveProp(sel.it); }
    else persistBlock(sel.b);
    record(before, snap(sel));
    placeBoxes(); notify();
  }
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
  addEventListener('scroll', function () { placeBoxes(); hoverBox.style.display = 'none'; }, { passive: true });
  addEventListener('resize', placeBoxes);

  // ---------- keys: nudge, size, rotate ----------
  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test((e.target || {}).tagName)) return;
    var z = (e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z'), y = e.ctrlKey && (e.key === 'y' || e.key === 'Y');
    if (z || y) { e.preventDefault(); if (y || e.shiftKey) redo(); else undo(); return; }
    if (!sel) return;
    var k = e.key, step = e.shiftKey ? 10 : 1, a = null;
    if (k === 'Escape') { select(null); return; }
    if (/^Arrow/.test(k)) {
      e.preventDefault();
      var ddx = k === 'ArrowLeft' ? -step : k === 'ArrowRight' ? step : 0, ddy = k === 'ArrowUp' ? -step : k === 'ArrowDown' ? step : 0;
      var before = snap(sel);
      if (sel.kind === 'prop') { sel.it.x += ddx; sel.it.y += ddy; applyProp(sel.it); saveProp(sel.it); }
      else { sel.b.dx += ddx; sel.b.dy += ddy; applyBlock(sel.b); persistBlock(sel.b); }
      record(before, snap(sel));
      placeBoxes(); notify(); return;
    }
    if (k === '[') a = 'rl'; else if (k === ']') a = 'rr'; else if (k === '-') a = 'smaller'; else if (k === '=' || k === '+') a = 'bigger';
    if (a) { e.preventDefault(); act(a, step === 10 ? 3 : 1); }
  });

  // ---------- actions (called by the harness panel and the keys) ----------
  function act(a, mult) {
    if (!sel) return;
    mult = mult || 1;
    if (a === 'parent') { if (sel.kind === 'block') { var p = pickBlock(sel.b.el.parentElement); if (p) select({ kind: 'block', b: blockFor(p) }); } return; }
    var before = snap(sel);
    if (sel.kind === 'prop') {
      var it = sel.it;
      if (a === 'smaller') it.w = Math.max(32, Math.round(it.w * Math.pow(0.95, mult)));
      else if (a === 'bigger') it.w = Math.round(it.w * Math.pow(1.05, mult));
      else if (a === 'rl') it.rot -= 1 * mult;
      else if (a === 'rr') it.rot += 1 * mult;
      else if (a === 'hide') it.hidden = !it.hidden;
      else if (a === 'reset') {
        if (!it.orig) return;
        it.x = it.orig.x; it.y = it.orig.y; it.w = it.orig.w; it.rot = it.orig.rot; it.hidden = !!it.orig.hidden; it.note = '';
      }
      else if (a === 'remove') {
        if (!it.added) { it.hidden = true; }
        else {
          var s2 = load(); delete bucket(s2)[it.name]; save(s2); it.el.remove(); items = items.filter(function (i) { return i !== it; });
          record(before, { kind: 'prop', name: it.name, present: false }); select(null); return;
        }
      }
      applyProp(it); saveProp(it);
    } else {
      var b = sel.b;
      if (a === 'smaller' || a === 'bigger') { var w = b.w || b.el.getBoundingClientRect().width; b.w = Math.max(40, Math.round(w * Math.pow(a === 'bigger' ? 1.05 : 0.95, mult))); }
      else if (a === 'reset') { b.dx = 0; b.dy = 0; b.w = null; b.note = ''; }
      applyBlock(b); persistBlock(b);
    }
    record(before, snap(sel));
    placeBoxes(); notify();
  }

  function init() {
    var s = load(), saved = (s[path] || {})[tier] || {};
    // measure every prop where the site puts it, before moving any of them into its card
    var seenNames = {};
    var found = [].slice.call(document.querySelectorAll('img.clay')).map(function (el) {
      el.loading = 'eager';
      // the same prop can appear twice on a page (the /web-design magnifier has a heading copy and a
      // wide-screen column copy, one hidden at any width), so repeats get their own save key
      var base = nameOf(el); seenNames[base] = (seenNames[base] || 0) + 1;
      if (seenNames[base] > 1 && !el.hasAttribute('data-ca-name')) el.setAttribute('data-ca-name', base + '-' + seenNames[base]);
      var card = el.closest('.card') || el.parentElement;
      var shown = getComputedStyle(el).display !== 'none' && el.getClientRects().length > 0;
      var rot = parseFloat(getComputedStyle(el).getPropertyValue('--clay-rot')) || 0, geo = null;
      if (shown) {
        el.style.rotate = '0deg';
        var r = el.getBoundingClientRect(), c = card.getBoundingClientRect();
        geo = { x: r.left - c.left - card.clientLeft, y: r.top - c.top - card.clientTop, w: r.width, rot: rot };
      }
      return { el: el, card: card, geo: geo, rot: rot };
    });
    found.forEach(function (f) {
      var name = nameOf(f.el), sp = saved[name];
      var geo = f.geo || { x: Math.max(16, f.card.clientWidth - 150), y: 24, w: Math.min(120, f.card.clientWidth / 3), rot: f.rot };
      var it = addProp(f.el, f.card, sp ? { x: sp.x, y: sp.y, w: sp.w, rot: sp.rot } : geo, {});
      it.orig = { x: geo.x, y: geo.y, w: geo.w, rot: geo.rot, hidden: !f.geo };
      if (!f.geo) it.wasHidden = true;
      if (sp) { it.hidden = sp.hidden; it.note = sp.note || ''; }
      else if (!f.geo) it.hidden = true;
      applyProp(it);
    });
    Object.keys(saved).forEach(function (name) {
      var sp = saved[name];
      if (name === '__blocks' || !sp.added || items.some(function (i) { return i.name === name; })) return;
      var card = cards()[sp.cardIndex]; if (!card) return;
      var it = addProp(makeImg(name), card, { x: sp.x, y: sp.y, w: sp.w, rot: sp.rot }, { added: true, note: sp.note || '' });
      it.hidden = sp.hidden; applyProp(it);
    });
    var sb = saved.__blocks || {};
    Object.keys(sb).forEach(function (key) {
      var el = document.querySelector(key); if (!el) return;
      var b = blockFor(el); b.dx = sb[key].dx || 0; b.dy = sb[key].dy || 0; b.w = sb[key].w || null; b.note = sb[key].note || '';
      applyBlock(b);
    });
    document.body.appendChild(hoverBox);
    document.body.appendChild(selBox);
    window.__arrange = {
      tier: tier, width: innerWidth, library: LIB.names,
      props: function () { return items.map(function (i) { return { name: i.name, hidden: !!i.hidden, added: !!i.added, wasHidden: !!i.wasHidden }; }); },
      movedBlocks: function () { return Object.keys((bucket(load()).__blocks) || {}).length; },
      current: function () {
        if (!sel) return null;
        if (sel.kind === 'prop') { var i = sel.it; return { kind: 'prop', name: i.name, x: Math.round(i.x), y: Math.round(i.y), w: Math.round(i.w), rot: i.rot, hidden: !!i.hidden, wasHidden: !!i.wasHidden, added: !!i.added, note: i.note || '' }; }
        var b = sel.b; return { kind: 'block', name: b.label, dx: b.dx, dy: b.dy, w: b.w, note: b.note || '' };
      },
      selectProp: function (name) { var it = items.filter(function (i) { return i.name === name; })[0]; if (it) { select({ kind: 'prop', it: it }); it.el.scrollIntoView({ block: 'center' }); placeBoxes(); } },
      act: act,
      undo: undo, redo: redo,
      moved: movedList, resetOne: function (id) { resetOne(id); placeBoxes(); notify(); }, resetAll: resetAll, selectById: selectById,
      canUndo: function () { return hist.undo.length; }, canRedo: function () { return hist.redo.length; },
      note: function (t) { if (!sel) return; if (sel.kind === 'prop') { sel.it.note = t; persistProp(sel.it); } else { sel.b.note = t; persistBlock(sel.b); } },
      add: addFromLibrary,
      deselect: function () { select(null); },
      clear: function () { var s3 = load(); if (s3[path]) delete s3[path][tier]; save(s3); location.reload(); },
      onChange: function (fn) { listeners.push(fn); }
    };
    notify();
  }

  var go = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(init); };
  if (document.readyState === 'complete') go(); else addEventListener('load', go);
})();
