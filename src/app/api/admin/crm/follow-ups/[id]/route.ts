import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// PATCH /api/admin/crm/follow-ups/[id] — Update follow-up status (COMPLETED, CANCELLED, etc.) or reschedule
export async function PATCH(
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

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, completionNotes, dueDate, reason } = body;

    if (process.env.DATABASE_URL) {
      const existing = await db.b2BFollowUp.findUnique({
        where: { id },
        include: { company: true },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Follow-up not found" },
          { status: 404, headers },
        );
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (status === "COMPLETED") updateData.completedAt = new Date();
      if (dueDate) updateData.dueDate = new Date(dueDate);
      if (reason) updateData.reason = reason;
      if (completionNotes) {
        updateData.notes = existing.notes
          ? `${existing.notes}\n[Resolution]: ${completionNotes}`
          : completionNotes;
      }

      const updated = await db.b2BFollowUp.update({
        where: { id },
        data: updateData,
      });

      // Log CRM activity
      if (status === "COMPLETED") {
        await db.b2BActivity.create({
          data: {
            companyId: existing.companyId,
            contactId: existing.contactId,
            activityType: "NOTE",
            title: `Follow-up Completed: ${existing.reason}`,
            description:
              completionNotes || `Marked completed by ${staff.name}.`,
            performedByStaffId: staff.id,
          },
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: `Follow-up marked as ${status || "updated"}.`,
          data: updated,
        },
        { headers },
      );
    }

    return NextResponse.json(
      { success: true, message: "Follow-up updated (Mock Mode)" },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}
