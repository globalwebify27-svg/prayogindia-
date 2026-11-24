export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  type: "Home" | "Office" | "Lab / College";
  isDefault: boolean;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  totalAmount: number;
  subtotal?: number;
  gstAmount?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentMode?: string;
  paymentStatus?: string;
  isPaid?: boolean;
  receivedAmount?: number;
  status:
    | "Order Placed"
    | "Payment Confirmed"
    | "Processing"
    | "Packed"
    | "Shipped"
    | "Out for Delivery"
    | "Delivered"
    | "Cancelled";
  itemsCount: number;
  shippingAddress: string;
  createdAt?: string | Date | number;
  courierName?: string;
  courierCode?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  estimatedDelivery?: string;
  trackingEvents?: Array<{
    timestamp: string;
    location: string;
    status: string;
    message: string;
  }>;
  isCancelable?: boolean;
  isReturnable?: boolean;
  items: Array<{
    id?: string;
    slug?: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    image: string;
  }>;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category:
    "Hardware Inquiry" | "Lab Setup" | "Order Tracking" | "Technical Support";
  status:
    "Open" | "In Progress" | "Waiting for Customer" | "Resolved" | "Closed";
  createdDate: string;
  messages: Array<{
    sender: "Customer" | "Support Desk";
    text: string;
    timestamp: string;
  }>;
}

export const MOCK_SAVED_ADDRESSES: Address[] = [
  {
    id: "addr-default-1",
    name: "Om Kumar",
    phone: "+91 8709789641",
    street: "Flat 402, Green Glen Tech Park, Outer Ring Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
    type: "Home",
    isDefault: true,
  },
];

export const MOCK_CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: "ord-prg-101",
    orderNumber: "PI202511001",
    date: "02 Nov 2025 • 10:24 AM",
    totalAmount: 3499,
    status: "Delivered",
    itemsCount: 2,
    shippingAddress: "88XM+QV6, Gosaintola, Ranchi, Jharkhand 834001",
    courierName: "BlueDart Express",
    trackingNumber: "BD99283741IN",
    items: [
      {
        id: "prod-uno-r3",
        name: "Arduino UNO R3 Official Rev3 Board (ATmega328P)",
        sku: "PRG-ARD-001-STD",
        quantity: 1,
        price: 1499,
        image: "/images/products/arduino-uno-r3.png",
      },
      {
        id: "prod-l298n",
        name: "L298N Dual H-Bridge Motor Driver Module",
        sku: "PRG-DRV-001",
        quantity: 2,
        price: 1000,
        image: "/images/products/l298n-motor-driver.jpg",
      },
    ],
  },
  {
    id: "ord-prg-102",
    orderNumber: "PI202511000",
    date: "01 Nov 2025 • 03:15 PM",
    totalAmount: 1299,
    status: "Shipped",
    itemsCount: 1,
    shippingAddress: "88XM+QV6, Gosaintola, Ranchi, Jharkhand 834001",
    courierName: "Delhivery Surface",
    trackingNumber: "DL88219472IN",
    items: [
      {
        id: "prod-ultrasonic",
        name: "HC-SR04 Ultrasonic Distance Sensor",
        sku: "PRG-SEN-002",
        quantity: 2,
        price: 649.5,
        image: "/images/products/ultrasonic-sensor-hcsr04.png",
      },
    ],
  },
  {
    id: "ord-prg-103",
    orderNumber: "PI202510998",
    date: "30 Oct 2025 • 11:20 AM",
    totalAmount: 2799,
    status: "Processing",
    itemsCount: 1,
    shippingAddress: "88XM+QV6, Gosaintola, Ranchi, Jharkhand 834001",
    courierName: "DTDC Priority Air",
    trackingNumber: "DT11048291IN",
    items: [
      {
        id: "prod-mega-2560",
        name: "Arduino Mega 2560 R3 Microcontroller Board",
        sku: "PRG-ARD-002",
        quantity: 1,
        price: 2799,
        image: "/images/products/arduino-uno-r3.png",
      },
    ],
  },
  {
    id: "ord-prg-104",
    orderNumber: "PI202510997",
    date: "28 Oct 2025 • 06:45 PM",
    totalAmount: 999,
    status: "Cancelled",
    itemsCount: 1,
    shippingAddress: "88XM+QV6, Gosaintola, Ranchi, Jharkhand 834001",
    courierName: "BlueDart Express",
    trackingNumber: "BD44192083IN",
    items: [
      {
        id: "prod-chassis",
        name: "4WD Smart Robot Car Chassis Kit",
        sku: "PRG-ROB-004",
        quantity: 1,
        price: 999,
        image: "/images/products/4wd-robot-chassis-kit.jpg",
      },
    ],
  },
];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [];

/**
 * Safely extracts a reliable numeric millisecond timestamp from an order object,
 * using createdAt, embedded timestamp in orderNumber (e.g. WI-PAT-1794316722518),
 * or human-readable date strings.
 */
export function getOrderTimestamp(order: any): number {
  if (!order) return 0;

  // 1. Explicit raw createdAt (ISO string, Date, or timestamp number)
  if (order.createdAt) {
    const t = new Date(order.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }

  // 2. Explicit numeric timestamp property
  if (typeof order.timestamp === "number" && !isNaN(order.timestamp) && order.timestamp > 0) {
    return order.timestamp;
  }

  // 3. Embedded timestamp in orderNumber or id (e.g. WI-PAT-1794316722518, PRG-1731234567890)
  const idStr = `${order.orderNumber || ""} ${order.id || ""}`;
  const digitsMatch = idStr.match(/\b(1[6-9]\d{11,12})\b/) || idStr.match(/(1[6-9]\d{9,12})/);
  if (digitsMatch) {
    const parsed = parseInt(digitsMatch[1], 10);
    const ms = parsed < 1e11 ? parsed * 1000 : parsed;
    if (!isNaN(ms) && ms > 0) return ms;
  }

  // 4. Human-readable date string (e.g. "10 Nov 2026", "02 Nov 2025 • 10:24 AM", "Today")
  if (order.date && typeof order.date === "string") {
    const dLower = order.date.toLowerCase().trim();
    if (dLower === "today" || dLower.includes("just now")) return Date.now();
    if (dLower === "yesterday") return Date.now() - 86400000;
    const cleanDate = order.date.split("•")[0].trim();
    const currentYear = new Date().getFullYear();
    const hasYear = /\b20\d{2}\b/.test(cleanDate);
    const withYear = hasYear ? cleanDate : `${cleanDate} ${currentYear}`;
    const t = new Date(withYear).getTime();
    if (!isNaN(t) && t > 0) return t;
    const rawT = new Date(cleanDate).getTime();
    if (!isNaN(rawT) && rawT > 0) return rawT;
  }

  return 0;
}
