import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Customer Sign In | Prayog India Store',
  description: 'Sign in to your Prayog account to track orders, save institutional delivery addresses, and redeem STEM reward points.',
};

export default function LoginPage() {
  return (
    <div className="py-8">
      <Suspense fallback={<div className="max-w-md mx-auto py-20 text-center text-xs text-slate-400">Loading sign in portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
