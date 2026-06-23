import { redirect } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import { getStaffUser } from "@/lib/auth";
import AdminShell from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getStaffUser();
  if (!session) redirect("/admin/login");

  return (
    <AdminShell
      name={session.staff.name ?? session.email}
      email={session.email}
      role={session.staff.role}
    >
      {children}
    </AdminShell>
  );
}
