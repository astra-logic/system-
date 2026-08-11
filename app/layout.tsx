import "./globals.css";
import type { ReactNode } from "react";
import { TabBar, TopNav } from "./_ui/nav";

export const metadata = {
  title: "Manufacturing OS",
  description: "What needs your attention today",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

/**
 * THE APP SHELL.
 *
 * Navigation is outcome-first: every primary destination is a question the user
 * asks, never a noun the system contains. Import and Data health live inside
 * Settings — they are set-up tasks, and before Block 14 they ranked third and
 * fourth, ahead of everything used daily.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        <div className="wrap">{children}</div>
        <TabBar />
      </body>
    </html>
  );
}
