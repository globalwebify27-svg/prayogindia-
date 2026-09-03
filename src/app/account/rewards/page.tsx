import { Metadata } from "next";
import { RewardsView } from "@/components/account/RewardsView";

export const metadata: Metadata = {
  title: "My Reward Points | Prayog India Store",
  description: "View STEM reward points and cash discount value.",
  robots: { index: false, follow: false },
};

export default function RewardsPage() {
  return <RewardsView />;
}
