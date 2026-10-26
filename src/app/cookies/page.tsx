import { redirect } from "next/navigation";

export default function CookiesPage() {
  redirect("/about#cookies");
}
