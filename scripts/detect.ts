/** Runs detection against the seeded data and prints the result. The CLI exists
 *  so the engine can be verified without any UI in the way. */
import { sql } from "../lib/db/client";
import { firstSiteId, runDetection } from "../lib/engine/run";
import { describeHeadline } from "../lib/engine/aggregate";

const siteId = await firstSiteId();
if (!siteId) { console.log("No site. Run: npm run db:seed"); await sql.end(); process.exit(1); }

const r = await runDetection(siteId, new Date("2027-01-01T00:00:00Z"));

if (r.isDemo) console.log("⚠  DEMO DATA — not real factory transactions (Bible §47, rule 16)\n");
console.log(describeHeadline(r.headline));
for (const s of r.headline.statements) console.log("   · " + s);
console.log(`\nrealised ${r.headline.realisedVersusIdentified.realised} of ${r.headline.realisedVersusIdentified.identified} identified\n`);

console.log(`OPPORTUNITIES (${r.opportunities.length})`);
for (const o of r.opportunities) {
  console.log(`\n  ${o.title}`);
  console.log(`    ladder      ${o.ladder}`);
  console.log(`    intervention ${o.statedIntervention}`);
  console.log(`    counterfactual ${o.counterfactual}`);
  const net = o.netImpact.value ? `${o.netImpact.value.toFixed(2)} ${o.netImpact.unit} (${o.netImpact.basis})` : `INSUFFICIENT_DATA`;
  const gross = o.recurringImpact.value ? `${o.recurringImpact.value.toFixed(2)} ${o.recurringImpact.unit}` : "INSUFFICIENT_DATA";
  console.log(`    gross       ${gross}`);
  console.log(`    net         ${net}`);
  if (o.netImpact.value === null) for (const l of o.netImpact.limitations) console.log(`      ! ${l}`);
  if (o.netExcludesUnvaluedRisk) console.log(`    ⚠ this figure excludes an unvalued risk and is therefore optimistic`);
  console.log(`    gates`);
  for (const g of o.gates) console.log(`      [${g.outcome.padEnd(13)}] ${g.gate} — ${g.detail}`);
  console.log(`    owners      finding=${o.findingOwner ?? "UNOWNED"} action=${o.actionOwner ?? "UNOWNED"} data=${o.dataOwner ?? "UNOWNED"}`);
}

console.log(`\n\nEXCLUDED FROM THE HEADLINE (${r.headline.excluded.length})`);
for (const e of r.headline.excluded) console.log(`  · ${e.title} — ${e.reason}`);

console.log(`\nEVIDENCE GAPS (${r.evidenceGaps.length})`);
for (const g of r.evidenceGaps) {
  const spend = g.observedSpend?.value ? ` · observed spend ${g.observedSpend.value.toFixed(2)} ${g.observedSpend.unit}` : "";
  console.log(`  · [${g.factoryDataRef}] ${g.missingEvidence}${spend}`);
  console.log(`      blocks: ${g.blocks}`);
}

console.log(`\nCONTRADICTIONS (${r.contradictions.length})`);
for (const c of r.contradictions) console.log(`  · ${c.leftId} vs ${c.rightId} on ${c.dimension}`);

console.log(`\nNOTES`);
for (const n of r.notes) console.log(`  · ${n}`);
await sql.end();
