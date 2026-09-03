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
  trackingNumber?: string;
  trackingUrl?: string;
  isCancelable?: boolean;
  isReturnable?: boolean;
  items: Array<{
    id?: string;
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
    name: "Customer Delivery Address",
    phone: "+91 98765 00000",
    street: "Flat 402, Green Glen Tech Park, Outer Ring Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
    type: "Home",
    isDefault: true,
  },
];

export const MOCK_CUSTOMER_ORDERS: CustomerOrder[] = [];

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [];
