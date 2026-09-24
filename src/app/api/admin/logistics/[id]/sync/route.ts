import { NextResponse } from "next/server";
import { LogisticsEngine } from "@/lib/logisticsEngine";
import { getSecurityHeaders } from "@/lib/security";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";

/**
 * POST /api/admin/logistics/[id]/sync
 * Trigger on-demand tracking synchronization for a shipment
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const headers = getSecurityHeaders();
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers },
    );
  }

  const resolvedParams = await params;
  const shipmentId = resolvedParams.id;

  if (!shipmentId) {
    return NextResponse.json(
      { success: false, message: "Shipment identifier is required." },
      { status: 400, headers },
    );
  }

  try {
    const result = await LogisticsEngine.syncShipmentTracking(shipmentId);

    return NextResponse.json(
      {
        success: true,
        message: `Tracking synchronized successfully. Status: ${result.status}`,
        data: result,
      },
      { headers },
    );
  } catch (error: any) {
    console.error("[Logistics Sync Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to synchronize tracking.",
      },
      { status: 500, headers },
    );
  }
}
