import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { StaffUser } from "@/generated/prisma/client";
import { DEV_OPEN_ACCESS } from "@/lib/dev-flags";

function devStaffSession(): StaffSession {
  return {
    authUserId: "dev-open-access",
    email: "admin@rumbaclaat.com",
    staff: {
      id: "dev-open-access",
      authUserId: "dev-open-access",
      email: "admin@rumbaclaat.com",
      name: "Admin (open access)",
      role: "super_admin",
      active: true,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } as StaffUser,
  };
}

export type StaffSession = {
  authUserId: string;
  email: string;
  staff: StaffUser;
};

/** Returns the active StaffUser for the current Supabase session, or null. */
export async function getStaffUser(): Promise<StaffSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const staff = await prisma.staffUser.findUnique({
      where: { authUserId: user.id },
    });
    if (staff && staff.active) {
      return { authUserId: user.id, email: user.email ?? staff.email, staff };
    }
  }

  // Build phase: allow admin access without a staff login.
  if (DEV_OPEN_ACCESS) return devStaffSession();
  return null;
}

/** Throws if the caller is not an active staff member. Use in server actions. */
export async function requireStaff(): Promise<StaffSession> {
  const session = await getStaffUser();
  if (!session) throw new Error("Unauthorized");
  return session;
}

/**
 * Returns the Customer for the current Supabase session, creating/linking the
 * record on first sign-in (enrolled at the free Bronze tier). Null if signed out.
 */
export async function getCustomer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let customer = await prisma.customer.findUnique({
    where: { authUserId: user.id },
  });

  if (!customer && user.email) {
    const existingByEmail = await prisma.customer.findUnique({
      where: { email: user.email },
    });
    if (existingByEmail) {
      customer = await prisma.customer.update({
        where: { id: existingByEmail.id },
        data: { authUserId: user.id },
      });
    } else {
      const bronze = await prisma.membershipTier.findFirst({
        where: { slug: "bronze" },
      });
      customer = await prisma.customer.create({
        data: {
          authUserId: user.id,
          email: user.email,
          membershipTierId: bronze?.id ?? null,
        },
      });
    }
  }

  if (!customer) return null;
  return { user, customer };
}
