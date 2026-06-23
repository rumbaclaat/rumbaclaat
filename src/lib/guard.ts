import { prisma } from "@/lib/prisma";
import { requireStaff, type StaffSession } from "@/lib/auth";
import { resolvePermissions, can } from "@/lib/permissions";

/** requireStaff() + a permission check. Use in mutating server actions / pages. */
export async function requirePermission(key: string): Promise<StaffSession> {
  const session = await requireStaff();
  const perms = resolvePermissions(session.staff);
  if (!can(perms, key)) {
    throw new Error(`Forbidden: missing permission "${key}"`);
  }
  return session;
}

/** Append an audit-log entry. Never throws (auditing must not block the action). */
export async function logAudit(opts: {
  session?: StaffSession | null;
  action: string;
  entityType: string;
  entityId?: string;
  summary?: string;
  meta?: unknown;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        staffId: opts.session?.staff.id ?? null,
        staffEmail: opts.session?.email ?? "system",
        action: opts.action,
        entityType: opts.entityType,
        entityId: opts.entityId ?? null,
        summary: opts.summary ?? null,
        meta: (opts.meta ?? undefined) as object | undefined,
      },
    });
  } catch {
    /* swallow */
  }
}
