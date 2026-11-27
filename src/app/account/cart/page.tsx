import { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "My Cart | Prayog India Store",
  description: "View and manage items in your shopping cart.",
  robots: { index: false, follow: false },
};

export default function AccountCartPage() {
  return <CartView embedded />;
}
