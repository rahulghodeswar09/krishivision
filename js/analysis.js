/* KrishiVision image analysis: colour-based leaf segmentation, severity grading, condition matching. */
(function (root) {
  var BG = 0, HEALTHY = 1, YELLOW = 2, BROWN = 3, DARK = 4, RUST = 5;

  function toHSV(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (d) {
      if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return [h, mx ? d / mx : 0, mx];
  }

  function classifyPixel(r, g, b) {
    var p = toHSV(r, g, b), h = p[0], s = p[1], v = p[2];
    if ((s < 0.18 && v > 0.55) || v < 0.06) return BG;
    if (h >= 65 && h <= 170) return s >= 0.22 || v < 0.3 ? (v < 0.12 ? DARK : HEALTHY) : BG;
    if (h >= 45 && h < 65 && s > 0.35) return YELLOW;
    if (h >= 12 && h < 40 && s > 0.65 && v > 0.65) return RUST;
    if (v < 0.3) return DARK;
    if (h < 45 || h >= 330) return BROWN;
    return HEALTHY;
  }

  function countBlobs(mask, w, h, minSize) {
    var seen = new Uint8Array(mask.length), blobs = 0, total = 0, stack = [];
    for (var i = 0; i < mask.length; i++) {
      if (!mask[i] || seen[i]) continue;
      var size = 0; stack.push(i); seen[i] = 1;
      while (stack.length) {
        var c = stack.pop(); size++;
        var x = c % w, y = (c - x) / w;
        if (x > 0 && mask[c - 1] && !seen[c - 1]) { seen[c - 1] = 1; stack.push(c - 1); }
        if (x < w - 1 && mask[c + 1] && !seen[c + 1]) { seen[c + 1] = 1; stack.push(c + 1); }
        if (y > 0 && mask[c - w] && !seen[c - w]) { seen[c - w] = 1; stack.push(c - w); }
        if (y < h - 1 && mask[c + w] && !seen[c + w]) { seen[c + w] = 1; stack.push(c + w); }
      }
      if (size >= minSize) { blobs++; total += size; }
    }
    return { count: blobs, avgSize: blobs ? total / blobs : 0 };
  }

  var GRADES = [
    { max: 0.01, key: 'healthy', label: 'Healthy', level: 0 },
    { max: 0.10, key: 'mild', label: 'Mild', level: 1 },
    { max: 0.25, key: 'moderate', label: 'Moderate', level: 2 },
    { max: 0.50, key: 'severe', label: 'Severe', level: 3 },
    { max: 1.01, key: 'critical', label: 'Critical', level: 4 }
  ];
  function gradeFor(fraction) {
    for (var i = 0; i < GRADES.length; i++) if (fraction < GRADES[i].max) return GRADES[i];
    return GRADES[GRADES.length - 1];
  }

  /** data: RGBA array (ImageData.data), returns analysis or {error}. */
  function analyze(data, w, h) {
    var n = w * h, mask = new Uint8Array(n), cnt = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < n; i++) {
      var k = classifyPixel(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
      mask[i] = k; cnt[k]++;
    }
    var leaf = n - cnt[BG];
    if (leaf < n * 0.05) return { error: 'No leaf found. Place one leaf on a plain background in good light.', mask: mask };
    var lesionPx = cnt[YELLOW] * 0.5 + cnt[BROWN] + cnt[DARK] + cnt[RUST];
    var fraction = Math.min(1, lesionPx / leaf);
    var lesionTotal = cnt[YELLOW] + cnt[BROWN] + cnt[DARK] + cnt[RUST];
    var share = function (c) { return lesionTotal ? c / lesionTotal : 0; };
    var dmg = new Uint8Array(n);
    for (var j = 0; j < n; j++) dmg[j] = mask[j] >= BROWN ? 1 : 0;
    var blobs = countBlobs(dmg, w, h, Math.max(4, Math.round(leaf * 0.0005)));
    var grade = gradeFor(fraction), cls;
    if (grade.key === 'healthy') cls = 'healthy';
    else if (share(cnt[RUST]) > 0.3) cls = 'rust';
    else if (share(cnt[YELLOW]) > 0.55) cls = 'yellowing';
    else if (share(cnt[DARK]) > 0.4 && blobs.avgSize > leaf * 0.01) cls = 'blight';
    else cls = 'spot';
    return { mask: mask, leafPixels: leaf, fraction: fraction, grade: grade, condition: cls, lesions: blobs.count,
      shares: { yellow: share(cnt[YELLOW]), brown: share(cnt[BROWN]), dark: share(cnt[DARK]), rust: share(cnt[RUST]) } };
  }

  var api = { analyze: analyze, classifyPixel: classifyPixel, gradeFor: gradeFor, CLASSES: { BG: BG, HEALTHY: HEALTHY, YELLOW: YELLOW, BROWN: BROWN, DARK: DARK, RUST: RUST } };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KVAnalysis = api;
})(typeof window !== 'undefined' ? window : globalThis);
