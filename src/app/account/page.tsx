import { Metadata } from "next";
import { AccountDashboardView } from "@/components/account/AccountDashboardView";

export const metadata: Metadata = {
  title: "My Account Dashboard | Prayog India Store",
  description: "View customer profile, orders, addresses, and reward points.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountDashboardView />;
}
