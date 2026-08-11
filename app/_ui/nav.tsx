"use client";
/**
 * NAVIGATION — five destinations, not a menu of website links.
 *
 * Desktop: a top bar with a hairline indicator under the active destination.
 * A pill would shout; a 2px rule is unmistakable and quiet.
 *
 * Mobile: a bottom tab bar, because that is the native pattern for a small
 * number of primary destinations and it puts every one within thumb reach —
 * which matters when the user is holding a phone in a warehouse aisle.
 *
 * ⚠ This is a client component solely to read the current path for the active
 * state. It fetches nothing and holds no state of its own.
 */
import { usePathname } from "next/navigation";

/** Each label is a question the user asks, never a table the system contains. */
const PRIMARY = [
  { href: "/", label: "Today", hint: "What needs my attention?" },
  { href: "/inventory", label: "Stock", hint: "What do I have, and what's running out?" },
  { href: "/orders", label: "Orders", hint: "What's coming, and what's late?" },
  { href: "/produce", label: "Make", hint: "Can I produce what I need?" },
  { href: "/opportunities", label: "Savings", hint: "Where can we save?" },
];

/** Set-up and diagnostics. Used weekly at most, so never peers of the five. */
const SECONDARY = [
  { href: "/settings", label: "Settings" },
];

const isActive = (path: string, href: string) =>
  href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

export function TopNav() {
  const path = usePathname();
  return (
    <nav className="top">
      <div className="inner">
        <strong>Manufacturing OS</strong>
        <div className="nav-primary">
          {PRIMARY.map((i) => (
            <a key={i.href} href={i.href} title={i.hint}
               aria-current={isActive(path, i.href) ? "page" : undefined}>
              {i.label}
            </a>
          ))}
        </div>
        <div className="nav-secondary">
          {SECONDARY.map((i) => (
            <a key={i.href} href={i.href}
               aria-current={isActive(path, i.href) ? "page" : undefined}>
              {i.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="Main">
      {PRIMARY.map((i) => (
        <a key={i.href} href={i.href} aria-current={isActive(path, i.href) ? "page" : undefined}>
          <span className="tdot" aria-hidden="true" />
          {i.label}
        </a>
      ))}
    </nav>
  );
}
