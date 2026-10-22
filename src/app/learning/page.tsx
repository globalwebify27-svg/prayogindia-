import { Metadata } from "next";
import { LearningHubSection } from "@/components/AdditionalSections";

export const metadata: Metadata = {
  title: "Learning Hub & STEM Workshops | Prayog India Store",
  description:
    "Explore robotics learning programs, drone workshops, IoT tutorials, student resources, and certifications.",
};

export default function LearningPage() {
  return (
    <div className="py-10 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <LearningHubSection />
    </div>
  );
}
