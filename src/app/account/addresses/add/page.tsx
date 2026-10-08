import { Metadata } from "next";
import { AddressesView } from "@/components/account/AddressesView";

export const metadata: Metadata = {
  title: "Add a New Address | Prayog India Store",
  description: "Add a new shipping and lab delivery location.",
  robots: { index: false, follow: false },
};

export default function AddAddressPage() {
  return <AddressesView initialShowForm={true} />;
}
