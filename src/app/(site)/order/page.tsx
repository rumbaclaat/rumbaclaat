import { redirect } from "next/navigation";

// Order details live in the member dashboard (order history).
export default function OrderRedirect() {
  redirect("/account");
}
