import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage() {
  const enquiries = await prisma.contactEnquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <div className="admin-page-head">
        <h1>Enquiries</h1>
      </div>

      <div className="admin-card p-0" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--text-dim)" }}>No enquiries yet.</td></tr>
              )}
              {enquiries.map((e) => (
                <tr key={e.id}>
                  <td><span className="badge-brand" style={{ textTransform: "capitalize" }}>{e.type}</span></td>
                  <td>{e.name}</td>
                  <td style={{ color: "var(--text-muted)" }}><a href={`mailto:${e.email}`}>{e.email}</a></td>
                  <td style={{ color: "var(--text-muted)" }}>{e.subject ?? "—"}</td>
                  <td style={{ color: "var(--text-muted)", maxWidth: 320, whiteSpace: "pre-wrap", fontSize: ".8125rem" }}>{e.message.slice(0, 200)}</td>
                  <td style={{ color: "var(--text-dim)", whiteSpace: "nowrap" }}>{new Date(e.createdAt).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
