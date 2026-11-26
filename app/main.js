// DompetKeluarga — hash router and controls. Every link, button and form on the
// site is wired here; every change goes through store.js and re-renders the page.
import {
  addBill,
  addGoal,
  addToGoal,
  addTransaction,
  deleteTransaction,
  loadState,
  resetState,
  setBudgetLimit,
  toggleBillPaid,
} from './store.js';
import {
  renderBills,
  renderBudgets,
  renderDashboard,
  renderGoals,
  renderReports,
  renderTransactions,
} from './views.js';

const state = loadState();
const app = document.getElementById('app');
const navLinks = [...document.querySelectorAll('.nav-link')];

const ROUTES = {
  '/': renderDashboard,
  '/transaksi': renderTransactions,
  '/anggaran': renderBudgets,
  '/tabungan': renderGoals,
  '/tagihan': renderBills,
  '/laporan': renderReports,
};

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, query] = raw.split('?');
  const params = new URLSearchParams(query ?? '');
  return { path, filter: { category: params.get('category') ?? '', q: params.get('q') ?? '' } };
}

function render() {
  const { path, filter } = parseHash();
  const view = ROUTES[path] ?? renderDashboard;
  app.innerHTML = view(state, filter);
  navLinks.forEach((a) => {
    const href = a.getAttribute('href') ?? '';
    a.classList.toggle('active', href === '#' + path);
    if (href === '#' + path) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}

function rerender(announce) {
  render();
  if (announce) {
    const note = document.getElementById('notice');
    if (note) {
      note.textContent = announce;
      note.hidden = false;
      setTimeout(() => { note.hidden = true; }, 3500);
    }
  }
}

// ---- Forms and buttons (event delegation on the whole page) ----

document.addEventListener('submit', (event) => {
  const form = event.target;
  event.preventDefault();
  const data = new FormData(form);

  if (form.id === 'tx-form') {
    addTransaction(state, {
      date: String(data.get('date')),
      desc: String(data.get('desc')).trim(),
      category: String(data.get('category')),
      kind: String(data.get('kind')),
      amount: Number(data.get('amount')),
    });
    rerender('Transaksi tersimpan.');
  } else if (form.id === 'tx-filter') {
    const category = String(data.get('category') ?? '');
    const q = String(data.get('q') ?? '').trim();
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (q) query.set('q', q);
    location.hash = '#/transaksi' + (query.toString() ? '?' + query.toString() : '');
  } else if (form.id === 'goal-form') {
    addGoal(state, {
      name: String(data.get('name')).trim(),
      target: Number(data.get('target')),
      saved: Number(data.get('saved') || 0),
    });
    rerender('Target baru dibuat.');
  } else if (form.id === 'bill-form') {
    addBill(state, {
      name: String(data.get('name')).trim(),
      amount: Number(data.get('amount')),
      due: String(data.get('due')),
    });
    rerender('Tagihan ditambahkan.');
  } else if (form.classList.contains('goal-add')) {
    addToGoal(state, form.dataset.goal, Number(data.get('amount')));
    rerender('Tabungan ditambahkan.');
  } else if (form.classList.contains('budget-edit')) {
    setBudgetLimit(state, form.dataset.budget, Number(data.get('limit')));
    rerender('Batas anggaran disimpan.');
  }
});

document.addEventListener('click', (event) => {
  const del = event.target.closest('[data-delete-tx]');
  if (del) {
    if (window.confirm('Hapus transaksi ini?')) {
      deleteTransaction(state, del.dataset.deleteTx);
      rerender('Transaksi dihapus.');
    }
    return;
  }
  const bill = event.target.closest('[data-bill]');
  if (bill) {
    toggleBillPaid(state, bill.dataset.bill);
    rerender('Status tagihan diubah.');
    return;
  }
  const reset = event.target.closest('[data-reset]');
  if (reset) {
    if (window.confirm('Kembalikan semua data ke contoh awal? Perubahanmu akan hilang.')) {
      const fresh = resetState();
      state.transactions = fresh.transactions;
      state.goals = fresh.goals;
      state.bills = fresh.bills;
      state.budgets = fresh.budgets;
      rerender('Data dikembalikan ke contoh awal.');
    }
  }
});

window.addEventListener('hashchange', render);
render();
