import { Metadata } from "next";
import { OrdersList } from "@/components/account/OrdersList";

export const metadata: Metadata = {
  title: "My Orders & Invoices | Prayog India Store",
  description: "Track orders, shipment status, and download tax invoices.",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersList />;
}
