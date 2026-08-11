/**
 * THE PRODUCT-WIDE VOCABULARY AND FORMATTING GUARD.
 * Interface Contract Laws 2 and 9.
 *
 * Block 9 built a vocabulary guard and applied it to one page. Block 10
 * measured the cost of that: `/produce` scored zero and the other six pages
 * scored 29 between them, including decision-register IDs on the home screen.
 *
 * ⚠ WHERE THE ROUTE SCAN LIVES, AND WHY IT IS NOT HERE
 *
 *   A first attempt scanned page SOURCE with a regex for "user-facing strings".
 *   It produced false positives — it flagged `VERDICT_MARK`, a code identifier
 *   inside JSX, as though a user could read it. A guard that cries wolf gets
 *   switched off, so it was removed rather than tuned around.
 *
 *   The correct instrument scans RENDERED OUTPUT, because that is what the user
 *   actually sees. It needs a live server and a database, so it is a script —
 *   `scripts/vocab-scan.ts` — rather than a unit test. Block 14 runs it per page
 *   and drives each route to zero.
 *
 *   What remains here is everything provable without a server: the formatting
 *   boundary, and that the guard catches what it claims to.
 */
import { describe, expect, it } from "vitest";
import { scan, visibleText } from "../lib/ui/vocabulary";
import * as fmt from "../lib/ui/format";

/* -------------------------------------------------------------------------- */
/* The formatting boundary                                                    */
/* -------------------------------------------------------------------------- */

describe("formatting boundary", () => {
  it("never renders machine precision to a user", () => {
    // The exact figure that reached a factory manager before Block 13.
    expect(fmt.money("1383868.667808219178082191781", "EGP")).toBe("1.38M EGP");
    expect(fmt.moneyExact("1383868.667808219178082191781", "EGP")).toBe("1,383,868.67 EGP");
    expect(fmt.moneyExact("21311.33219178082191780821919", "EGP")).toBe("21,311.33 EGP");
  });

  it("groups thousands and drops meaningless decimals", () => {
    expect(fmt.money("21311.33", "EGP")).toBe("21,311 EGP");
    expect(fmt.money("450.5", "EGP")).toBe("450.50 EGP");
    expect(fmt.qty("197.000", "EA")).toBe("197 EA");
    expect(fmt.qty("305.100", "kg")).toBe("305.1 kg");
    expect(fmt.qty("13905.100", "kg")).toBe("13,905.1 kg");
    expect(fmt.qty("4500.3", "EA", { whole: true })).toBe("4,500 EA");
  });

  it("strips false precision from a figure the copy already hedges", () => {
    // The exact defect: "Used about 323.166 kg a month" — a sentence that
    // hedges and then contradicts the hedge to three decimal places.
    expect(fmt.approx("323.16599999", "kg")).toBe("323 kg");
    expect(fmt.approx("12.51", "kg")).toBe("13 kg");
    expect(fmt.approx("9694.98", "kg")).toBe("9,690 kg");
    expect(fmt.approx("4.27", "kg")).toBe("4.3 kg");
    expect(fmt.approx("0.4213", "kg")).toBe("0.4 kg");
    expect(fmt.approx("0", "kg")).toBe("0 kg");
    expect(fmt.approx(null, "kg")).toBe("—");
  });

  it("distinguishes absent from zero", () => {
    expect(fmt.money(null)).toBe("—");
    expect(fmt.qty(undefined, "kg")).toBe("—");
    expect(fmt.qty("0", "kg")).toBe("0 kg");   // genuinely zero, and says so
    expect(fmt.money("0", "EGP")).toBe("0 EGP"); // zero needs no cents
    expect(fmt.isAbsent(null)).toBe(true);
    expect(fmt.isAbsent("0")).toBe(false);
  });

  it("states lateness in words, never as a negative number", () => {
    expect(fmt.days(12)).toBe("12 days late");
    expect(fmt.days(-3)).toBe("3 days early");
    expect(fmt.days(1)).toBe("1 day late");
    expect(fmt.days(null)).toBe("—");
  });

  it("expresses cover coarsely, because the observation is not precise", () => {
    expect(fmt.cover(3)).toBe("about 3 days");
    expect(fmt.cover(43)).toBe("about 6 weeks");
    expect(fmt.cover(180)).toBe("about 6 months");
    expect(fmt.cover(null)).toBe("—");
  });

  it("includes the weekday, so a user can see a date the calendar can't yet check", () => {
    // F-50 is unanswered, so the system cannot skip weekends — but it can show
    // the user which day it landed on.
    expect(fmt.date(new Date("2027-02-20T00:00:00Z"))).toBe("Sat 20 Feb 2027");
  });
});

/* -------------------------------------------------------------------------- */
/* The guard itself must be able to fail                                      */
/* -------------------------------------------------------------------------- */

describe("the guard catches what it claims to", () => {
  it("catches jargon, enums, IDs and machine precision", () => {
    expect(scan("Run the MRP").map((v) => v.term)).toContain("MRP");
    expect(scan("basis USER_DEFINED").map((v) => v.term)).toContain("USER_DEFINED");
    expect(scan("see D-044 for the rule").some((v) => v.term.includes("decision ID"))).toBe(true);
    expect(scan("gap F-09 blocks this").some((v) => v.term.includes("factory question"))).toBe(true);
    expect(scan("M01_EXPEDITE_PREMIUM_LEADTIME").some((v) => v.term.includes("mechanism enum"))).toBe(true);
    expect(scan("1383868.667808219178").some((v) => v.term.includes("over-precise"))).toBe(true);
  });

  it("does not fire on ordinary English", () => {
    expect(scan("You need 4,500 kg more of polymer resin.")).toEqual([]);
    expect(scan("Order 305.1 kg by Tue 18 Aug.")).toEqual([]);
    expect(scan("The bombs are actually fine")).toEqual([]);
    expect(scan("We don't have the recipe for this product yet.")).toEqual([]);
  });

  it("strips markup and script before scanning rendered output", () => {
    const html = '<div class="wrap"><script>var USER_DEFINED=1</script><p>You need 40 kg more today</p></div>';
    expect(visibleText(html)).toBe("You need 40 kg more today");
    expect(scan(visibleText(html))).toEqual([]);
  });
});
