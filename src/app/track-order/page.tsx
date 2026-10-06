import { Metadata } from "next";
import { TrackOrderView } from "@/components/TrackOrderView";

export const metadata: Metadata = {
  title: "Track Order & Live Shipment Logistics | Prayog India",
  description: "Track Prayog hardware shipments, Delhivery / Shiprocket courier AWB tracking and live delivery status.",
};

export default function TrackOrderPage() {
  return <TrackOrderView />;
}
