import { Metadata } from "next";
import { getCareersJobBySlug } from "@/lib/careersStore";
import { JOB_OPENINGS } from "@/data/companyData";
import { JobDetailView } from "@/components/careers/JobDetailView";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job =
    getCareersJobBySlug(slug) ||
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
  const initialJob =
    getCareersJobBySlug(slug) ||
    JOB_OPENINGS.find((j) => j.slug === slug || j.id === slug) ||
    JOB_OPENINGS[0];
  return <JobDetailView slug={slug} initialJob={initialJob} />;
}
