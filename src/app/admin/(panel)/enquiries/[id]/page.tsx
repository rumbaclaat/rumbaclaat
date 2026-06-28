import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import StatusBadge from "@/components/admin/ui/status-badge";
import { updateEnquiryStatus, replyEnquiry, approveTradeApplication } from "../actions";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "read", "replied", "closed"];

export default async function EnquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enq = await prisma.contactEnquiry.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!enq) notFound();

  return (
    <>
      <PageHeader
        title={enq.subject || `Enquiry from ${enq.name}`}
        titleBadge={<StatusBadge status={enq.status} />}
        subtitle={`${enq.type} · ${enq.email}`}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Enquiries", href: "/admin/enquiries" }, { label: enq.name }]}
        action={
          enq.type === "trade" ? (
            <form action={approveTradeApplication}>
              <input type="hidden" name="id" value={enq.id} />
              <button className="btn btn-outline-gold btn-sm"><i className="bi bi-briefcase me-1" />Approve as trade account</button>
            </form>
          ) : undefined
        }
      />

      <div className="row g-4">
        {/* Main */}
        <div className="col-12 col-lg-8">
          <AdminCard title="Conversation">
            <div className="mb-3 pb-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}>
              <div className="d-flex justify-content-between">
                <strong>{enq.name}</strong>
                <span className="td-muted" style={{ fontSize: ".75rem" }}>{new Date(enq.createdAt).toLocaleString("en-GB")}</span>
              </div>
              <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{enq.message}</div>
            </div>
            {enq.messages.map((m) => (
              <div key={m.id} className="mb-3 pb-2" style={{ borderBottom: "1px solid var(--gold-bdr)" }}>
                <div className="d-flex justify-content-between">
                  <strong style={{ color: "var(--gold-hi)" }}>Rumbaclaat{m.emailSent ? "" : " (not emailed)"}</strong>
                  <span className="td-muted" style={{ fontSize: ".75rem" }}>{new Date(m.createdAt).toLocaleString("en-GB")}</span>
                </div>
                <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{m.body}</div>
              </div>
            ))}
          </AdminCard>
        </div>

        {/* Rail */}
        <div className="col-12 col-lg-4">
          <AdminCard title="Status">
            <div className="mb-3"><StatusBadge status={enq.status} /></div>
            <form action={updateEnquiryStatus} className="d-flex flex-column gap-2">
              <input type="hidden" name="id" value={enq.id} />
              <select name="status" defaultValue={enq.status} className="form-select form-select-sm">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="submit" className="btn btn-gold btn-sm">Update status</button>
            </form>
          </AdminCard>

          <AdminCard title="Contact" className="mt-4">
            <p className="mb-1" style={{ fontWeight: 600 }}>{enq.name}</p>
            <p className="mb-1"><span className="td-muted">Type:</span> {enq.type}</p>
            <p className="mb-1"><span className="td-muted">Email:</span> <a href={`mailto:${enq.email}`}>{enq.email}</a></p>
            {enq.phone && <p className="mb-1"><span className="td-muted">Phone:</span> {enq.phone}</p>}
            <p className="mb-0"><span className="td-muted">Received:</span> {new Date(enq.createdAt).toLocaleString("en-GB")}</p>
          </AdminCard>

          <AdminCard title="Reply" className="mt-4">
            <form action={replyEnquiry} className="d-flex flex-column gap-2">
              <input type="hidden" name="id" value={enq.id} />
              <input name="subject" className="form-control form-control-sm" placeholder="Subject" defaultValue={`Re: ${enq.subject ?? "your enquiry"}`} />
              <textarea name="body" rows={4} className="form-control" placeholder="Your reply…" required />
              <button className="btn btn-outline-gold btn-sm align-self-start"><i className="bi bi-send me-1" />Send reply</button>
            </form>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
