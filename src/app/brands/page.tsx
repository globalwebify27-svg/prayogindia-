import { Metadata } from "next";
import { BrandsView } from "@/components/brands/BrandsView";

export const metadata: Metadata = {
  title: "Official Hardware Brand Partners | Prayog India Store",
  description:
    "Explore world-class robotics, microcontroller, and autonomous drone brands with official warranty and pan-India technical support.",
  openGraph: {
    title: "Official Hardware Brand Partners | Prayog India Store",
    description:
      "Explore world-class robotics, microcontroller, and autonomous drone brands with official warranty and pan-India technical support.",
  },
};

export default function BrandsPage() {
  return <BrandsView />;
}
