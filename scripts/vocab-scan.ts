/**
 * THE RENDERED VOCABULARY SCAN.
 * Interface Contract Law 2 · run against a live server.
 *
 *   npm run scan:vocab            # against http://localhost:3100
 *   BASE=http://host:port npm run scan:vocab
 *
 * This scans what the USER SEES, not what the source contains — a distinction
 * that matters, because a source scan flags code identifiers inside JSX and a
 * rendered scan cannot.
 *
 * Every number it prints is a defect. Block 14 drives each route to zero as it
 * rebuilds that page. The script exits non-zero when any route leaks, so it can
 * become a release gate the moment the last page is rebuilt.
 */
import { scan, visibleText } from "../lib/ui/vocabulary";

const BASE = process.env.BASE ?? "http://localhost:3100";

const ROUTES = [
  { path: "/", name: "Today" },
  { path: "/inventory", name: "Stock" },
  { path: "/orders", name: "Orders" },
  { path: "/produce", name: "Make" },
  { path: "/opportunities", name: "Savings" },
  { path: "/data-health", name: "Data health" },
  { path: "/import", name: "Import" },
];

async function main() {
  let total = 0;
  const rows: { route: string; count: number; terms: string[] }[] = [];

  for (const r of ROUTES) {
    let html: string;
    try {
      const res = await fetch(`${BASE}${r.path}`);
      if (!res.ok) { console.error(`  ${r.path} → HTTP ${res.status}, skipped`); continue; }
      html = await res.text();
    } catch {
      console.error(`\nCannot reach ${BASE}. Start the app first:  npx next start -p 3100\n`);
      process.exit(2);
    }

    const violations = scan(visibleText(html));
    const terms = [...new Set(violations.map((v) => v.term))];
    rows.push({ route: `${r.path} (${r.name})`, count: terms.length, terms });
    total += terms.length;
  }

  console.log("\nVOCABULARY SCAN — what a factory manager can actually read\n");
  for (const row of rows) {
    const mark = row.count === 0 ? "PASS" : "LEAK";
    console.log(`  ${mark}  ${row.route.padEnd(28)} ${row.count}`);
    for (const t of row.terms) console.log(`          · ${t}`);
  }
  console.log(`\n  TOTAL: ${total} across ${rows.length} routes`);
  console.log(`  Target: 0. Every term above is internal architecture a user should never see.\n`);

  process.exit(total === 0 ? 0 : 1);
}

main();
