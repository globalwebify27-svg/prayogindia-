import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Prayog India Store",
  description: "Recover your Prayog customer account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="py-8">
      <ForgotPasswordForm />
    </div>
  );
}
