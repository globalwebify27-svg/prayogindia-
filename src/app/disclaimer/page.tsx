import { redirect } from "next/navigation";

export default function DisclaimerPage() {
  redirect("/about#disclaimer");
}
