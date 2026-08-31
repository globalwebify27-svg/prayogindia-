import { Metadata } from 'next';
import { CATEGORIES_DATA } from '@/data/categories';
import { CategoryDetailView } from '@/components/categories/CategoryDetailView';

interface Props {
  params: Promise<{ categorySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = CATEGORIES_DATA.find(c => c.slug === categorySlug || c.slugAlias === categorySlug);
  const title = category ? `${category.name} Hardware & Components | Prayog India` : 'Category | Prayog India';
  const description = category ? category.shortDescription : 'Explore robotics & electronic components.';

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function DynamicCategoryPage({ params }: Props) {
  const { categorySlug } = await params;
  return <CategoryDetailView categorySlug={categorySlug} />;
}
