import { Product, ProductVariant } from "@/data/mockData";
import { CustomerType } from "@/data/customerTypes";
import { ToastData } from "@/components/SuccessToast";

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface CustomerUser {
  id?: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  customerType: CustomerType;
  companyName?: string;
  gstin?: string;
  rewardPoints: number;
}

export interface CartNotificationData {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}
