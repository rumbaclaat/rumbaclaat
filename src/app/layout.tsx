import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import BrandingStyle from "@/components/branding-style";

// Order matters: Bootstrap first, then brand theme overrides it.
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/theme.css";
import "./globals.css";

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
    "Premium Caribbean rum, aged in American oak. Shop signature expressions, join RPM, and explore cocktail recipes. 18+ only.",
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
        <BrandingStyle />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Rumbaclaat",
              url: "https://rumbaclaat.com",
              description: "Premium Caribbean rum, aged in American oak.",
            }),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
