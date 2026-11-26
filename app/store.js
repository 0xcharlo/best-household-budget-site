// DompetKeluarga — state: loads the seed data on first visit, keeps every change
// in localStorage, and answers every question the pages ask (totals, per-category
// spending, upcoming bills). Nothing here talks to a network.
import {
  BUDGETS,
  CATEGORIES,
  HOUSEHOLD,
  MONTH_HISTORY,
  SEED_BILLS,
  SEED_GOALS,
  SEED_TRANSACTIONS,
} from './data.js';

const KEY = 'dompetkeluarga-v1';

export const rupiah = (n) =>
  'Rp' + new Intl.NumberFormat('id-ID').format(Math.round(n));

export const rupiahShort = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return 'Rp' + (n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  if (abs >= 1_000) return 'Rp' + Math.round(n / 1_000) + ' rb';
  return rupiah(n);
};

export const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

export const fmtDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d} ${months[m - 1]} ${y}`;
};

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) ?? { id, label: id, kind: 'expense', color: '#64748b' };

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function seedState() {
  return {
    transactions: SEED_TRANSACTIONS.map(([date, desc, category, amount], i) => ({
      id: 't' + (i + 1),
      date,
      desc,
      category,
      amount,
    })),
    goals: SEED_GOALS.map((g) => ({ ...g })),
    bills: SEED_BILLS.map((b) => ({ ...b })),
    budgets: BUDGETS.map((b) => ({ ...b })),
    nextTx: SEED_TRANSACTIONS.length + 1,
    nextGoal: SEED_GOALS.length + 1,
    nextBill: SEED_BILLS.length + 1,
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.transactions)) return parsed;
    }
  } catch {
    // Corrupt storage: fall through to a fresh seed.
  }
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the page still works for this visit.
  }
}

export function resetState() {
  localStorage.removeItem(KEY);
  return loadState();
}

// ---- Selectors: every figure on the site comes from these ----

export const monthOf = (iso) => iso.slice(0, 7);

export function monthTransactions(state, monthKey = HOUSEHOLD.monthKey) {
  return state.transactions.filter((t) => monthOf(t.date) === monthKey);
}

export function monthTotals(state, monthKey = HOUSEHOLD.monthKey) {
  const txs = monthTransactions(state, monthKey);
  let income = 0;
  let spending = 0;
  for (const t of txs) {
    if (t.amount >= 0) income += t.amount;
    else spending += -t.amount;
  }
  return { income, spending, balance: income - spending, count: txs.length };
}

export function spendingByCategory(state, monthKey = HOUSEHOLD.monthKey) {
  const out = {};
  for (const t of monthTransactions(state, monthKey)) {
    if (t.amount < 0) out[t.category] = (out[t.category] ?? 0) + -t.amount;
  }
  return out;
}

export function incomeByCategory(state, monthKey = HOUSEHOLD.monthKey) {
  const out = {};
  for (const t of monthTransactions(state, monthKey)) {
    if (t.amount >= 0) out[t.category] = (out[t.category] ?? 0) + t.amount;
  }
  return out;
}

export function budgetRows(state) {
  const spent = spendingByCategory(state);
  return state.budgets.map((b) => {
    const used = spent[b.category] ?? 0;
    return {
      ...b,
      category: categoryById(b.category),
      used,
      left: b.limit - used,
      percent: pct(used, b.limit),
      over: used > b.limit,
    };
  });
}

export function upcomingBills(state) {
  return state.bills
    .filter((b) => !b.paid)
    .sort((a, b) => (a.due < b.due ? -1 : 1));
}

export function billsDueTotal(state) {
  return upcomingBills(state).reduce((s, b) => s + b.amount, 0);
}

export function goalsSummary(state) {
  const saved = state.goals.reduce((s, g) => s + g.saved, 0);
  const target = state.goals.reduce((s, g) => s + g.target, 0);
  return { saved, target, percent: pct(saved, target) };
}

export function sixMonthSeries(state) {
  const now = monthTotals(state);
  return [...MONTH_HISTORY, { key: HOUSEHOLD.monthKey, label: 'Nov', income: now.income, spending: now.spending }];
}

// ---- Mutations: every button and form on the site calls one of these ----

export function addTransaction(state, { date, desc, category, kind, amount }) {
  const signed = kind === 'expense' ? -Math.abs(amount) : Math.abs(amount);
  state.transactions.push({ id: 't' + state.nextTx++, date, desc, category, amount: signed });
  state.transactions.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  saveState(state);
}

export function deleteTransaction(state, id) {
  state.transactions = state.transactions.filter((t) => t.id !== id);
  saveState(state);
}

export function addToGoal(state, id, amount) {
  const goal = state.goals.find((g) => g.id === id);
  if (!goal || amount <= 0) return;
  goal.saved = Math.min(goal.target, goal.saved + amount);
  saveState(state);
}

export function addGoal(state, { name, target, saved }) {
  state.goals.push({ id: 'g' + state.nextGoal++, name, target, saved: saved || 0, note: '' });
  saveState(state);
}

export function toggleBillPaid(state, id) {
  const bill = state.bills.find((b) => b.id === id);
  if (bill) {
    bill.paid = !bill.paid;
    saveState(state);
  }
}

export function addBill(state, { name, amount, due }) {
  state.bills.push({ id: 'b' + state.nextBill++, name, amount, due, paid: false });
  saveState(state);
}

export function setBudgetLimit(state, category, limit) {
  const row = state.budgets.find((b) => b.category === category);
  if (row && limit > 0) {
    row.limit = limit;
    saveState(state);
  }
}
