import { Metadata } from "next";
import { SERVICES_DATA } from "@/data/servicesData";
import { ServiceDetailView } from "@/components/services/ServiceDetailView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service =
    SERVICES_DATA.find((s) => s.slug === slug || s.id === slug) ||
    SERVICES_DATA[0];

  const title = service
    ? `${service.name} | Prayog India Services`
    : "Service Details | Prayog India";
  const description = service
    ? service.shortDescription
    : "Turnkey technology and educational lab setup services.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: service ? [{ url: service.image }] : [],
    },
  };
}

export default async function ServiceSlugPage({ params }: Props) {
  const { slug } = await params;
  return <ServiceDetailView slug={slug} />;
}
