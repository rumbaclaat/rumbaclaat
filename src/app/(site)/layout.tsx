import SiteHeader from "@/components/site-header";
import AnnouncementTicker from "@/components/announcement-ticker";
import SiteFooter from "@/components/site-footer";
import AgeGate from "@/components/age-gate";
import CookieBanner from "@/components/cookie-banner";
import { CartProvider } from "@/components/cart/cart-provider";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <SiteHeader />
      <AnnouncementTicker />
      <main id="main">
        {children}
      </main>
      <SiteFooter />
      <AgeGate />
      <CookieBanner />
    </CartProvider>
  );
}
