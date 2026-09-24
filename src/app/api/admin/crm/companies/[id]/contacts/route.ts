import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import { getSecurityHeaders } from "@/lib/security";

// POST /api/admin/crm/companies/[id]/contacts — Add a new contact to a B2B company
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
    const {
      name,
      designation,
      phone,
      email,
      contactType = "PURCHASE",
      isPrimary = false,
      notes,
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Contact name and phone number are required.",
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

      // If marking as primary, demote other primary contacts
      if (isPrimary) {
        await db.b2BContact.updateMany({
          where: { companyId },
          data: { isPrimary: false },
        });
      }

      const contact = await db.b2BContact.create({
        data: {
          companyId,
          name: name.trim(),
          designation: designation ? designation.trim() : null,
          phone: phone.trim(),
          email: email ? email.trim().toLowerCase() : null,
          contactType,
          isPrimary: Boolean(isPrimary),
          notes: notes || null,
        },
      });

      // Log CRM activity
      await db.b2BActivity.create({
        data: {
          companyId,
          contactId: contact.id,
          activityType: "NOTE",
          title: `Contact Added: ${name}`,
          description: `${designation || "Contact"} added by ${staff.name} (${staff.role}).`,
          performedByStaffId: staff.id,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: `Contact "${name}" added successfully.`,
          data: contact,
        },
        { status: 201, headers },
      );
    }

    return NextResponse.json(
      { success: true, message: "Contact added (Mock Mode)" },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}
