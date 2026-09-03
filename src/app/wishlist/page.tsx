import { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "My Saved Wishlist | Prayog India Store",
  description:
    "View and manage your saved robotics kits, microcontrollers, drone parts, and sensors.",
};

export default function WishlistPage() {
  return <WishlistView />;
}
