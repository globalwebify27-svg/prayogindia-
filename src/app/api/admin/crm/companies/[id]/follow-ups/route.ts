import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// POST /api/admin/crm/companies/[id]/follow-ups — Schedule a follow-up for a B2B company
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const staff = await getAuthenticatedStaff();

  if (
    !staff ||
    (staff.role !== "SUPER_ADMIN" &&
      staff.role !== "REGIONAL_MANAGER" &&
      staff.role !== "STORE_MANAGER")
  ) {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers },
    );
  }

  const { id: companyId } = await params;

  try {
    const body = await request.json();
    const { dueDate, reason, notes, contactId, assignedStaffId } = body;

    if (!dueDate || !reason) {
      return NextResponse.json(
        {
          success: false,
          message: "Due date and follow-up reason are required.",
        },
        { status: 400, headers },
      );
    }

    if (process.env.DATABASE_URL) {
      const company = await db.b2BCompany.findUnique({
        where: { id: companyId },
      });
      if (!company) {
        return NextResponse.json(
          { success: false, message: "Company not found" },
          { status: 404, headers },
        );
      }

      let dbStaffId: string | null = null;
      const targetStaffLookup = assignedStaffId || staff?.id;
      if (targetStaffLookup) {
        const foundStaff = await db.staffUser.findFirst({
          where: {
            OR: [
              { id: targetStaffLookup },
              { username: targetStaffLookup },
              ...(staff.email ? [{ email: staff.email }] : []),
            ],
          },
        });
        dbStaffId = foundStaff ? foundStaff.id : null;
      }

      const followUp = await db.b2BFollowUp.create({
        data: {
          companyId,
          contactId: contactId || null,
          assignedStaffId: dbStaffId,
          dueDate: new Date(dueDate),
          reason: reason.trim(),
          notes: notes || null,
          status: "PENDING",
        },
        include: {
          contact: { select: { id: true, name: true, phone: true } },
          assignedStaff: { select: { id: true, name: true, role: true } },
        },
      });

      // Log CRM activity for this scheduled follow-up
      await db.b2BActivity.create({
        data: {
          companyId,
          contactId: contactId || null,
          activityType: "FOLLOW_UP",
          title: `Follow-up Scheduled: ${reason}`,
          description: `Due on ${new Date(dueDate).toLocaleDateString("en-IN")}. Assigned to ${followUp.assignedStaff?.name || staff.name}.`,
          performedByStaffId: dbStaffId,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Follow-up scheduled successfully.",
          data: followUp,
        },
        { status: 201, headers },
      );
    }

    return NextResponse.json(
      { success: true, message: "Follow-up scheduled (Mock Mode)" },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}
