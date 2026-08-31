import { Metadata } from 'next';
import ProductsListingView from '@/components/products/ProductsListingView';

export const metadata: Metadata = {
  title: 'Complete Hardware & STEM Products | Prayog India Store',
  description: 'Shop official Arduino boards, Raspberry Pi, flight controllers, ESCs, drone motors, LiDAR sensors, and STEM learning kits with Pan-India dispatch.',
  openGraph: {
    title: 'Complete Hardware & STEM Products | Prayog India Store',
    description: 'Shop official Arduino boards, Raspberry Pi, flight controllers, ESCs, drone motors, LiDAR sensors, and STEM learning kits with Pan-India dispatch.',
  },
};

export default function ProductsPage() {
  return <ProductsListingView />;
}
