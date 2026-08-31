import { Metadata } from 'next';
import { PRODUCTS } from '@/data/mockData';
import { ProductDetailView } from '@/components/product/ProductDetailView';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find(
    p => (p.slug && p.slug === slug) || p.id === slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
  ) || PRODUCTS[0];

  const title = product ? `${product.name} | Prayog India Store` : 'Product Details | Prayog India';
  const description = product ? product.description : 'Buy genuine robotics & STEM hardware components.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product ? [{ url: product.image }] : [],
    },
  };
}

export default async function ProductSlugPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetailView slug={slug} />;
}
