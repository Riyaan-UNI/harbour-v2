/**
 * Summarise `outputs/responsive-audit/report.json` into a readable digest and
 * cross-viewport text-transition anomalies.
 */
import fs from 'node:fs';

const OUT = 'outputs/responsive-audit';
const report = JSON.parse(fs.readFileSync(`${OUT}/report.json`, 'utf8'));
const metrics = JSON.parse(fs.readFileSync(`${OUT}/metrics.json`, 'utf8'));

const VPS = ['p320', 'p390', 'p768', 'p1024'];

console.log('='.repeat(78));
console.log('HORIZONTAL OVERFLOW (body scrollWidth - innerWidth)');
console.log('='.repeat(78));
for (const r of report.routes) {
  const row = VPS.map((v) => {
    const vp = r.viewports[v];
    if (!vp || vp.failed) return '!';
    return vp.bodyOverflow > 1 ? `+${vp.bodyOverflow}` : '0';
  });
  const flag = row.some((c) => c !== '0' && c !== '!') ? '  <-- OVERFLOW' : '';
  console.log(`${r.path.padEnd(24)} ${row.map((c) => c.padStart(7)).join('')}${flag}`);
}

console.log('\n' + '='.repeat(78));
console.log('ELEMENTS ESCAPING THE VIEWPORT');
console.log('='.repeat(78));
for (const r of report.routes) {
  for (const v of VPS) {
    const vp = r.viewports[v];
    if (!vp || vp.failed || !vp.overflow?.length) continue;
    // De-dup by selector
    const set = new Map();
    for (const o of vp.overflow) {
      const k = o.el;
      if (!set.has(k) || set.get(k).overflowPx < o.overflowPx) set.set(k, o);
    }
    console.log(`\n${r.path} @ ${v}  (${r.label})`);
    for (const o of [...set.values()].sort((a, b) => b.overflowPx - a.overflowPx).slice(0, 10)) {
      console.log(`   ${o.side.padEnd(5)} ${String(o.overflowPx).padStart(4)}px  x=${String(o.x).padStart(5)} w=${String(o.w).padStart(4)}  ${o.el}`);
    }
  }
}

console.log('\n' + '='.repeat(78));
console.log('TEXT CLIPPED BY HEIGHT');
console.log('='.repeat(78));
let anyClip = false;
for (const r of report.routes) {
  for (const v of VPS) {
    const vp = r.viewports[v];
    if (!vp || vp.failed || !vp.clippedText?.length) continue;
    anyClip = true;
    console.log(`\n${r.path} @ ${v}`);
    for (const c of vp.clippedText.slice(0, 8)) {
      console.log(`   ${c.el}  h=${c.clientH}->${c.scrollH}  "${c.text}"`);
    }
  }
}
if (!anyClip) console.log('(none)');

console.log('\n' + '='.repeat(78));
console.log('NOWRAP TEXT WIDER THAN ITS BOX');
console.log('='.repeat(78));
let anyNow = false;
for (const r of report.routes) {
  for (const v of VPS) {
    const vp = r.viewports[v];
    if (!vp || vp.failed || !vp.nowrapSqueeze?.length) continue;
    anyNow = true;
    console.log(`\n${r.path} @ ${v}`);
    for (const c of vp.nowrapSqueeze.slice(0, 8)) {
      console.log(`   ${c.el}  w=${c.clientW}->${c.scrollW}  "${c.text}"`);
    }
  }
}
if (!anyNow) console.log('(none)');

console.log('\n' + '='.repeat(78));
console.log('SUB-44px TARGETS (height<44 or width<20)');
console.log('='.repeat(78));
for (const r of report.routes) {
  const agg = new Map();
  for (const v of VPS) {
    const vp = r.viewports[v];
    if (!vp || vp.failed || !vp.smallTargets) continue;
    for (const t of vp.smallTargets) {
      const k = `${t.el}|${t.label}`;
      if (!agg.has(k)) agg.set(k, { ...t, vps: [] });
      agg.get(k).vps.push(`${v}:${t.w}x${t.h}`);
    }
  }
  if (!agg.size) continue;
  console.log(`\n${r.path}  (${r.label})`);
  for (const t of [...agg.values()].slice(0, 10)) {
    console.log(`   ${t.el}  "${t.label}"  [${t.vps.join(' ')}]`);
  }
}

console.log('\n' + '='.repeat(78));
console.log('PAGE ERRORS / CONSOLE ERRORS');
console.log('='.repeat(78));
let anyErr = false;
for (const r of report.routes) {
  for (const v of VPS) {
    const vp = r.viewports[v];
    if (!vp || !vp.errors?.length) continue;
    anyErr = true;
    console.log(`${r.path} @ ${v}: ${vp.errors.join(' | ')}`);
  }
}
if (!anyErr) console.log('(none)');

console.log('\n' + '='.repeat(78));
console.log('TEXT-TRANSITION ANOMALIES (font-size / box width across the ladder)');
console.log('='.repeat(78));
/** Build key → {vp: metric} */
const byKey = new Map();
for (const [routeVp, list] of Object.entries(metrics)) {
  const [route, vp] = routeVp.split('::');
  for (const m of list) {
    const k = `${route}|${m.key}`;
    if (!byKey.has(k)) byKey.set(k, { route, el: m.el, text: m.text, vps: {} });
    byKey.get(k).vps[vp] = m;
  }
}
const anomalies = [];
for (const [, rec] of byKey) {
  const order = VPS.map((v) => rec.vps[v]).filter(Boolean);
  if (order.length < 4) continue;
  const sizes = order.map((o) => o.fontSize);
  // Monotonic non-decreasing is the expectation as the viewport grows.
  let breaks = 0;
  for (let i = 1; i < sizes.length; i++) {
    if (sizes[i] < sizes[i - 1] - 0.01) breaks++;
  }
  if (breaks > 0) {
    anomalies.push({
      ...rec,
      kind: 'font-size not monotonic',
      seq: sizes.map((s, i) => `${VPS[i]}=${s}`).join(' -> '),
    });
  }
  // Line-height sanity: lineHeight < fontSize * 1.0 is a squash.
  for (const o of order) {
    if (o.lineHeight != null && o.lineHeight < o.fontSize * 0.99 && o.w > 40) {
      anomalies.push({
        ...rec,
        kind: `tight line-height @ ${o.el}`,
        seq: `fs=${o.fontSize} lh=${o.lineHeight} "${o.text}"`,
      });
      break;
    }
  }
}
console.log(`Total anomalies: ${anomalies.length}`);
for (const a of anomalies.slice(0, 45)) {
  console.log(`\n  ${a.route}  ${a.el}`);
  console.log(`     "${a.text}"`);
  console.log(`     ${a.kind}: ${a.seq}`);
}

console.log('\n' + '='.repeat(78));
console.log('100vh USAGE SEEN IN THE LIVE OM');
console.log('='.repeat(78));
const vhSeen = new Set();
for (const r of report.routes) {
  for (const v of VPS) {
    const vp = r.viewports[v];
    if (!vp?.vhUsage) continue;
    for (const u of vp.vhUsage) vhSeen.add(`${u.selector} { ${u.prop}: ${u.val} }`);
  }
}
[...vhSeen].forEach((s) => console.log('  ' + s));
