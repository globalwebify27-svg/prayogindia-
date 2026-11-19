import { NextResponse } from "next/server";
import { getCareersJobBySlug } from "@/lib/careersStore";
import { getSecurityHeaders } from "@/lib/security";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const headers = getSecurityHeaders();
  const { slug } = await params;

  const job = getCareersJobBySlug(slug);

  if (!job) {
    return NextResponse.json(
      {
        success: false,
        message: "Job opening not found",
      },
      { status: 404, headers },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: job,
    },
    { headers },
  );
}
