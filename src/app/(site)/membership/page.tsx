import { redirect } from "next/navigation";

// The member portal lives at /account (dashboard for signed-in members).
export default function MembershipPage() {
  redirect("/account");
}
