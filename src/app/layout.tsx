import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

// Order matters: Bootstrap first, then brand theme overrides it.
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/theme.css";
import "./globals.css";

import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import AgeGate from "@/components/age-gate";
import CookieBanner from "@/components/cookie-banner";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rumbaclaat — Premium Caribbean Rum",
    template: "%s — Rumbaclaat",
  },
  description:
    "Premium Caribbean rum, aged in American oak. Shop signature expressions, join the Inner Circle membership, and explore cocktail recipes. 18+ only.",
  metadataBase: new URL("https://rumbaclaat.com"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-bs-theme="dark"
      className={`${serif.variable} ${sans.variable}`}
    >
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="has-fixed-nav">
          {children}
        </main>
        <SiteFooter />
        <AgeGate />
        <CookieBanner />
      </body>
    </html>
  );
}
