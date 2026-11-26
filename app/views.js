// DompetKeluarga — one render function per page. Every figure comes from store.js,
// so the numbers on every page always agree with each other.
import { HOUSEHOLD, CATEGORIES, TIPS } from './data.js';
import {
  billsDueTotal,
  budgetRows,
  categoryById,
  escapeHtml,
  fmtDate,
  goalsSummary,
  monthTotals,
  monthTransactions,
  pct,
  rupiah,
  rupiahShort,
  sixMonthSeries,
  spendingByCategory,
  upcomingBills,
} from './store.js';
import { barChart, donutChart } from './charts.js';

function progressBar(percent, tone = '') {
  const p = Math.min(percent, 100);
  return `<div class="bar" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
    <div class="bar-fill ${tone}" style="width:${p}%"></div>
  </div>`;
}

function tipCard() {
  const tip = TIPS[new Date().getDate() % TIPS.length];
  return `<section class="card tip">
    <h2>Tips hemat hari ini</h2>
    <p>${escapeHtml(tip)}</p>
  </section>`;
}

// ---- Dashboard: #/ ----
export function renderDashboard(state) {
  const totals = monthTotals(state);
  const rows = budgetRows(state);
  const over = rows.filter((r) => r.over);
  const goals = goalsSummary(state);
  const due = upcomingBills(state);
  const spent = spendingByCategory(state);
  const slices = CATEGORIES.filter((c) => c.kind === 'expense' && (spent[c.id] ?? 0) > 0)
    .map((c) => ({ label: c.label, value: spent[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);
  const topCats = slices.slice(0, 3);
  const recent = [...monthTransactions(state)].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);

  return `
  <section class="hero">
    <div>
      <p class="eyebrow">${escapeHtml(HOUSEHOLD.city)} · ${escapeHtml(HOUSEHOLD.monthLabel)}</p>
      <h1>Selamat datang, ${escapeHtml(HOUSEHOLD.name)}</h1>
      <p class="lede">Sisa uang bulan ini <strong>${rupiah(totals.balance)}</strong> dari pemasukan ${rupiah(totals.income)}. ${over.length ? `Ada ${over.length} kategori yang sudah melewati anggaran — lihat di bawah.` : 'Semua kategori masih dalam anggaran. Bagus!'}</p>
    </div>
    <a class="btn primary" href="#/transaksi">+ Catat transaksi</a>
  </section>

  <section class="stat-grid" aria-label="Ringkasan bulan ini">
    <div class="card stat"><span class="stat-label">Pemasukan</span><strong class="stat-value income">${rupiah(totals.income)}</strong><span class="stat-note">${monthTransactions(state).filter((t) => t.amount > 0).length} kali masuk</span></div>
    <div class="card stat"><span class="stat-label">Pengeluaran</span><strong class="stat-value expense">${rupiah(totals.spending)}</strong><span class="stat-note">${totals.count} transaksi bulan ini</span></div>
    <div class="card stat"><span class="stat-label">Sisa saldo</span><strong class="stat-value">${rupiah(totals.balance)}</strong><span class="stat-note">${pct(totals.balance, totals.income)}% dari pemasukan tersisa</span></div>
    <div class="card stat"><span class="stat-label">Tagihan belum dibayar</span><strong class="stat-value">${rupiah(billsDueTotal(state))}</strong><span class="stat-note">${due.length} tagihan menunggu</span></div>
  </section>

  <div class="two-col">
    <section class="card">
      <div class="card-head"><h2>Ke mana uang pergi</h2><a class="link" href="#/anggaran">Lihat anggaran →</a></div>
      <div class="donut-wrap">${donutChart(slices)}
        <ul class="legend">${topCats.map((s) => `<li><span class="dot" style="background:${s.color}"></span>${escapeHtml(s.label)} <strong>${rupiah(s.value)}</strong></li>`).join('')}</ul>
      </div>
    </section>
    <section class="card">
      <div class="card-head"><h2>Anggaran bulan ini</h2><a class="link" href="#/anggaran">Atur anggaran →</a></div>
      <ul class="budget-mini">${rows.slice(0, 5).map((r) => `
        <li>
          <div class="row-line"><span>${escapeHtml(r.category.label)}</span><span><strong>${rupiah(r.used)}</strong> / ${rupiah(r.limit)}</span></div>
          ${progressBar(r.percent, r.over ? 'over' : '')}
          ${r.over ? `<span class="warn">Lewat ${rupiah(r.used - r.limit)}</span>` : ''}
        </li>`).join('')}
      </ul>
    </section>
  </div>

  <div class="two-col">
    <section class="card">
      <div class="card-head"><h2>Transaksi terakhir</h2><a class="link" href="#/transaksi">Semua transaksi →</a></div>
      <ul class="tx-list">${recent.map((t) => `
        <li><span class="tx-dot" style="background:${categoryById(t.category).color}"></span>
          <span class="tx-main"><strong>${escapeHtml(t.desc)}</strong><span class="muted">${fmtDate(t.date)} · ${escapeHtml(categoryById(t.category).label)}</span></span>
          <strong class="${t.amount >= 0 ? 'income' : 'expense'}">${t.amount >= 0 ? '+' : '−'}${rupiah(Math.abs(t.amount))}</strong>
        </li>`).join('')}
      </ul>
    </section>
    <div class="stack">
      <section class="card">
        <div class="card-head"><h2>Tabungan</h2><a class="link" href="#/tabungan">Semua target →</a></div>
        <p class="big-number">${rupiah(goals.saved)} <span class="muted">dari ${rupiah(goals.target)} (${goals.percent}%)</span></p>
        ${progressBar(goals.percent)}
      </section>
      <section class="card">
        <div class="card-head"><h2>Tagihan mendesak</h2><a class="link" href="#/tagihan">Semua tagihan →</a></div>
        ${due.length ? `<ul class="bill-mini">${due.map((b) => `<li><span><strong>${escapeHtml(b.name)}</strong><span class="muted">jatuh tempo ${fmtDate(b.due)}</span></span><strong>${rupiah(b.amount)}</strong></li>`).join('')}</ul>` : '<p>Semua tagihan sudah lunas. 🎉</p>'}
      </section>
      ${tipCard()}
    </div>
  </div>`;
}

// ---- Transactions: #/transaksi ----
export function renderTransactions(state, filter = {}) {
  const cats = CATEGORIES;
  let txs = [...monthTransactions(state)].sort((a, b) => (a.date < b.date ? 1 : -1));
  if (filter.category) txs = txs.filter((t) => t.category === filter.category);
  if (filter.q) {
    const q = filter.q.toLowerCase();
    txs = txs.filter((t) => t.desc.toLowerCase().includes(q));
  }
  const totals = monthTotals(state);
  const catOptions = cats.map((c) => `<option value="${c.id}" ${filter.category === c.id ? 'selected' : ''}>${escapeHtml(c.label)}</option>`).join('');

  return `
  <section class="page-head">
    <div><p class="eyebrow">${escapeHtml(HOUSEHOLD.monthLabel)}</p><h1>Transaksi</h1>
    <p class="lede">Semua uang masuk dan keluar bulan ini. Tambah, cari, atau saring — dan hapus yang salah catat.</p></div>
  </section>

  <section class="card form-card">
    <h2>Catat transaksi baru</h2>
    <form id="tx-form" class="form-grid">
      <label>Tanggal<input type="date" name="date" value="2026-11-26" required></label>
      <label>Keterangan<input type="text" name="desc" placeholder="cth. Belanja mingguan" maxlength="80" required></label>
      <label>Kategori<select name="category">${catOptions}</select></label>
      <label>Jenis<select name="kind"><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></label>
      <label>Jumlah (Rp)<input type="number" name="amount" min="1000" step="500" placeholder="50000" required></label>
      <button class="btn primary" type="submit">Simpan transaksi</button>
    </form>
    <p class="form-note">Tersimpan di peramban ini saja (localStorage) — tidak dikirim ke mana pun.</p>
  </section>

  <section class="card">
    <div class="card-head"><h2>Daftar transaksi <span class="muted">(${txs.length})</span></h2>
      <form id="tx-filter" class="filter-row">
        <select name="category" aria-label="Saring kategori"><option value="">Semua kategori</option>${catOptions}</select>
        <input type="search" name="q" placeholder="Cari keterangan…" value="${escapeHtml(filter.q ?? '')}" aria-label="Cari transaksi">
        <button class="btn" type="submit">Saring</button>
        ${filter.category || filter.q ? '<a class="btn ghost" href="#/transaksi">Reset</a>' : ''}
      </form>
    </div>
    ${txs.length ? `
    <div class="table-wrap"><table class="tx-table">
      <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th><th></th></tr></thead>
      <tbody>${txs.map((t) => `<tr>
        <td>${fmtDate(t.date)}</td><td>${escapeHtml(t.desc)}</td>
        <td><span class="chip" style="--chip:${categoryById(t.category).color}">${escapeHtml(categoryById(t.category).label)}</span></td>
        <td class="num ${t.amount >= 0 ? 'income' : 'expense'}">${t.amount >= 0 ? '+' : '−'}${rupiah(Math.abs(t.amount))}</td>
        <td><button class="btn danger small" data-delete-tx="${t.id}">Hapus</button></td>
      </tr>`).join('')}</tbody>
    </table></div>` : '<p class="empty">Tidak ada transaksi yang cocok dengan saringan ini.</p>'}
    <p class="totals-line">Pemasukan <strong class="income">${rupiah(totals.income)}</strong> · Pengeluaran <strong class="expense">${rupiah(totals.spending)}</strong> · Sisa <strong>${rupiah(totals.balance)}</strong></p>
  </section>`;
}

// ---- Budgets: #/anggaran ----
export function renderBudgets(state) {
  const rows = budgetRows(state);
  const totals = monthTotals(state);
  const totalLimit = rows.reduce((s, r) => s + r.limit, 0);
  const totalUsed = rows.reduce((s, r) => s + r.used, 0);

  return `
  <section class="page-head">
    <div><p class="eyebrow">${escapeHtml(HOUSEHOLD.monthLabel)}</p><h1>Anggaran</h1>
    <p class="lede">Batas belanja tiap kategori. Ubah batasnya kapan saja — angkanya langsung mengikuti transaksi yang sudah dicatat.</p></div>
  </section>

  <section class="stat-grid three">
    <div class="card stat"><span class="stat-label">Total anggaran</span><strong class="stat-value">${rupiah(totalLimit)}</strong></div>
    <div class="card stat"><span class="stat-label">Sudah dipakai</span><strong class="stat-value expense">${rupiah(totalUsed)}</strong><span class="stat-note">${pct(totalUsed, totalLimit)}% dari anggaran</span></div>
    <div class="card stat"><span class="stat-label">Masih tersedia</span><strong class="stat-value">${rupiah(totalLimit - totalUsed)}</strong><span class="stat-note">untuk sisa bulan ini</span></div>
  </section>

  <section class="card">
    <h2>Anggaran vs realisasi</h2>
    <ul class="budget-list">${rows.map((r) => `
      <li class="budget-row ${r.over ? 'is-over' : ''}">
        <div class="budget-info">
          <span class="tx-dot" style="background:${r.category.color}"></span>
          <div><strong>${escapeHtml(r.category.label)}</strong><span class="muted">${r.percent}% dipakai · sisa ${rupiah(Math.max(r.left, 0))}</span></div>
        </div>
        <div class="budget-numbers"><strong>${rupiah(r.used)}</strong><span class="muted">dari ${rupiah(r.limit)}</span></div>
        ${progressBar(r.percent, r.over ? 'over' : '')}
        ${r.over ? `<span class="warn">Melewati anggaran ${rupiah(r.used - r.limit)} — kurangi belanja kategori ini minggu depan.</span>` : ''}
        <form class="budget-edit" data-budget="${r.category.id}">
          <label>Ubah batas <input type="number" name="limit" min="50000" step="50000" value="${r.limit}" aria-label="Batas ${escapeHtml(r.category.label)}"></label>
          <button class="btn small" type="submit">Simpan batas</button>
        </form>
      </li>`).join('')}
    </ul>
  </section>
  ${tipCard()}`;
}

// ---- Savings goals: #/tabungan ----
export function renderGoals(state) {
  const summary = goalsSummary(state);
  return `
  <section class="page-head">
    <div><p class="eyebrow">Menabung sedikit demi sedikit</p><h1>Tabungan &amp; Target</h1>
    <p class="lede">Setiap target punya tujuan dan tanggalnya sendiri. Tambah uang kapan saja — progresnya langsung naik.</p></div>
  </section>

  <section class="stat-grid three">
    <div class="card stat"><span class="stat-label">Total terkumpul</span><strong class="stat-value">${rupiah(summary.saved)}</strong></div>
    <div class="card stat"><span class="stat-label">Total target</span><strong class="stat-value">${rupiah(summary.target)}</strong></div>
    <div class="card stat"><span class="stat-label">Progres keseluruhan</span><strong class="stat-value">${summary.percent}%</strong></div>
  </section>

  <section class="goal-grid">${state.goals.map((g) => {
    const p = pct(g.saved, g.target);
    return `<article class="card goal-card">
      <h2>${escapeHtml(g.name)}</h2>
      <p class="muted">${escapeHtml(g.note)}</p>
      <p class="big-number">${rupiah(g.saved)} <span class="muted">dari ${rupiah(g.target)}</span></p>
      ${progressBar(p)}
      <p class="goal-meta">${p}% tercapai · kurang ${rupiah(g.target - g.saved)}</p>
      <form class="goal-add" data-goal="${g.id}">
        <label>Tambah tabungan (Rp)<input type="number" name="amount" min="10000" step="10000" placeholder="100000" required></label>
        <button class="btn primary small" type="submit">+ Tambah</button>
      </form>
    </article>`;
  }).join('')}</section>

  <section class="card form-card">
    <h2>Buat target baru</h2>
    <form id="goal-form" class="form-grid">
      <label>Nama target<input type="text" name="name" placeholder="cth. Umroh keluarga" maxlength="60" required></label>
      <label>Target (Rp)<input type="number" name="target" min="100000" step="50000" placeholder="5000000" required></label>
      <label>Sudah terkumpul (Rp)<input type="number" name="saved" min="0" step="50000" value="0"></label>
      <button class="btn primary" type="submit">Buat target</button>
    </form>
  </section>`;
}

// ---- Bills: #/tagihan ----
export function renderBills(state) {
  const unpaid = upcomingBills(state);
  const paid = state.bills.filter((b) => b.paid).sort((a, b) => (a.due < b.due ? -1 : 1));
  return `
  <section class="page-head">
    <div><p class="eyebrow">${escapeHtml(HOUSEHOLD.monthLabel)}</p><h1>Tagihan &amp; Pengingat</h1>
    <p class="lede">Tagihan rutin keluarga: mana yang sudah lunas, mana yang menunggu, dan berapa yang harus disiapkan.</p></div>
  </section>

  <section class="stat-grid three">
    <div class="card stat"><span class="stat-label">Belum dibayar</span><strong class="stat-value expense">${rupiah(billsDueTotal(state))}</strong><span class="stat-note">${unpaid.length} tagihan</span></div>
    <div class="card stat"><span class="stat-label">Sudah dibayar</span><strong class="stat-value income">${rupiah(paid.reduce((s, b) => s + b.amount, 0))}</strong><span class="stat-note">${paid.length} tagihan lunas</span></div>
    <div class="card stat"><span class="stat-label">Tagihan terdekat</span><strong class="stat-value">${unpaid.length ? escapeHtml(unpaid[0].name) : '—'}</strong><span class="stat-note">${unpaid.length ? 'jatuh tempo ' + fmtDate(unpaid[0].due) : 'Semua lunas'}</span></div>
  </section>

  <section class="card">
    <h2>Menunggu dibayar</h2>
    ${unpaid.length ? `<ul class="bill-list">${unpaid.map((b) => `
      <li><span class="tx-dot warn-dot"></span>
        <span class="tx-main"><strong>${escapeHtml(b.name)}</strong><span class="muted">Jatuh tempo ${fmtDate(b.due)}</span></span>
        <strong>${rupiah(b.amount)}</strong>
        <button class="btn small" data-bill="${b.id}">Tandai lunas</button>
      </li>`).join('')}</ul>` : '<p class="empty">Semua tagihan bulan ini sudah lunas. 🎉</p>'}
  </section>

  <section class="card">
    <h2>Sudah dibayar</h2>
    <ul class="bill-list">${paid.map((b) => `
      <li class="is-paid"><span class="tx-dot ok-dot"></span>
        <span class="tx-main"><strong>${escapeHtml(b.name)}</strong><span class="muted">Dibayar · jatuh tempo ${fmtDate(b.due)}</span></span>
        <strong>${rupiah(b.amount)}</strong>
        <button class="btn ghost small" data-bill="${b.id}">Batalkan lunas</button>
      </li>`).join('')}</ul>
  </section>

  <section class="card form-card">
    <h2>Tambah tagihan</h2>
    <form id="bill-form" class="form-grid">
      <label>Nama tagihan<input type="text" name="name" placeholder="cth. Langganan air galon" maxlength="60" required></label>
      <label>Jumlah (Rp)<input type="number" name="amount" min="1000" step="1000" placeholder="100000" required></label>
      <label>Jatuh tempo<input type="date" name="due" value="2026-11-30" required></label>
      <button class="btn primary" type="submit">Tambah tagihan</button>
    </form>
  </section>`;
}

// ---- Reports: #/laporan ----
export function renderReports(state) {
  const totals = monthTotals(state);
  const series = sixMonthSeries(state);
  const spent = spendingByCategory(state);
  const incomeCats = CATEGORIES.filter((c) => c.kind === 'income');
  const spentSlices = CATEGORIES.filter((c) => c.kind === 'expense' && (spent[c.id] ?? 0) > 0)
    .map((c) => ({ label: c.label, value: spent[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);
  const top = spentSlices[0];
  const avgSpending = Math.round(series.reduce((s, m) => s + m.spending, 0) / series.length);
  const savingsRate = pct(totals.balance, totals.income);

  return `
  <section class="page-head">
    <div><p class="eyebrow">Enam bulan terakhir · Juni – November 2026</p><h1>Laporan Bulanan</h1>
    <p class="lede">Apakah keluarga ini hidup di bawah penghasilannya? Grafik dan rinciannya menjawab dalam sekali lihat.</p></div>
  </section>

  <section class="stat-grid">
    <div class="card stat"><span class="stat-label">Pemasukan November</span><strong class="stat-value income">${rupiah(totals.income)}</strong></div>
    <div class="card stat"><span class="stat-label">Pengeluaran November</span><strong class="stat-value expense">${rupiah(totals.spending)}</strong></div>
    <div class="card stat"><span class="stat-label">Tingkat menabung</span><strong class="stat-value">${savingsRate}%</strong><span class="stat-note">dari pemasukan disisihkan</span></div>
    <div class="card stat"><span class="stat-label">Rata-rata belanja / bulan</span><strong class="stat-value">${rupiah(avgSpending)}</strong><span class="stat-note">6 bulan terakhir</span></div>
  </section>

  <section class="card">
    <div class="card-head"><h2>Pemasukan vs pengeluaran</h2><span class="legend-inline"><span class="dot" style="background:#0f766e"></span>Pemasukan <span class="dot" style="background:#f59e0b"></span>Pengeluaran</span></div>
    ${barChart(series)}
    <p class="chart-note">November memakai angka yang dihitung langsung dari transaksi bulan ini; bulan sebelumnya memakai catatan keluarga.</p>
  </section>

  <div class="two-col">
    <section class="card">
      <div class="card-head"><h2>Rincian pengeluaran November</h2></div>
      <div class="donut-wrap">${donutChart(spentSlices)}
        <ul class="legend">${spentSlices.map((s) => `<li><span class="dot" style="background:${s.color}"></span>${escapeHtml(s.label)} <strong>${rupiah(s.value)}</strong> <span class="muted">(${pct(s.value, totals.spending)}%)</span></li>`).join('')}</ul>
      </div>
    </section>
    <section class="card">
      <h2>Apa artinya?</h2>
      <ul class="insight-list">
        <li><strong>Kategori terbesar: ${escapeHtml(top.label)} (${rupiah(top.value)}).</strong> ${top.id === 'belanja' ? 'Wajar untuk keluarga empat orang, tapi sudah melewati anggaran — daftar belanja mingguan bisa menahan godaan.' : 'Periksa apakah ada yang bisa dinegosiasikan atau dijadwal ulang.'}</li>
        <li><strong>Tingkat menabung ${savingsRate}%.</strong> ${savingsRate >= 20 ? 'Di atas patokan 20% — keluarga ini menabung dengan sehat.' : 'Di bawah patokan 20%. Menahan satu kategori saja, misalnya makan di luar, sudah mengangkat angka ini.'}</li>
        <li><strong>Pengeluaran November ${totals.spending > avgSpending ? 'di atas' : 'di bawah'} rata-rata enam bulan (${rupiah(avgSpending)}).</strong> ${totals.spending > avgSpending ? 'Ada pos yang membengkak — cek halaman Anggaran.' : 'Bulan ini lebih hemat dari biasanya. Pertahankan.'}</li>
        <li><strong>Pemasukan dari usaha sampingan:</strong> jualan kue Sari menambah ${rupiah(1250000)} bulan ini — hampir menutup seluruh belanja hiburan dan kesehatan.</li>
      </ul>
      <h2>Sumber pemasukan</h2>
      <ul class="legend">${incomeCats.map((c) => {
        const v = monthTransactions(state).filter((t) => t.category === c.id && t.amount > 0).reduce((s, t) => s + t.amount, 0);
        return `<li><span class="dot" style="background:${c.color}"></span>${escapeHtml(c.label)} <strong>${rupiah(v)}</strong></li>`;
      }).join('')}</ul>
    </section>
  </div>`;
}
