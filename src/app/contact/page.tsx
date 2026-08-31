import { Metadata } from 'next';
import { ContactView } from '@/components/contact/ContactView';

export const metadata: Metadata = {
  title: 'Contact Us & Official Office | Prayog India Store',
  description: 'Reach Prayog India mechatronics engineering support team, office phone, email, address, and WhatsApp.',
};

export default function ContactPage() {
  return <ContactView />;
}
