import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminTabs from "@/components/admin/ui/tabs";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import SectionLabel from "@/components/admin/ui/section-label";
import { TextField, TextareaField, SelectField, CheckField } from "@/components/admin/ui/field";
import { updateSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const settings = (await prisma.settings.findUnique({ where: { id: "default" } })) ?? (await prisma.settings.create({ data: { id: "default" } }));
  const pay = (settings.paymentConfig ?? {}) as Record<string, unknown>;
  const em = (settings.emailConfig ?? {}) as Record<string, unknown>;
  const ghl = (settings.ghlConfig ?? {}) as Record<string, unknown>;
  const s = (v: unknown) => (v == null ? "" : String(v));

  // The champagne "Settings" archetype (design-system §6): a section sub-nav
  // (AdminTabs, only the active section visible) drives a tabbed MAIN column of
  // sectioned form cards (FormSection, serif titles, shared SectionLabel above),
  // beside a persistent RAIL that stays put on every tab — a Publish-state card
  // (store status summary) and a danger-zone card (maintenance / age gate). One
  // sticky gold Save (SaveBar) is the page's single primary action. Presentation
  // only; every field name, the form action, and the config blobs are preserved.
  return (
    <>
      <PageHeader title="Store settings" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Settings" }]} />
      {saved && <div className="admin-badge admin-badge--success mb-3" role="status">✓ Settings saved</div>}

      <form action={updateSettings}>
        <div className="admin-product-grid">
          {/* Tabbed main column — section sub-nav drives the active card group */}
          <div className="admin-product-main">
            <AdminTabs
              tabs={[
                {
                  id: "store", label: "Store",
                  content: (
                    <div>
                      <SectionLabel>Storefront</SectionLabel>
                      <FormSection title="Shipping, tax & loyalty">
                        <TextField name="shippingStandardCost" label="Standard shipping (£)" type="number" step="0.01" defaultValue={Number(settings.shippingStandardCost)} col="col-md-4" />
                        <TextField name="shippingExpressCost" label="Express shipping (£)" type="number" step="0.01" defaultValue={Number(settings.shippingExpressCost)} col="col-md-4" />
                        <TextField name="freeShippingThreshold" label="Free shipping over (£)" type="number" step="0.01" defaultValue={Number(settings.freeShippingThreshold)} col="col-md-4" />
                        <TextField name="vatRatePct" label="VAT rate (%)" type="number" defaultValue={settings.vatRatePct} col="col-md-3" />
                        <TextField name="pointsPerPound" label="Points per £1 (redeem)" type="number" defaultValue={settings.pointsPerPound} col="col-md-3" />
                        <TextField name="loyaltyEarnRate" label="Points earned per £" type="number" defaultValue={settings.loyaltyEarnRate} col="col-md-3" />
                        <TextField name="currency" label="Display currency" defaultValue={settings.currency} col="col-md-3" />
                        <TextField name="baseCurrency" label="Base currency" defaultValue={settings.baseCurrency} col="col-md-3" />
                      </FormSection>
                    </div>
                  ),
                },
                {
                  id: "business", label: "Business",
                  content: (
                    <div>
                      <SectionLabel>Company</SectionLabel>
                      <FormSection title="Business details (used on invoices)">
                        <TextField name="businessName" label="Business name" defaultValue={settings.businessName ?? ""} col="col-md-6" />
                        <TextField name="businessVat" label="VAT number" defaultValue={settings.businessVat ?? ""} col="col-md-3" />
                        <TextField name="supportEmail" label="Support email" defaultValue={settings.supportEmail ?? ""} col="col-md-3" />
                        <TextareaField name="businessAddress" label="Registered address" defaultValue={settings.businessAddress ?? ""} rows={2} />
                      </FormSection>
                    </div>
                  ),
                },
                {
                  id: "compliance", label: "Compliance",
                  content: (
                    <div>
                      <SectionLabel>Compliance</SectionLabel>
                      <FormSection title="Age gate" description="Storefront-wide maintenance and the age gate toggle live in the danger zone on the right.">
                        <TextField name="ageThreshold" label="Minimum age" type="number" defaultValue={settings.ageThreshold} col="col-md-4" />
                      </FormSection>
                    </div>
                  ),
                },
                {
                  id: "seo", label: "SEO",
                  content: (
                    <div>
                      <SectionLabel>Discovery</SectionLabel>
                      <FormSection title="Default SEO">
                        <TextField name="seoDefaultTitle" label="Default page title" defaultValue={settings.seoDefaultTitle ?? ""} col="col-12" />
                        <TextareaField name="seoDefaultDescription" label="Default meta description" defaultValue={settings.seoDefaultDescription ?? ""} rows={2} />
                      </FormSection>
                    </div>
                  ),
                },
                {
                  id: "payments", label: "Payments",
                  content: (
                    <div>
                      <SectionLabel>Checkout</SectionLabel>
                      <FormSection title="Payment gateways" description="Publishable keys + toggles. Secret keys live in environment variables (STRIPE_SECRET_KEY, PAYPAL_SECRET).">
                        <SelectField name="paymentMode" label="Mode" options={["sandbox", "live"]} defaultValue={s(pay.mode) || "sandbox"} col="col-md-4" />
                        <CheckField name="stripeEnabled" label="Stripe (cards)" defaultChecked={Boolean(pay.stripeEnabled)} col="col-md-3" />
                        <CheckField name="paypalEnabled" label="PayPal" defaultChecked={Boolean(pay.paypalEnabled)} col="col-md-2" />
                        <CheckField name="googlePayEnabled" label="Google Pay" defaultChecked={Boolean(pay.googlePayEnabled)} col="col-md-3" />
                        <TextField name="stripePublishableKey" label="Stripe publishable key" defaultValue={s(pay.stripePublishableKey)} col="col-md-6" />
                        <TextField name="paypalClientId" label="PayPal client id" defaultValue={s(pay.paypalClientId)} col="col-md-6" />
                      </FormSection>
                    </div>
                  ),
                },
                {
                  id: "email", label: "Email",
                  content: (
                    <div>
                      <SectionLabel>Notifications</SectionLabel>
                      <FormSection title="Transactional email" description="Sender details. The API key lives in the RESEND_API_KEY environment variable.">
                        <SelectField name="emailProvider" label="Provider" options={["resend", "postmark"]} defaultValue={s(em.provider) || "resend"} col="col-md-4" />
                        <TextField name="emailFromName" label="From name" defaultValue={s(em.fromName)} col="col-md-4" />
                        <TextField name="emailFromEmail" label="From email" defaultValue={s(em.fromEmail)} col="col-md-4" />
                      </FormSection>
                    </div>
                  ),
                },
                {
                  id: "ghl", label: "GoHighLevel",
                  content: (
                    <div>
                      <SectionLabel>Integrations</SectionLabel>
                      <FormSection title="CRM sync" description="Pipeline + location ids. The API token lives in the GHL_TOKEN environment variable.">
                        <CheckField name="ghlSyncEnabled" label="Enable two-way sync" defaultChecked={Boolean(ghl.syncEnabled)} col="col-12" />
                        <TextField name="ghlLocationId" label="Location id" defaultValue={s(ghl.locationId)} col="col-md-4" />
                        <TextField name="ghlCustomerPipeline" label="Customer pipeline id" defaultValue={s(ghl.customerPipelineId)} col="col-md-4" />
                        <TextField name="ghlTradePipeline" label="Trade pipeline id" defaultValue={s(ghl.tradePipelineId)} col="col-md-4" />
                      </FormSection>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Persistent rail — visible across every tab */}
          <div className="admin-product-rail">
            <FormSection title="Publish" description="Save commits every section. Maintenance and the age gate go live immediately.">
              <div className="col-12">
                <div className="d-flex align-items-center justify-content-between" style={{ gap: 12 }}>
                  <span className="form-label mb-0">Storefront</span>
                  {settings.maintenanceMode
                    ? <span className="admin-badge admin-badge--danger">Closed</span>
                    : <span className="admin-badge admin-badge--success">Live</span>}
                </div>
              </div>
              <div className="col-12">
                <div className="d-flex align-items-center justify-content-between" style={{ gap: 12 }}>
                  <span className="form-label mb-0">Age gate</span>
                  {settings.ageGateEnabled
                    ? <span className="admin-badge admin-badge--info">On</span>
                    : <span className="admin-badge admin-badge--muted">Off</span>}
                </div>
              </div>
            </FormSection>

            <FormSection title="Danger zone" description="These switches affect every visitor the moment you save.">
              <CheckField name="maintenanceMode" label="Maintenance mode (storefront closed)" defaultChecked={settings.maintenanceMode} col="col-12" />
              <CheckField name="ageGateEnabled" label="Show age gate on the storefront" defaultChecked={settings.ageGateEnabled} col="col-12" />
            </FormSection>
          </div>
        </div>

        <SaveBar submitLabel="Save settings" />
      </form>
    </>
  );
}
