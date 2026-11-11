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
  status:
    | "Order Placed"
    | "Payment Confirmed"
    | "Processing"
    | "Packed"
    | "Shipped"
    | "Out for Delivery"
    | "Delivered";
  itemsCount: number;
  shippingAddress: string;
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
    orderNumber: "PRG-2024-8841",
    date: "28 Jul, 10:01 pm",
    totalAmount: 2998,
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
        price: 749,
        image: "/images/products/l298n-motor-driver.jpg",
      },
    ],
  },
  {
    id: "ord-prg-102",
    orderNumber: "PRG-2024-7719",
    date: "09 Jul, 7:42 am",
    totalAmount: 1499,
    status: "Delivered",
    itemsCount: 1,
    shippingAddress: "88XM+QV6, Gosaintola, Ranchi, Jharkhand 834001",
    courierName: "Delhivery Surface",
    trackingNumber: "DL88219472IN",
    items: [
      {
        id: "prod-uno-r3",
        name: "Arduino UNO R3 Official Rev3 Board (ATmega328P)",
        sku: "PRG-ARD-001-STD",
        quantity: 1,
        price: 1499,
        image: "/images/products/arduino-uno-r3.png",
      },
    ],
  },
  {
    id: "ord-prg-103",
    orderNumber: "PRG-2024-6352",
    date: "06 Jun, 10:33 pm",
    totalAmount: 2198,
    status: "Delivered",
    itemsCount: 2,
    shippingAddress: "88XM+QV6, Gosaintola, Ranchi, Jharkhand 834001",
    courierName: "DTDC Priority Air",
    trackingNumber: "DT11048291IN",
    items: [
      {
        id: "prod-ultrasonic",
        name: "HC-SR04 Ultrasonic Distance Sensor",
        sku: "PRG-SEN-002",
        quantity: 2,
        price: 299,
        image: "/images/products/ultrasonic-sensor-hcsr04.png",
      },
      {
        id: "prod-chassis",
        name: "4WD Smart Robot Car Chassis Kit",
        sku: "PRG-ROB-004",
        quantity: 1,
        price: 1599,
        image: "/images/products/4wd-robot-chassis-kit.jpg",
      },
    ],
  },
  {
    id: "ord-prg-104",
    orderNumber: "PRG-2024-5104",
    date: "15 May, 9:04 am",
    totalAmount: 1899,
    status: "Delivered",
    itemsCount: 1,
    shippingAddress: "88XM+QV6, Gosaintola, Ranchi, Jharkhand 834001",
    courierName: "BlueDart Express",
    trackingNumber: "BD44192083IN",
    items: [
      {
        id: "prod-mega-2560",
        name: "Arduino Mega 2560 R3 Microcontroller Board",
        sku: "PRG-ARD-002",
        quantity: 1,
        price: 1899,
        image: "/images/products/arduino-uno-r3.png",
      },
    ],
  },
];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [];
