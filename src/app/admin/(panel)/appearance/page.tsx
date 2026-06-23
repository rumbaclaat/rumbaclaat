import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import ImageField from "@/components/admin/media/image-field";
import { updateBranding } from "./actions";

export const dynamic = "force-dynamic";

export default async function AppearancePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const b = (settings?.branding ?? {}) as Record<string, string>;
  const v = (k: string) => b[k] ?? "";

  return (
    <>
      <PageHeader title="Appearance & branding" subtitle="Logos, favicon and brand colours — changes apply site-wide." breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Appearance" }]} />
      {saved && <div className="admin-badge admin-badge--success mb-3" role="status">✓ Branding saved</div>}
      <form action={updateBranding} style={{ maxWidth: 860 }}>
        <FormSection title="Logos">
          <ImageField name="logo" label="Header wordmark / logo" value={v("logo")} col="col-md-4" />
          <ImageField name="heroLogo" label="Hero logo (homepage)" value={v("heroLogo")} col="col-md-4" />
          <ImageField name="footerLogo" label="Footer logo" value={v("footerLogo")} col="col-md-4" />
          <ImageField name="favicon" label="Favicon" value={v("favicon")} col="col-md-4" />
        </FormSection>
        <FormSection title="Brand colours" description="Leave blank to keep the default dark + gold theme.">
          <div className="col-md-4"><label className="form-label" htmlFor="gold">Gold</label><input id="gold" name="gold" type="color" className="form-control form-control-color" defaultValue={v("gold") || "#C6A75E"} /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="goldHi">Gold (bright)</label><input id="goldHi" name="goldHi" type="color" className="form-control form-control-color" defaultValue={v("goldHi") || "#E4C77B"} /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="bg">Background</label><input id="bg" name="bg" type="color" className="form-control form-control-color" defaultValue={v("bg") || "#0E0E0E"} /></div>
        </FormSection>
        <SaveBar submitLabel="Save branding" />
      </form>
    </>
  );
}
