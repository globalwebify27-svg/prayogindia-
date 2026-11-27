import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Centralized INR price & currency formatting helper for Prayog India.
 * Formats numbers into standard Indian numbering system (e.g. 12,222 or 12,222.00).
 */
export function formatINR(
  amount: number,
  options?: { showDecimals?: boolean }
): string {
  if (typeof amount !== "number" || isNaN(amount)) return "0";
  return options?.showDecimals
    ? amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : Math.round(amount).toLocaleString("en-IN");
}

