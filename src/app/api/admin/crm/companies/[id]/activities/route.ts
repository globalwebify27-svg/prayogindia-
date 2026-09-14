import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// POST /api/admin/crm/companies/[id]/activities — Log an interaction (Call, Meeting, Email, Note)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (!staff || (staff.role !== "SUPER_ADMIN" && staff.role !== "REGIONAL_MANAGER" && staff.role !== "STORE_MANAGER")) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403, headers });
  }

  const { id: companyId } = await params;

  try {
    const body = await request.json();
    const { activityType = "NOTE", title, description, contactId } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Activity title is required." },
        { status: 400, headers }
      );
    }

    if (process.env.DATABASE_URL) {
      const company = await db.b2BCompany.findUnique({ where: { id: companyId } });
      if (!company) {
        return NextResponse.json({ success: false, message: "Company not found" }, { status: 404, headers });
      }

      const activity = await db.b2BActivity.create({
        data: {
          companyId,
          contactId: contactId || null,
          activityType,
          title: title.trim(),
          description: description || null,
          performedByStaffId: staff.id,
        },
        include: {
          contact: { select: { id: true, name: true, designation: true } },
        },
      });

      // Update company updatedAt timestamp
      await db.b2BCompany.update({
        where: { id: companyId },
        data: { updatedAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        message: "Activity logged successfully.",
        data: activity,
      }, { status: 201, headers });
    }

    return NextResponse.json({ success: true, message: "Activity logged (Mock Mode)" }, { headers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500, headers });
  }
}
