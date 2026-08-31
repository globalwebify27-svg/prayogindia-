import { Metadata } from 'next';
import { OFFERS_DATA } from '@/data/offersData';
import { OfferDetailView } from '@/components/offers/OfferDetailView';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const offer = OFFERS_DATA.find(o => o.slug === slug || o.id === slug) || OFFERS_DATA[0];

  const title = offer ? `${offer.title} | Prayog India Offers` : 'Offer Details | Prayog India';
  const description = offer ? offer.shortDescription : 'Promotional hardware deal and voucher offer.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: offer ? [{ url: offer.image }] : [],
    },
  };
}

export default async function OfferSlugPage({ params }: Props) {
  const { slug } = await params;
  return <OfferDetailView slug={slug} />;
}
