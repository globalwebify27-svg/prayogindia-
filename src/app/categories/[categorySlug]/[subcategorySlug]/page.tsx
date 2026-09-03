import { Metadata } from "next";
import { CATEGORIES_DATA } from "@/data/categories";
import { SubcategoryDetailView } from "@/components/categories/SubcategoryDetailView";

interface Props {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, subcategorySlug } = await params;
  const category = CATEGORIES_DATA.find(
    (c) => c.slug === categorySlug || c.slugAlias === categorySlug,
  );
  const subcategory = category?.subcategories.find(
    (s) => s.slug === subcategorySlug,
  );

  const title = subcategory
    ? `${subcategory.name} | ${category?.name} | Prayog India`
    : "Subcategory | Prayog India";
  const description = subcategory
    ? subcategory.description
    : "Explore robotics & STEM subcategories.";

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function SubcategoryPage({ params }: Props) {
  const { categorySlug, subcategorySlug } = await params;
  return (
    <SubcategoryDetailView
      categorySlug={categorySlug}
      subcategorySlug={subcategorySlug}
    />
  );
}
