import { Metadata } from "next";
import { PaymentMethodsView } from "@/components/account/PaymentMethodsView";

export const metadata: Metadata = {
  title: "Payment Methods | Prayog India",
  description: "Manage saved cards, UPI VPAs, and institutional Net-30 credit terms.",
  robots: { index: false, follow: false },
};

export default function PaymentMethodsPage() {
  return <PaymentMethodsView />;
}
