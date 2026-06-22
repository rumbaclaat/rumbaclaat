import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import AgeGate from "@/components/age-gate";
import CookieBanner from "@/components/cookie-banner";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
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
    </>
  );
}
