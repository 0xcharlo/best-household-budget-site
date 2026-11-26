# best-household-budget-site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/0xcharlo/best-household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/0xcharlo/best-household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

DompetKeluarga — a household budget site for an Indonesian family: a monthly dashboard with income vs spending and a category donut, transactions you can add, search, filter and delete, budgets with progress bars and over-budget warnings, savings goals you can top up, bills with due dates you can mark paid, and a six-month report with charts and plain-language insights. All figures are real and computed from the transactions; everything is stored in the browser (localStorage) and the site makes no network requests. The site is static files that run offline in a desktop or phone browser.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080.

## Layout

- `app/` — the site itself: `index.html`, `style.css`, `main.js` (hash router and controls), `views.js` (one function per page), `charts.js` (dependency-free SVG charts), `store.js` (localStorage state and every figure the pages show), `data.js` (the seed household: figures, budgets, goals, bills)
- `screenshots/` — four renders of the site in Chromium (dashboard, transactions, reports, phone dashboard)
- `main.ts` — the entrypoint: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged
- `shots.json` — which views the screenshots were taken of

## Check it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=7n8phv37&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
