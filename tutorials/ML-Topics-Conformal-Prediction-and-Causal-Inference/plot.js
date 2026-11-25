// Small helpers shared by the lesson figures. Plain SVG, no libraries.
const SVGNS = 'http://www.w3.org/2000/svg';
const COL = { blue: '#2a78d6', orange: '#eb6834', ink: '#0b0b0b', ink2: '#52514e',
              rule: '#e4e3df', gray: '#c9c8c3', band: '#d6e6f8' };

function el(tag, attrs, parent) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function label(parent, x, y, s, attrs) {
  const t = el('text', Object.assign({ x, y }, attrs || {}), parent);
  t.textContent = s;
  return t;
}
function tip(node, s) { el('title', {}, node).textContent = s; return node; }
function fmt(v) { return Number.isInteger(v) ? String(v) : String(+v.toFixed(2)); }

// Clears the svg, draws axes for data ranges xr=[a,b], yr=[c,d], returns the scales.
function frame(svg, xr, yr, opt) {
  opt = opt || {};
  svg.innerHTML = '';
  const W = +svg.getAttribute('width'), H = +svg.getAttribute('height');
  const m = Object.assign({ l: 52, r: 14, t: 14, b: 42 }, opt.margin || {});
  const X = v => m.l + (v - xr[0]) / (xr[1] - xr[0]) * (W - m.l - m.r);
  const Y = v => H - m.b - (v - yr[0]) / (yr[1] - yr[0]) * (H - m.t - m.b);
  const g = el('g', {}, svg);
  (opt.yt || []).forEach(v => {
    el('line', { x1: X(xr[0]), x2: X(xr[1]), y1: Y(v), y2: Y(v), stroke: COL.rule }, g);
    label(g, X(xr[0]) - 6, Y(v) + 4, opt.yf ? opt.yf(v) : fmt(v), { 'text-anchor': 'end', fill: COL.ink2 });
  });
  (opt.xt || []).forEach(v => {
    el('line', { x1: X(v), x2: X(v), y1: Y(yr[0]), y2: Y(yr[0]) + 4, stroke: COL.ink2 }, g);
    label(g, X(v), Y(yr[0]) + 17, opt.xf ? opt.xf(v) : fmt(v), { 'text-anchor': 'middle', fill: COL.ink2 });
  });
  el('line', { x1: X(xr[0]), x2: X(xr[1]), y1: Y(yr[0]), y2: Y(yr[0]), stroke: COL.ink2 }, g);
  el('line', { x1: X(xr[0]), x2: X(xr[0]), y1: Y(yr[0]), y2: Y(yr[1]), stroke: COL.ink2 }, g);
  if (opt.xl) label(g, (X(xr[0]) + X(xr[1])) / 2, H - 6, opt.xl, { 'text-anchor': 'middle' });
  if (opt.yl) { const yc = (Y(yr[0]) + Y(yr[1])) / 2;
    label(g, 14, yc, opt.yl, { 'text-anchor': 'middle', transform: `rotate(-90 14 ${yc})` }); }
  return { X, Y, W, H, m };
}

// Histogram bars of `values` on bins [lo, hi) of width w; returns the counts.
function hist(svg, P, values, lo, hi, w, color, scale) {
  const nb = Math.round((hi - lo) / w), c = new Array(nb).fill(0);
  values.forEach(v => { const b = Math.floor((v - lo) / w); if (b >= 0 && b < nb) c[b]++; });
  c.forEach((k, b) => {
    const y = k * (scale || 1);
    tip(el('rect', { x: P.X(lo + b * w) + 1, y: P.Y(y), width: Math.max(P.X(lo + w) - P.X(lo) - 2, 1),
                     height: P.Y(0) - P.Y(y), fill: color }, svg),
        `[${fmt(lo + b * w)}, ${fmt(lo + (b + 1) * w)}): ${k}`);
  });
  return c;
}

function randn() { let u = 0; while (u === 0) u = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random()); }
function sortNum(a) { return a.slice().sort((p, q) => p - q); }
// ceil that ignores float noise such as 0.9*10 = 9.000000000000002
function ceil(v) { return Math.ceil(v - 1e-9); }
// k-th smallest (1-based); +Infinity when k > n, as split conformal prescribes.
function kth(a, k) { return k > a.length ? Infinity : sortNum(a)[k - 1]; }
function mean(a) { return a.reduce((s, v) => s + v, 0) / a.length; }
function sd(a) { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); }
// Abramowitz-Stegun 7.1.26, error < 1.5e-7
function erf(x) {
  const s = Math.sign(x); x = Math.abs(x); const t = 1 / (1 + 0.3275911 * x);
  return s * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x));
}
