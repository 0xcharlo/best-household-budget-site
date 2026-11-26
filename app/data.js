// DompetKeluarga — seed data for one fictional Indonesian household.
// Keluarga Santoso, Jakarta. All figures are in Indonesian rupiah (IDR) and
// describe November 2026, the month the site opens on. The household edits
// everything from the site itself; this file only seeds the first visit.

export const HOUSEHOLD = {
  name: 'Keluarga Santoso',
  members: 'Andi, Sari, Budi & Nia',
  city: 'Jakarta',
  monthLabel: 'November 2026',
  monthKey: '2026-11',
};

export const CATEGORIES = [
  { id: 'gaji', label: 'Gaji', kind: 'income', color: '#0f766e' },
  { id: 'usaha', label: 'Usaha Sampingan', kind: 'income', color: '#059669' },
  { id: 'belanja', label: 'Belanja Harian', kind: 'expense', color: '#0ea5e9' },
  { id: 'makan', label: 'Makan di Luar', kind: 'expense', color: '#f59e0b' },
  { id: 'transport', label: 'Transport', kind: 'expense', color: '#8b5cf6' },
  { id: 'listrik', label: 'Listrik & Air', kind: 'expense', color: '#eab308' },
  { id: 'pendidikan', label: 'Pendidikan', kind: 'expense', color: '#ec4899' },
  { id: 'kesehatan', label: 'Kesehatan', kind: 'expense', color: '#ef4444' },
  { id: 'hiburan', label: 'Hiburan', kind: 'expense', color: '#22c55e' },
  { id: 'lainnya', label: 'Lainnya', kind: 'expense', color: '#64748b' },
];

export const BUDGETS = [
  { category: 'belanja', limit: 3000000 },
  { category: 'makan', limit: 800000 },
  { category: 'transport', limit: 1200000 },
  { category: 'listrik', limit: 650000 },
  { category: 'pendidikan', limit: 1500000 },
  { category: 'kesehatan', limit: 500000 },
  { category: 'hiburan', limit: 600000 },
  { category: 'lainnya', limit: 400000 },
];

// [date, description, category, amount] — positive = money in, negative = money out.
export const SEED_TRANSACTIONS = [
  ['2026-11-01', 'Gaji Andi (kantor)', 'gaji', 8500000],
  ['2026-11-01', 'Belanja mingguan — Pasar Minggu', 'belanja', -620000],
  ['2026-11-02', 'Bensin motor', 'transport', -80000],
  ['2026-11-03', 'Gaji Sari (guru)', 'gaji', 5200000],
  ['2026-11-03', 'SPP sekolah Budi', 'pendidikan', -750000],
  ['2026-11-04', 'Makan malam keluarga', 'makan', -185000],
  ['2026-11-05', 'Belanja bulanan supermarket', 'belanja', -540000],
  ['2026-11-06', 'Token listrik', 'listrik', -300000],
  ['2026-11-07', 'Jualan kue Sari', 'usaha', 650000],
  ['2026-11-07', 'Ojek online', 'transport', -45000],
  ['2026-11-08', 'Belanja mingguan — Pasar Minggu', 'belanja', -480000],
  ['2026-11-09', 'Nonton bioskop berempat', 'hiburan', -150000],
  ['2026-11-10', 'BPJS Kesehatan keluarga', 'kesehatan', -300000],
  ['2026-11-11', 'Bensin motor', 'transport', -80000],
  ['2026-11-12', 'Les matematika Budi', 'pendidikan', -400000],
  ['2026-11-13', 'Makan siang di luar', 'makan', -120000],
  ['2026-11-14', 'Jualan kue Sari', 'usaha', 600000],
  ['2026-11-14', 'Air galon + gas elpiji', 'lainnya', -95000],
  ['2026-11-15', 'Belanja mingguan — Pasar Minggu', 'belanja', -510000],
  ['2026-11-16', 'Obat flu di apotek', 'kesehatan', -85000],
  ['2026-11-17', 'Parkir + tol', 'transport', -60000],
  ['2026-11-18', 'Makan malam di luar', 'makan', -210000],
  ['2026-11-19', 'Buku & alat tulis Nia', 'pendidikan', -175000],
  ['2026-11-20', 'Tagihan listrik PLN', 'listrik', -320000],
  ['2026-11-21', 'Belanja mingguan — Pasar Minggu', 'belanja', -465000],
  ['2026-11-22', 'Langganan streaming film', 'hiburan', -65000],
  ['2026-11-23', 'Bensin motor', 'transport', -80000],
  ['2026-11-24', 'Makan siang di luar', 'makan', -145000],
  ['2026-11-25', 'Internet rumah', 'lainnya', -350000],
  ['2026-11-26', 'Belanja mingguan — Pasar Minggu', 'belanja', -430000],
];

export const SEED_GOALS = [
  { id: 'g1', name: 'Dana Darurat', target: 10000000, saved: 6250000, note: 'Enam bulan pengeluaran pokok' },
  { id: 'g2', name: 'Liburan Keluarga ke Yogyakarta', target: 5000000, saved: 2100000, note: 'Berangkat libur sekolah Juni' },
  { id: 'g3', name: 'Laptop untuk Budi', target: 4500000, saved: 1800000, note: 'Untuk tugas sekolah dan belajar coding' },
  { id: 'g4', name: 'Renovasi Dapur', target: 8000000, saved: 900000, note: 'Ganti kompor dan meja dapur' },
];

export const SEED_BILLS = [
  { id: 'b1', name: 'SPP Sekolah Budi', amount: 750000, due: '2026-11-05', paid: true },
  { id: 'b2', name: 'BPJS Kesehatan', amount: 300000, due: '2026-11-10', paid: true },
  { id: 'b3', name: 'PDAM (air)', amount: 180000, due: '2026-11-15', paid: true },
  { id: 'b4', name: 'Listrik PLN', amount: 320000, due: '2026-11-20', paid: true },
  { id: 'b5', name: 'Internet rumah', amount: 350000, due: '2026-11-25', paid: true },
  { id: 'b6', name: 'Cicilan motor', amount: 1100000, due: '2026-11-28', paid: false },
  { id: 'b7', name: 'Iuran RT', amount: 50000, due: '2026-11-30', paid: false },
];

// Monthly totals before November, for the six-month report chart.
export const MONTH_HISTORY = [
  { key: '2026-06', label: 'Jun', income: 14200000, spending: 8100000 },
  { key: '2026-07', label: 'Jul', income: 14950000, spending: 8600000 },
  { key: '2026-08', label: 'Agu', income: 15400000, spending: 9200000 },
  { key: '2026-09', label: 'Sep', income: 14950000, spending: 7800000 },
  { key: '2026-10', label: 'Okt', income: 15100000, spending: 8400000 },
];

export const TIPS = [
  'Belanja harian sudah melewati anggaran Rp3.000.000 — coba belanja mingguan dengan daftar belanja agar tidak kalap.',
  'Makan di luar masih Rp140.000 di bawah anggaran. Masak di rumah tiga kali seminggu bisa menghemat sekitar Rp400.000 sebulan.',
  'Dana darurat sudah 62% dari target. Sisihkan Rp500.000 tiap gajian dan target tercapai sebelum Lebaran.',
  'Cicilan motor Rp1.100.000 jatuh tempo 28 November — siapkan dananya dari sisa saldo bulan ini.',
];
