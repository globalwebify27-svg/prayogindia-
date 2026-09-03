import { Metadata } from "next";
import { AddressesView } from "@/components/account/AddressesView";

export const metadata: Metadata = {
  title: "Saved Addresses | Prayog India Store",
  description: "Manage shipping and lab delivery locations.",
  robots: { index: false, follow: false },
};

export default function AddressesPage() {
  return <AddressesView />;
}
