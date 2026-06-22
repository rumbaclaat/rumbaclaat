import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { StaffUser } from "@/generated/prisma/client";

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
  if (!user) return null;

  const staff = await prisma.staffUser.findUnique({
    where: { authUserId: user.id },
  });
  if (!staff || !staff.active) return null;

  return { authUserId: user.id, email: user.email ?? staff.email, staff };
}

/** Throws if the caller is not an active staff member. Use in server actions. */
export async function requireStaff(): Promise<StaffSession> {
  const session = await getStaffUser();
  if (!session) throw new Error("Unauthorized");
  return session;
}
