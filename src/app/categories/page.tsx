import { Metadata } from 'next';
import { CategoriesOverviewView } from '@/components/categories/CategoriesOverviewView';

export const metadata: Metadata = {
  title: 'Explore All Categories | Prayog India Hardware Store',
  description: 'Explore robotics, microcontrollers, Arduino, Raspberry Pi, drone components, STEM educational kits, and electronic sensors.',
  openGraph: {
    title: 'Explore All Categories | Prayog India Hardware Store',
    description: 'Explore robotics, microcontrollers, Arduino, Raspberry Pi, drone components, STEM educational kits, and electronic sensors.',
  },
};

export default function CategoriesPage() {
  return <CategoriesOverviewView />;
}
