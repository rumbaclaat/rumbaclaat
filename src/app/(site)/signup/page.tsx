import { redirect } from "next/navigation";

// Sign-up is handled on the account page (Create account tab).
export default function SignupRedirect() {
  redirect("/account?register=1");
}
