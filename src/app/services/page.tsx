import { Metadata } from "next";
import { ServicesLandingView } from "@/components/services/ServicesLandingView";

export const metadata: Metadata = {
  title: "Turnkey STEM, Robotics & Drone Lab Setup Services | Prayog India",
  description:
    "Explore turnkey STEM lab setups, robotics mechatronics labs, drone flight centers, industrial hardware engineering projects, and consultancy.",
};

export default function ServicesPage() {
  return <ServicesLandingView />;
}
