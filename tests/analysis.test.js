const test = require('node:test');
const assert = require('node:assert');
const A = require('../js/analysis.js');
const KB = require('../js/knowledge.js');

const W = 100, H = 100;
// Build a synthetic image: grey background, green leaf disc, optional painted patches.
function makeImage(patches) {
  const d = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, inLeaf = (x - 50) ** 2 + (y - 50) ** 2 < 40 ** 2;
    const c = inLeaf ? [60, 140, 70] : [215, 218, 212];
    d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
  }
  (patches || []).forEach(p => {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if ((x - p.x) ** 2 + (y - p.y) ** 2 < p.r ** 2 && (x - 50) ** 2 + (y - 50) ** 2 < 40 ** 2) {
        const i = (y * W + x) * 4; d[i] = p.c[0]; d[i + 1] = p.c[1]; d[i + 2] = p.c[2];
      }
    }
  });
  return d;
}

test('pixel classes', () => {
  assert.strictEqual(A.classifyPixel(215, 218, 212), A.CLASSES.BG);
  assert.strictEqual(A.classifyPixel(60, 140, 70), A.CLASSES.HEALTHY);
  assert.strictEqual(A.classifyPixel(232, 193, 28), A.CLASSES.YELLOW);
  assert.strictEqual(A.classifyPixel(160, 82, 45), A.CLASSES.BROWN);
  assert.strictEqual(A.classifyPixel(232, 101, 26), A.CLASSES.RUST);
});

test('healthy leaf is graded healthy', () => {
  const r = A.analyze(makeImage(), W, H);
  assert.strictEqual(r.grade.key, 'healthy');
  assert.strictEqual(r.condition, 'healthy');
});

test('leaf with brown spots is a leaf spot with a mild-to-moderate grade', () => {
  const brown = [150, 80, 45];
  const r = A.analyze(makeImage([{ x: 35, y: 40, r: 6, c: brown }, { x: 60, y: 55, r: 7, c: brown }, { x: 50, y: 70, r: 5, c: brown }]), W, H);
  assert.strictEqual(r.condition, 'spot');
  assert.ok(r.fraction > 0.01 && r.fraction < 0.25, 'fraction ' + r.fraction);
  assert.ok(r.lesions >= 3);
});

test('yellow patches are detected as yellowing', () => {
  const r = A.analyze(makeImage([{ x: 50, y: 50, r: 22, c: [232, 193, 28] }]), W, H);
  assert.strictEqual(r.condition, 'yellowing');
});

test('large dark blotches are detected as blight and graded severe or worse', () => {
  const r = A.analyze(makeImage([{ x: 50, y: 50, r: 30, c: [45, 25, 15] }]), W, H);
  assert.strictEqual(r.condition, 'blight');
  assert.ok(r.grade.level >= 3);
});

test('image without a leaf returns an error', () => {
  const d = new Uint8ClampedArray(W * H * 4).fill(215);
  assert.ok(A.analyze(d, W, H).error);
});

test('knowledge base covers every crop and condition', () => {
  ['sugarcane', 'rice', 'soybean', 'tomato'].forEach(c =>
    ['spot', 'blight', 'yellowing', 'rust'].forEach(k => {
      assert.ok(KB[c][k].name && KB[c][k].actions.length >= 2, c + '/' + k);
    }));
});
