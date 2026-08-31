import { Metadata } from 'next';
import { CheckoutView } from '@/components/checkout/CheckoutView';

export const metadata: Metadata = {
  title: 'Secure Customer Checkout | Prayog India Store',
  description: 'Complete your purchase of genuine STEM microcontrollers, drone flight controllers, and robotics kits.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
