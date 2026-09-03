import { Metadata } from "next";
import { OtpVerificationForm } from "@/components/auth/OtpVerificationForm";

export const metadata: Metadata = {
  title: "Verify Mobile OTP | Prayog India Store",
  description: "Authenticate your phone number with a 6-digit OTP passcode.",
};

export default function VerifyOtpPage() {
  return (
    <div className="py-8">
      <OtpVerificationForm />
    </div>
  );
}
