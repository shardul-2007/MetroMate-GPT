import type { Metadata } from "next";
import "./globals.css";
import { AppHeader, AppNav } from "@/components/app-nav";

export const metadata: Metadata = {
  title: "MetroMate — Public Transit & Indoor Metro Navigation",
  description: "Official-style indoor station navigation, platform wayfinding, and journey planner for Pune Metro.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <AppHeader />
          <div className="shell">
            <AppNav />
            <main className="main">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
