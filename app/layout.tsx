import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Manufacturing Operating System",
  description: "What needs your attention today",
};

/**
 * THE APP SHELL.
 *
 * Navigation is OUTCOME-FIRST: every primary item is a question the user asks,
 * never a noun the system contains (Interface Contract §6.3). Block 10 found
 * the old navigation was five-sevenths module-shaped, with the two
 * administrative tools — Import and Data health — ranking third and fourth,
 * ahead of everything used daily.
 *
 * ⚠ LABELS MOVE NOW; ROUTES MOVE IN BLOCK 14. A label pointing at an existing
 * route is a design change; renaming routes is a rebuild, and Block 13 does not
 * rebuild pages. "Stock" therefore points at /inventory today.
 */
const PRIMARY = [
  { href: "/", label: "Today", title: "What needs my attention?" },
  { href: "/inventory", label: "Stock", title: "What do I have, and what's running out?" },
  { href: "/orders", label: "Orders", title: "What's coming, and what's late?" },
  { href: "/produce", label: "Make", title: "Can I produce what I need?" },
  { href: "/opportunities", label: "Savings", title: "Where can we save?" },
];

/** Set-up and diagnostics. Used weekly at most, so never peers of the five. */
const SECONDARY = [
  { href: "/import", label: "Import" },
  { href: "/data-health", label: "Data health" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="top">
          <div className="inner">
            <strong>Manufacturing OS</strong>
            <div className="nav-primary">
              {PRIMARY.map((i) => (
                <a key={i.href} href={i.href} title={i.title}>{i.label}</a>
              ))}
            </div>
            <div className="nav-secondary">
              {SECONDARY.map((i) => (
                <a key={i.href} href={i.href}>{i.label}</a>
              ))}
            </div>
          </div>
        </nav>
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
