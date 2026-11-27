import { Suspense } from "react";
import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Account | Prayog India Store",
  description:
    "Register for a customer or institution account to purchase genuine robotics components and STEM learning kits.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-24 px-4 text-center">
          <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
            Loading registration portal...
          </p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
