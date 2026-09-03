import { Metadata } from "next";
import { OffersLandingView } from "@/components/offers/OffersLandingView";

export const metadata: Metadata = {
  title: "Offers, Deals & Voucher Discounts | Prayog India Store",
  description:
    "Shop official hardware promotional deals, institutional bundle vouchers, and discount offers on Arduino, UAV flight controllers, and sensors.",
};

export default function OffersPage() {
  return <OffersLandingView />;
}
