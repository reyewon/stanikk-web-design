// The free site check on /site-check/. Posts the address to the Worker at
// /api/site-check, reads its NDJSON stream (one line per stage, then the
// result) and builds the progress, the five fixes and the next steps.
// Everything the Worker sends back is set with textContent, never as HTML.
(function () {
  var API = location.hostname === 'kombu.uk' ? '/api/site-check' : 'https://kombu.uk/api/site-check';
  var WA = 'https://wa.me/442381112819';
  var $ = function (id) { return document.getElementById(id); };

  var form = $('scForm'), input = $('scUrl'), go = form.querySelector('.sc-go'), err = $('scError');
  var run = $('scRun'), progress = $('scProgress'), problem = $('scProblem'), results = $('scResults'), next = $('scNext');
  var steps = Array.prototype.slice.call(document.querySelectorAll('.sc-steps li'));
  var current = null, writeTimer = null;

  var track = function (name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) {} };

  // ?url= prefills the box (for links sent to a business), but never runs on its own
  var pre = new URLSearchParams(location.search).get('url');
  if (pre) input.value = pre.slice(0, 300);

  function waText(site) {
    return WA + '?text=' + encodeURIComponent("Hi Ryan, I've just run the free site check on " + site + '. Could we have a quick call about it?');
  }
  function hostOf(u) { try { return new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }

  function show(el) { [progress, problem, results, next].forEach(function (x) { x.hidden = x !== el && !(el === results && x === next); }); run.hidden = false; }

  function setStep(name) {
    var idx = ['fetch', 'look', 'review', 'write'].indexOf(name);
    steps.forEach(function (li, i) {
      li.classList.toggle('is-done', i < idx);
      li.classList.toggle('is-active', i === idx);
    });
  }

  function setBusy(busy) {
    go.disabled = busy;
    go.textContent = busy ? 'Checking...' : 'Check my site';
    input.readOnly = busy;
  }

  function fail(msg, site) {
    clearTimeout(writeTimer);
    $('scProblemText').textContent = msg;
    $('scProblemWa').href = site ? waText(site) : WA;
    show(problem);
    setBusy(false);
  }

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var SEVERITY = { high: 'Fix first', medium: 'Fix soon', low: 'Polish' };

  function render(r) {
    current = r;
    var host = hostOf(r.url);
    $('scTitle').textContent = 'Five fixes for ' + (r.site_name || host);
    $('scType').textContent = r.business_type || 'Website';
    var link = $('scLink'); link.href = r.url; link.textContent = host;
    $('scStrength').textContent = r.strength || '';
    var shot = $('scShot'), old = shot.querySelector('img');
    if (old) old.remove();
    if (r.thumb) {
      var img = el('img'); img.width = 390; img.height = 844;
      img.src = 'data:image/jpeg;base64,' + r.thumb; img.alt = 'The first screen of ' + host + ' on a phone';
      shot.insertBefore(img, shot.firstChild); shot.hidden = false;
    } else shot.hidden = true;

    var list = $('scFixes'); list.textContent = '';
    (r.findings || []).forEach(function (f) {
      var li = el('li', 'sc-fix');
      var head = el('div', 'sc-fix-head');
      head.appendChild(el('h3', null, f.title));
      head.appendChild(el('span', 'chip chip--' + f.severity, SEVERITY[f.severity] || 'Fix'));
      var body = el('div', 'sc-fix-body');
      [['Where: ', f.where], ['Why it costs you: ', f.why], ['The fix: ', f.fix]].forEach(function (pair) {
        var p = el('p'); p.appendChild(el('strong', null, pair[0])); p.appendChild(document.createTextNode(pair[1] || '')); body.appendChild(p);
      });
      li.appendChild(head); li.appendChild(body); list.appendChild(li);
    });

    var unable = $('scUnable');
    if (r.unable_to_check && r.unable_to_check.length) {
      unable.textContent = "Couldn't check from here: " + r.unable_to_check.join('; ') + '.';
      unable.hidden = false;
    } else unable.hidden = true;

    $('scBook').href = waText(host);
    var note = $('scEmailNote'); note.textContent = "I'll only use your address to send this."; note.classList.remove('is-ok');
    show(results);
    setBusy(false);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    var url = input.value.trim();
    if (!url) { err.textContent = 'Pop your website address in first.'; err.hidden = false; input.focus(); return; }
    var site = hostOf(url);
    $('scHost').textContent = site;
    setBusy(true);
    setStep('fetch');
    show(progress);
    progress.scrollIntoView({ behavior: document.documentElement.classList.contains('no-motion') ? 'auto' : 'smooth', block: 'start' });
    track('site_check_start', { page_path: location.pathname });

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, website: form.elements.website.value })
    }).then(function (res) {
      if (!res.ok || !res.body) {
        return res.json().catch(function () { return {}; }).then(function (b) {
          setBusy(false);
          run.hidden = true;
          err.textContent = b.error || 'Something went wrong. Please try again in a minute.';
          err.hidden = false;
          form.scrollIntoView({ block: 'center' });
          track('site_check_refused', { reason: b.limit || res.status });
        });
      }
      var reader = res.body.getReader(), dec = new TextDecoder(), buf = '', finished = false;
      function handle(o) {
        if (o.stage === 'fetch' || o.stage === 'look') setStep(o.stage);
        else if (o.stage === 'review') { setStep('review'); writeTimer = setTimeout(function () { setStep('write'); }, 9000); }
        else if (o.stage === 'done') { finished = true; clearTimeout(writeTimer); render(o.result); track('site_check_done', { page_path: location.pathname }); }
        else if (o.stage === 'unusable') { finished = true; fail(o.message, site); track('site_check_unusable', { reason: o.reason }); }
        else if (o.stage === 'error') { finished = true; fail(o.error, site); track('site_check_error', {}); }
      }
      function pump() {
        return reader.read().then(function (chunk) {
          if (chunk.done) {
            if (buf.trim()) { try { handle(JSON.parse(buf)); } catch (e) {} }
            if (!finished) fail("The check stopped part way through. Please try again, or message me and I'll look myself.", site);
            return;
          }
          buf += dec.decode(chunk.value, { stream: true });
          var lines = buf.split('\n'); buf = lines.pop();
          lines.forEach(function (line) { if (line.trim()) { try { handle(JSON.parse(line)); } catch (e) {} } });
          return pump();
        });
      }
      return pump();
    }).catch(function () {
      fail("I couldn't reach the checker just now. Please try again in a minute.", site);
    });
  });

  document.querySelectorAll('[data-again]').forEach(function (b) {
    b.addEventListener('click', function () {
      run.hidden = true;
      input.value = '';
      form.scrollIntoView({ block: 'center' });
      input.focus();
    });
  });

  $('scEmail').addEventListener('submit', function (e) {
    e.preventDefault();
    var box = $('scEmailInput'), note = $('scEmailNote'), btn = this.querySelector('button');
    var email = box.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { note.textContent = "That email address doesn't look right."; box.focus(); return; }
    if (!current) return;
    btn.disabled = true; btn.textContent = 'Sending...';
    fetch(API + '/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: current.id, email: email }) })
      .then(function (res) { return res.json().then(function (b) { return { ok: res.ok, b: b }; }); })
      .then(function (r) {
        btn.disabled = false; btn.textContent = 'Send';
        if (r.ok) { note.textContent = 'Sent to ' + email + ". Check your junk folder if it hasn't arrived in a few minutes."; note.classList.add('is-ok'); track('site_check_email', {}); }
        else note.textContent = r.b.error || "That didn't send. Please try again.";
      })
      .catch(function () { btn.disabled = false; btn.textContent = 'Send'; note.textContent = "That didn't send. Please try again."; });
  });
})();
