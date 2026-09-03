import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ q?: string; search?: string }>;
}

export default async function SearchRedirectPage({ searchParams }: Props) {
  const { q, search } = await searchParams;
  const query = q || search || "";
  redirect(`/products?search=${encodeURIComponent(query)}`);
}
