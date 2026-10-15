import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

  if (!q) {
    return NextResponse.json(
      { success: false, message: "Please enter an Order ID or AWB Tracking Number." },
      { status: 400 },
    );
  }

  const cleanQuery = q.toUpperCase();

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
        },
      });

      if (order) {
        if (!order.shipment) {
          return NextResponse.json({
            success: true,
            data: {
              orderNumber: order.orderNumber,
              awb: "PENDING_DISPATCH",
              courier: "Prayog Logistics",
              courierCode: "prayog",
              estimatedDelivery: "Preparing for Dispatch",
              destination: order.shippingAddress || "Registered Delivery Address",
              status: "Order Confirmed - Packaging in Progress",
              currentLocation: "Prayog Fulfilment Hub",
              checkpoints: [
                {
                  title: "Order Placed & Confirmed",
                  time: new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  location: "Prayog Central Hub",
                  done: true,
                  current: true,
                },
                {
                  title: "Packing & Quality Testing",
                  time: "In Progress",
                  location: "Fulfilment Centre",
                  done: false,
                },
                {
                  title: "Handover to Courier",
                  time: "Awaiting Dispatch",
                  location: "Courier Hub",
                  done: false,
                },
              ],
            },
          });
        }

        const rawEvents = Array.isArray(order.shipment.trackingEvents)
          ? (order.shipment.trackingEvents as any[])
          : [];

        const checkpoints = rawEvents.length > 0
          ? rawEvents.map((evt, idx) => ({
              title: evt.status || evt.title || "In Transit",
              time: evt.timestamp ? new Date(evt.timestamp).toLocaleString("en-IN") : "Recent",
              location: evt.location || "Logistics Hub",
              done: true,
              current: idx === rawEvents.length - 1,
            }))
          : [
              {
                title: "Package Dispatched",
                time: order.shipment.shippedAt
                  ? new Date(order.shipment.shippedAt).toLocaleString("en-IN")
                  : "Dispatched",
                location: "Prayog Fulfilment Hub",
                done: true,
                current: true,
              },
            ];

        return NextResponse.json({
          success: true,
          data: {
            orderNumber: order.orderNumber,
            awb: order.shipment.trackingNumber || "N/A",
            courier: order.shipment.courierName || "Express Courier",
            courierCode: order.shipment.courierCode || "delhivery",
            estimatedDelivery: order.shipment.estimatedDelivery
              ? new Date(order.shipment.estimatedDelivery).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "In 2-3 Business Days",
            destination: order.shippingAddress || "Customer Address",
            status: order.shipment.status || "In Transit",
            currentLocation: "Hub Sorting Facility",
            checkpoints,
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
