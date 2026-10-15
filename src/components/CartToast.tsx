"use client";

import React from "react";
import Image from "next/image";
import { ShoppingBag, CheckCircle, X, ArrowRight } from "lucide-react";
import { Product, ProductVariant } from "@/data/mockData";

export interface CartToastNotification {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

interface CartToastProps {
  notification: CartToastNotification | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const CartToast: React.FC<CartToastProps> = () => {
  return null;
};

