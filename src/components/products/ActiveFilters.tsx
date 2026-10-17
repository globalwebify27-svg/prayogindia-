"use client";

import React from "react";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  category?: string | null;
  brand?: string | null;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  onRemoveCategory: () => void;
  onRemoveBrand: () => void;
  onRemoveStock: () => void;
  onResetPrice: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = () => {
  return null;
};
