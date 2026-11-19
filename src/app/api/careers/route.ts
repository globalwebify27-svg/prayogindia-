import { NextResponse } from "next/server";
import { getCareersJobs } from "@/lib/careersStore";
import { getSecurityHeaders } from "@/lib/security";

export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("all") !== "true";

  const jobs = getCareersJobs({ activeOnly });

  return NextResponse.json(
    {
      success: true,
      data: jobs,
    },
    { headers },
  );
}
