import { Metadata } from "next";
import { OffersLandingView } from "@/components/offers/OffersLandingView";

export const metadata: Metadata = {
  title: "Top Deals & Lightning Hardware Discounts | Prayog India Store",
  description:
    "Explore top deals, lightning discounts, combo bundle savings, and coupon codes on genuine Arduino boards, drone flight controllers, robotics kits, and sensors.",
};

export default function OffersPage() {
  return <OffersLandingView />;
}
