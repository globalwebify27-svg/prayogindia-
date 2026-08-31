import { Metadata } from 'next';
import { OrderDetailView } from '@/components/account/OrderDetailView';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Order Details | Prayog India Store',
  robots: { index: false, follow: false },
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
