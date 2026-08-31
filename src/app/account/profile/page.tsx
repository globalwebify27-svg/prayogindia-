import { Metadata } from 'next';
import { ProfileForm } from '@/components/account/ProfileForm';

export const metadata: Metadata = {
  title: 'My Profile & GST Info | Prayog India Store',
  description: 'Manage personal profile, company details, and GSTIN number.',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfileForm />;
}
