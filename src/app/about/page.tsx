import { Metadata } from 'next';
import { AboutView } from '@/components/about/AboutView';

export const metadata: Metadata = {
  title: 'About Us | Prayog India Store',
  description: 'Learn about Prayog India - India leading mechatronics, STEM innovation, and robotics technology ecosystem provider.',
};

export default function AboutPage() {
  return <AboutView />;
}
