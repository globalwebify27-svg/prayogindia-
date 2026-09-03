import { Metadata } from "next";
import { JOB_OPENINGS } from "@/data/companyData";
import { JobDetailView } from "@/components/careers/JobDetailView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job =
    JOB_OPENINGS.find((j) => j.slug === slug || j.id === slug) ||
    JOB_OPENINGS[0];

  const title = job
    ? `${job.title} | Prayog India Careers`
    : "Job Opening | Prayog India";
  const description = job
    ? job.shortDescription
    : "Engineering career opening at Prayog India.";

  return {
    title,
    description,
  };
}

export default async function JobSlugPage({ params }: Props) {
  const { slug } = await params;
  return <JobDetailView slug={slug} />;
}
