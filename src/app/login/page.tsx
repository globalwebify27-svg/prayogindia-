import { Suspense } from "react";
import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer Sign In | Prayog India Store",
  description:
    "Sign in to your Prayog account to track orders, save institutional delivery addresses, and redeem STEM reward points.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-24 px-4 text-center">
          <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
            Loading sign in portal...
          </p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
