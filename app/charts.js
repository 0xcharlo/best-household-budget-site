// DompetKeluarga — charts drawn as plain inline SVG, no library and no network.
// donutChart: spending share per category. barChart: income vs spending per month.
import { rupiahShort } from './store.js';

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const [sx, sy] = polar(cx, cy, r, startAngle);
  const [ex, ey] = polar(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${sx.toFixed(1)} ${sy.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(1)} ${ey.toFixed(1)} Z`;
}

export function donutChart(slices, size = 220) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  if (total <= 0) {
    return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Belum ada pengeluaran"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#e5e7eb"/></svg>`;
  }
  let angle = 0;
  const paths = slices
    .map((s) => {
      const sweep = (s.value / total) * 360;
      const d = arcPath(cx, cy, r, angle, angle + sweep - 0.6);
      angle += sweep;
      return `<path d="${d}" fill="${s.color}"><title>${s.label}: ${rupiahShort(s.value)}</title></path>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Pengeluaran per kategori">
    ${paths}
    <circle cx="${cx}" cy="${cy}" r="${(r * 0.62).toFixed(1)}" fill="#ffffff"/>
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-total">${rupiahShort(total)}</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-label">total belanja</text>
  </svg>`;
}

export function barChart(months, width = 640, height = 260) {
  const padL = 52;
  const padB = 26;
  const padT = 14;
  const plotW = width - padL - 8;
  const plotH = height - padT - padB;
  const max = Math.max(...months.flatMap((m) => [m.income, m.spending]), 1);
  const groupW = plotW / months.length;
  const barW = Math.min(26, groupW / 3);
  const y = (v) => padT + plotH - (v / max) * plotH;

  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const gy = padT + plotH - f * plotH;
    return `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${width - 8}" y2="${gy.toFixed(1)}" class="grid-line"/>
      <text x="${padL - 6}" y="${(gy + 4).toFixed(1)}" text-anchor="end" class="axis-label">${rupiahShort(max * f)}</text>`;
  }).join('');

  const bars = months
    .map((m, i) => {
      const gx = padL + i * groupW + groupW / 2;
      const ih = plotH - (y(m.income) - padT);
      const sh = plotH - (y(m.spending) - padT);
      return `<rect x="${(gx - barW - 3).toFixed(1)}" y="${y(m.income).toFixed(1)}" width="${barW}" height="${Math.max(ih, 0).toFixed(1)}" rx="3" fill="#0f766e"><title>${m.label}: pemasukan ${rupiahShort(m.income)}</title></rect>
      <rect x="${(gx + 3).toFixed(1)}" y="${y(m.spending).toFixed(1)}" width="${barW}" height="${Math.max(sh, 0).toFixed(1)}" rx="3" fill="#f59e0b"><title>${m.label}: pengeluaran ${rupiahShort(m.spending)}</title></rect>
      <text x="${gx.toFixed(1)}" y="${height - 8}" text-anchor="middle" class="axis-label">${m.label}</text>`;
    })
    .join('');

  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Pemasukan dan pengeluaran enam bulan terakhir">
    ${grid}${bars}
    <line x1="${padL}" y1="${padT + plotH}" x2="${width - 8}" y2="${padT + plotH}" class="axis-line"/>
  </svg>`;
}
