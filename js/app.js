(function () {
  var $ = function (id) { return document.getElementById(id); };
  var canvas = $('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
  var KB = window.KVKnowledge, A = window.KVAnalysis, SIZE = 320;
  var base = null, last = null;
  var OVERLAY = { 2: [232, 193, 28], 3: [160, 82, 45], 4: [59, 29, 18], 5: [232, 101, 26] };
  var BAR = { healthy: '#2f7d4f', mild: '#8aa83a', moderate: '#e0a100', severe: '#d9701c', critical: '#b23a22' };

  // Library of conditions
  var grid = $('libgrid');
  ['sugarcane', 'rice', 'soybean', 'tomato'].forEach(function (c) {
    var d = document.createElement('div'), t = document.createElement('dt'), dd = document.createElement('dd');
    t.textContent = c[0].toUpperCase() + c.slice(1);
    dd.textContent = ['spot', 'blight', 'yellowing', 'rust'].map(function (k) { return KB[c][k].name; }).join('; ') + '.';
    d.appendChild(t); d.appendChild(dd); grid.appendChild(d);
  });

  function rand(seed) { return function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }

  function drawSample(kind) {
    var r = rand(42), g = ctx;
    g.fillStyle = '#d9dcd6'; g.fillRect(0, 0, SIZE, SIZE);
    g.save(); g.translate(SIZE / 2, SIZE / 2); g.rotate(-0.5);
    g.beginPath(); g.ellipse(0, 0, 135, 78, 0, 0, Math.PI * 2); g.fillStyle = '#3f8f43'; g.fill();
    g.strokeStyle = '#6fb06d'; g.lineWidth = 4; g.beginPath(); g.moveTo(-135, 0); g.lineTo(135, 0); g.stroke();
    g.beginPath(); g.ellipse(0, 0, 135, 78, 0, 0, Math.PI * 2); g.clip();
    function blob(x, y, rad, col) { g.beginPath(); g.arc(x, y, rad, 0, 7); g.fillStyle = col; g.fill(); }
    var i;
    if (kind === 'spot') for (i = 0; i < 9; i++) { var x = (r() - .5) * 220, y = (r() - .5) * 110; blob(x, y, 12, '#d8b72a'); blob(x, y, 9, '#a0522d'); blob(x, y, 4, '#6b3a1e'); }
    if (kind === 'blight') for (i = 0; i < 4; i++) { var bx = (r() - .5) * 150, by = (r() - .5) * 80; blob(bx, by, 40, '#4a2a14'); blob(bx + 12, by + 8, 26, '#2b160b'); }
    if (kind === 'yellow') { blob(-60, -10, 50, '#e1c21d'); blob(50, 15, 55, '#e8c11c'); blob(0, 40, 30, '#e1c21d'); }
    if (kind === 'rust') for (i = 0; i < 40; i++) blob((r() - .5) * 250, (r() - .5) * 120, 4 + r() * 4, '#e8651a');
    g.restore();
    run();
  }

  function loadFile(f) {
    var img = new Image(), url = URL.createObjectURL(f);
    img.onload = function () {
      var s = Math.min(SIZE / img.width, SIZE / img.height), w = img.width * s, h = img.height * s;
      ctx.fillStyle = '#d9dcd6'; ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);
      URL.revokeObjectURL(url); run();
    };
    img.src = url;
  }

  function run() {
    $('empty').hidden = true;
    base = ctx.getImageData(0, 0, SIZE, SIZE);
    last = A.analyze(base.data, SIZE, SIZE);
    paint(); show();
  }

  function paint() {
    if (!base) return;
    var out = ctx.createImageData(SIZE, SIZE); out.data.set(base.data);
    if ($('overlay').checked && last && last.mask) {
      for (var i = 0; i < last.mask.length; i++) {
        var c = OVERLAY[last.mask[i]]; if (!c) continue;
        out.data[i * 4] = c[0]; out.data[i * 4 + 1] = c[1]; out.data[i * 4 + 2] = c[2];
      }
    }
    ctx.putImageData(out, 0, 0);
  }

  function show() {
    $('result-empty').hidden = true; var body = $('result-body'); body.hidden = false;
    var crop = $('crop').value, acts = $('actions'); acts.textContent = '';
    if (last.error) {
      $('cond').textContent = 'No leaf detected'; $('sevlabel').textContent = '—'; $('sevpct').textContent = '0%';
      $('barfill').style.width = '0'; $('advice-sev').textContent = last.error; $('note').textContent = ''; return;
    }
    var info = last.condition === 'healthy' ? KB.healthy : KB[crop][last.condition];
    var pct = Math.round(last.fraction * 100), g = last.grade;
    $('cond').textContent = info.name;
    $('sevlabel').textContent = g.label; $('sevpct').textContent = (pct < 1 && last.fraction > 0 ? '<1' : pct) + '%';
    var fill = $('barfill'); fill.style.background = BAR[g.key]; fill.style.width = (last.fraction > 0 ? Math.max(2, pct) : 0) + '%';
    $('advice-sev').textContent = KB.severityAdvice[g.key];
    info.actions.forEach(function (a) { var li = document.createElement('li'); li.textContent = a; acts.appendChild(li); });
    $('note').textContent = last.condition === 'healthy' ? '' :
      'This is a screening estimate from colour and spread (' + last.lesions + ' damaged spots found), not a diagnosis. Confirm with a KVK or agriculture officer before spraying.';
  }

  $('file').addEventListener('change', function (e) { if (e.target.files[0]) loadFile(e.target.files[0]); });
  $('overlay').addEventListener('change', paint);
  $('crop').addEventListener('change', function () { if (last) show(); });
  document.querySelectorAll('[data-sample]').forEach(function (b) {
    b.addEventListener('click', function () { drawSample(b.dataset.sample); });
  });
  window.KVApp = { drawSample: drawSample };
})();
