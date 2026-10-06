import { Suspense } from "react";
import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | Prayog India Store",
  description:
    "Register for a customer or institution account to purchase genuine robotics components and STEM learning kits.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-20 text-center text-xs text-slate-400">
          Loading registration portal...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
