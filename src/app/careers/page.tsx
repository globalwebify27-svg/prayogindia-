import { Metadata } from "next";
import { CareersView } from "@/components/careers/CareersView";

export const metadata: Metadata = {
  title: "Engineering Careers & Openings | Prayog India",
  description:
    "Join the Prayog India robotics, UAV, and mechatronics hardware engineering team in Bengaluru.",
};

export default function CareersPage() {
  return <CareersView />;
}
