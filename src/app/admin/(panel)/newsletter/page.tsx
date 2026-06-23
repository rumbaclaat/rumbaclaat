import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import NewsletterGrid, { type SubscriberRow } from "@/components/admin/newsletter/newsletter-grid";
import { bulkSubscriberStatus, deleteSubscriber } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewsletterPage() {
  const subs = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  const rows: SubscriberRow[] = subs.map((s) => ({ id: s.id, email: s.email, name: s.firstName ?? "—", status: s.status, created: s.createdAt.toISOString() }));
  return (
    <>
      <PageHeader title="Newsletter" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Newsletter" }]} subtitle={`${subs.length} subscribers`} />
      <NewsletterGrid rows={rows} bulkStatus={bulkSubscriberStatus} deleteAction={deleteSubscriber} />
    </>
  );
}
