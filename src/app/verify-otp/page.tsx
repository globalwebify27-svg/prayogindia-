import { Suspense } from "react";
import { Metadata } from "next";
import { OtpVerificationForm } from "@/components/auth/OtpVerificationForm";

export const metadata: Metadata = {
  title: "Verify Mobile OTP | Prayog India Store",
  description: "Authenticate your phone number with a 6-digit OTP passcode.",
};

export default function VerifyOtpPage() {
  return (
    <div className="py-8">
      <Suspense
        fallback={
          <div className="max-w-md mx-auto py-20 text-center text-xs text-slate-400">
            Loading verification portal...
          </div>
        }
      >
        <OtpVerificationForm />
      </Suspense>
    </div>
  );
}
