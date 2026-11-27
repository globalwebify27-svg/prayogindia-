import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedCustomer } from "@/lib/authUtils";

// Predefined demo/sample tracking numbers for preview & testing
const DEMO_SAMPLES: Record<string, any> = {
  "ORD-9821-DEL": {
    orderNumber: "ORD-9821-DEL",
    awb: "DEL-849201948",
    courier: "Delhivery Surface Express",
    courierCode: "delhivery",
    estimatedDelivery: "In 2 Business Days",
    destination: "Bengaluru, Karnataka (560103)",
    status: "In Transit - Out for Local Hub Transfer",
    currentLocation: "Bengaluru Central Air Cargo Hub",
    checkpoints: [
      {
        title: "Order Placed & Confirmed",
        time: "Yesterday, 04:30 PM",
        location: "Prayog Hardware Dispatch Hub, Delhi",
        done: true,
      },
      {
        title: "Quality Tested & Packed in Anti-Static Enclosure",
        time: "Yesterday, 07:15 PM",
        location: "Prayog STEM Fulfilment Centre",
        done: true,
      },
      {
        title: "Handed over to Delhivery Logistics",
        time: "Today, 02:40 AM",
        location: "Delhi Linehaul Sorting Facility",
        done: true,
      },
      {
        title: "Arrived at Destination Hub (In Transit)",
        time: "Today, 11:20 AM",
        location: "Bengaluru Cargo Hub, Karnataka",
        done: true,
        current: true,
      },
      {
        title: "Out for Final Lab Delivery",
        time: "Expected Tomorrow, 10:00 AM",
        location: "Local Express Delivery Courier Desk",
        done: false,
      },
      {
        title: "Delivered to Customer / Institution",
        time: "Estimated by 2:00 PM",
        location: "Designated Delivery Address",
        done: false,
      },
    ],
  },
  "DEL-849201948": {
    orderNumber: "ORD-9821-DEL",
    awb: "DEL-849201948",
    courier: "Delhivery Surface Express",
    courierCode: "delhivery",
    estimatedDelivery: "Tomorrow by 5:00 PM",
    destination: "Hyderabad, Telangana (500081)",
    status: "In Transit - On Interstate Linehaul Vehicle",
    currentLocation: "Hyderabad Linehaul Hub",
    checkpoints: [
      {
        title: "Shipment Picked Up from Warehouse",
        time: "2 Days ago, 06:10 PM",
        location: "Delhi Air Cargo Terminal",
        done: true,
      },
      {
        title: "Arrived at Hyderabad Sorting Hub",
        time: "Today, 06:45 AM",
        location: "Shamshabad Logistics Park",
        done: true,
        current: true,
      },
      {
        title: "Out for Delivery",
        time: "Tomorrow, 09:30 AM",
        location: "Madhapur Delivery Hub",
        done: false,
      },
    ],
  },
  "SR-77391024": {
    orderNumber: "ORD-7739-BLR",
    awb: "SR-77391024",
    courier: "Shiprocket Air Express",
    courierCode: "shiprocket",
    estimatedDelivery: "Delivered",
    destination: "Patna, Bihar (800001)",
    status: "Delivered Successfully",
    currentLocation: "Customer Delivery Desk",
    checkpoints: [
      {
        title: "Package Picked Up",
        time: "3 Days ago, 03:00 PM",
        location: "Noida Hub",
        done: true,
      },
      {
        title: "In Transit to Destination",
        time: "2 Days ago, 11:30 AM",
        location: "Patna Cargo Complex",
        done: true,
      },
      {
        title: "Delivered & Signed",
        time: "Yesterday, 01:15 PM",
        location: "Patna Central",
        done: true,
        current: true,
      },
    ],
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const contact = searchParams.get("contact")?.trim() || "";

  if (!q) {
    return NextResponse.json(
      { success: false, message: "Please enter an Order ID or AWB Tracking Number." },
      { status: 400 },
    );
  }

  const cleanQuery = q.toUpperCase();
  const authUser = await getAuthenticatedCustomer();

  // 1. Check live database if configured
  if (process.env.DATABASE_URL) {
    try {
      const order = await db.order.findFirst({
        where: {
          OR: [
            { orderNumber: { equals: cleanQuery, mode: "insensitive" } },
            { id: cleanQuery },
            { shipment: { trackingNumber: { equals: cleanQuery, mode: "insensitive" } } },
          ],
        },
        include: {
          shipment: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (order) {
        // Privacy Gate: Verify ownership before disclosing full destination address
        const isOwner = Boolean(
          authUser && (authUser.id === order.userId || authUser.role === "ADMIN"),
        );

        let isContactVerified = isOwner;
        if (!isContactVerified && contact) {
          const cleanInput = contact.toLowerCase();
          const inputDigits = cleanInput.replace(/\D/g, "");
          const userPhoneDigits = (order.user?.phone || "").replace(/\D/g, "");
          const userEmail = (order.user?.email || "").toLowerCase();
          const shippingStr = (order.shippingAddress || "").toLowerCase();

          const matchesEmail = userEmail && userEmail === cleanInput;
          const matchesPhone =
            inputDigits.length >= 10 &&
            (userPhoneDigits.endsWith(inputDigits.slice(-10)) ||
              shippingStr.includes(inputDigits.slice(-10)));

          if (matchesEmail || matchesPhone) {
            isContactVerified = true;
          } else {
            return NextResponse.json(
              {
                success: false,
                error: "VERIFICATION_FAILED",
                message:
                  "The mobile number or email entered does not match this order. Please verify your registered contact details.",
              },
              { status: 403 },
            );
          }
        }

        // Mask destination if unverified to prevent PII harvesting
        let destinationText = order.shippingAddress || "Registered Delivery Address";
        if (!isContactVerified) {
          // Extract city/pincode or mask street address
          const parts = destinationText.split(",");
          const lastPart = parts[parts.length - 1]?.trim() || "India";
          destinationText = `Protected Destination (${lastPart.slice(-10)})`;
        }

        // Standard timeline: Order Placed -> Payment Confirmed -> Processing -> Packed -> Shipped -> Out for Delivery -> Delivered
        const statusOrderMap: Record<string, number> = {
          ORDER_PLACED: 1,
          PAYMENT_CONFIRMED: 2,
          PROCESSING: 3,
          PACKED: 4,
          SHIPPED: 5,
          OUT_FOR_DELIVERY: 6,
          DELIVERED: 7,
        };

        const currentStep = statusOrderMap[order.status] || (order.paymentStatus === "PAID" ? 2 : 1);

        const standardCheckpoints = [
          {
            title: "Order Placed",
            time: new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }),
            location: "Prayog India Online Store",
            done: currentStep >= 1,
            current: currentStep === 1,
          },
          {
            title: "Payment Confirmed",
            time: order.paymentStatus === "PAID" ? "Verified" : "Pending",
            location: "Secure Payment Gateway",
            done: currentStep >= 2,
            current: currentStep === 2,
          },
          {
            title: "Processing & Technical Inspection",
            time: currentStep >= 3 ? "Completed" : "In Queue",
            location: "Prayog Hardware Lab Hub",
            done: currentStep >= 3,
            current: currentStep === 3,
          },
          {
            title: "Quality Tested & Packed",
            time: currentStep >= 4 ? "Packed" : "Awaiting Packing",
            location: "Prayog ESD Fulfilment Centre",
            done: currentStep >= 4,
            current: currentStep === 4,
          },
          {
            title: "Handed over to Courier",
            time: order.shipment?.shippedAt
              ? new Date(order.shipment.shippedAt).toLocaleString("en-IN")
              : "Awaiting Dispatch",
            location: order.shipment?.courierName || "Express Linehaul Logistics",
            done: currentStep >= 5,
            current: currentStep === 5,
          },
          {
            title: "Out for Final Delivery",
            time: currentStep >= 6 ? "Out with delivery agent" : "Pending destination arrival",
            location: "Destination Delivery Hub",
            done: currentStep >= 6,
            current: currentStep === 6,
          },
          {
            title: "Delivered to Customer",
            time: currentStep >= 7 ? "Delivered" : "Expected in 2–4 Business Days",
            location: destinationText,
            done: currentStep >= 7,
            current: currentStep === 7,
          },
        ];

        return NextResponse.json({
          success: true,
          data: {
            orderNumber: order.orderNumber,
            awb: order.shipment?.trackingNumber || "PENDING_DISPATCH",
            courier: order.shipment?.courierName || "Prayog Express Logistics",
            courierCode: order.shipment?.courierCode || "prayog",
            estimatedDelivery: order.shipment?.estimatedDelivery
              ? new Date(order.shipment.estimatedDelivery).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "In 2–4 Business Days",
            destination: destinationText,
            status: order.shipment?.status || (order.status === "DELIVERED" ? "Delivered Successfully" : "Order Confirmed - Packaging in Progress"),
            currentLocation: order.shipment ? "Hub Sorting Facility" : "Prayog Fulfilment Hub",
            checkpoints: standardCheckpoints,
            isVerified: isContactVerified,
            requiresVerification: !isContactVerified,
          },
        });
      }
    } catch (err) {
      console.warn("Tracking DB query error:", err);
    }
  }

  // 2. Check demo mock samples
  if (DEMO_SAMPLES[cleanQuery]) {
    return NextResponse.json({
      success: true,
      data: DEMO_SAMPLES[cleanQuery],
    });
  }

  // 3. If query does not match any valid order or demo record, return NOT FOUND error
  return NextResponse.json(
    {
      success: false,
      error: "NOT_FOUND",
      message: `No active order or shipment found matching "${q}".`,
    },
    { status: 404 },
  );
}
