import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import SectionLabel from "@/components/admin/ui/section-label";
import StatusBadge from "@/components/admin/ui/status-badge";
import ImageField from "@/components/admin/media/image-field";
import { TextField, SelectField, CheckField } from "@/components/admin/ui/field";
import { PERMISSION_GROUPS, resolvePermissions } from "@/lib/permissions";
import { updateStaff } from "../actions";

export const dynamic = "force-dynamic";

const ROLES = ["super_admin", "content_editor", "catalogue_manager", "order_manager", "membership_manager", "trade_manager", "marketing_manager"];

export default async function EditStaff({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const u = await prisma.staffUser.findUnique({ where: { id } });
  if (!u) notFound();
  const effective = resolvePermissions(u);
  const hasCustom = Array.isArray(u.permissions) && (u.permissions as string[]).length > 0;

  return (
    <>
      <PageHeader
        title={u.name ?? u.email}
        subtitle={u.email}
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Staff", href: "/admin/staff" }, { label: u.name ?? u.email }]}
        action={<StatusBadge status={u.active ? "active" : "inactive"} />}
      />

      <form action={updateStaff}>
        <input type="hidden" name="id" value={u.id} />
        <div className="row g-4">
          {/* Main — primary content: the permissions matrix */}
          <div className="col-12 col-lg-8">
            <AdminCard title="Permissions">
              <p className="admin-form-section-desc">
                By default a role grants a preset. Tick “custom” to fine-tune exactly what this person can do.
              </p>
              <CheckField name="useCustomPerms" label="Use custom permissions (override the role preset)" defaultChecked={hasCustom} />
              <div className="row g-3 mt-1">
                {PERMISSION_GROUPS.map((g) => (
                  <div className="col-md-6" key={g.group}>
                    <SectionLabel>{g.group}</SectionLabel>
                    {g.keys.map(([key, label]) => (
                      <div className="form-check" key={key}>
                        <input className="form-check-input" type="checkbox" name="permissions" value={key} id={`p-${key}`} defaultChecked={effective.includes(key) || effective.includes("*")} />
                        <label className="form-check-label" htmlFor={`p-${key}`} style={{ fontSize: ".85rem" }}>{label}</label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>

          {/* Rail — Status/action card first, then identity (Profile) */}
          <div className="col-12 col-lg-4">
            <AdminCard title="Status">
              <div className="mb-3"><StatusBadge status={u.active ? "active" : "inactive"} /></div>
              <div className="d-flex flex-column gap-3">
                <SelectField name="role" label="Role" options={ROLES.map((r) => ({ value: r, label: r.replace(/_/g, " ") }))} defaultValue={u.role} col="col-12" />
                <CheckField name="active" label="Active" defaultChecked={u.active} col="col-12" />
                <button type="submit" className="btn btn-gold btn-sm align-self-start"><i className="bi bi-check2 me-1" aria-hidden="true" />Save changes</button>
              </div>
            </AdminCard>

            <AdminCard title="Profile" className="mt-4">
              <div className="row g-3">
                <TextField name="name" label="Name" defaultValue={u.name ?? ""} col="col-12" />
                <TextField name="title" label="Job title" defaultValue={u.title ?? ""} col="col-12" />
                <ImageField name="photo" label="Photo" value={u.photo ?? ""} col="col-12" />
              </div>
            </AdminCard>
          </div>
        </div>
      </form>
    </>
  );
}
