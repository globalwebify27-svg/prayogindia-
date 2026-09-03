import { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Shopping Cart & Checkout Basket | Prayog India Store",
  description:
    "View your selected robotics components, microcontrollers, calculate discounts, and proceed to checkout.",
};

export default function CartPage() {
  return <CartView />;
}
