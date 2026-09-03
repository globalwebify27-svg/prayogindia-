import { Metadata } from "next";
import { SupportTicketsView } from "@/components/account/SupportTicketsView";

export const metadata: Metadata = {
  title: "Support Tickets | Prayog India Store",
  description: "Technical helpdesk and hardware inquiry support tickets.",
  robots: { index: false, follow: false },
};

export default function SupportPage() {
  return <SupportTicketsView />;
}
