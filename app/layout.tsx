import "./globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "Manufacturing Operating System", description: "Potential Annual Saving" };

/** Navigation follows the core journey, not a module list. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="top">
          <div className="inner">
            <strong>Manufacturing OS</strong>
            <a href="/">Today</a>
            <a href="/produce">Can I produce it?</a>
            <a href="/import">Import</a>
            <a href="/data-health">Data health</a>
            <a href="/inventory">Inventory</a>
            <a href="/opportunities">Opportunities</a>
            <a href="/orders">Orders &amp; supply</a>
          </div>
        </nav>
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
