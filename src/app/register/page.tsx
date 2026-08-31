import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | Prayog India Store',
  description: 'Register for a customer or institution account to purchase genuine robotics components and STEM learning kits.',
};

export default function RegisterPage() {
  return (
    <div className="py-8">
      <RegisterForm />
    </div>
  );
}
