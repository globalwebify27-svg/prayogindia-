import { Metadata } from "next";
import { SupportTicketDetailView } from "@/components/account/SupportTicketDetailView";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Support Ticket Details | Prayog India Store",
  robots: { index: false, follow: false },
};

export default async function SupportTicketDetailPage({ params }: Props) {
  const { id } = await params;
  return <SupportTicketDetailView ticketId={id} />;
}
