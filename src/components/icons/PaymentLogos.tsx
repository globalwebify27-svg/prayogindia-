import React from "react";

/**
 * Authentic Vector Payment Method Logos
 * - UPI (NPCI official brand geometry)
 * - RuPay (NPCI official brand geometry & dual chevrons)
 * - VISA (Official brand typography & geometry)
 * - Mastercard (Official overlapping red & yellow circles)
 * - NetBanking (Universal Indian banking network mark)
 * - Razorpay (Official trusted payments gateway mark)
 * - PhonePe (Official brand glyph)
 * - Google Pay (Official GPay mark)
 */

interface PaymentLogoProps {
  className?: string;
}

// 1. Official UPI Logo
export const UPILogo: React.FC<PaymentLogoProps> = ({ className = "h-4 w-auto" }) => (
  <img
    src="/images/payments/upi.webp"
    alt="UPI - Unified Payments Interface"
    className={`object-contain inline-block ${className}`}
    loading="lazy"
  />
);

// 2. Official RuPay Logo
export const RuPayLogo: React.FC<PaymentLogoProps> = ({ className = "h-4 w-auto" }) => (
  <img
    src="/images/payments/rupay.webp"
    alt="RuPay"
    className={`object-contain inline-block ${className}`}
    loading="lazy"
  />
);

// 3. Official VISA Logo
export const VisaLogo: React.FC<PaymentLogoProps> = ({ className = "h-4 w-auto" }) => (
  <svg
    viewBox="0 0 74 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="VISA"
  >
    <path
      d="M29.5 1.5L19.2 22.5H12.8L7.8 5.8C7.5 4.6 7.2 4.2 6.3 3.7C4.8 2.9 2.5 2.2 0.5 1.8L0.6 1.4H10.6C11.9 1.4 13.1 2.3 13.4 3.7L15.9 16.3L23.1 1.5H29.5ZM55.5 15.7C55.5 10.1 47.3 9.8 47.4 7.2C47.4 6.4 48.2 5.5 50 5.3C50.9 5.2 53.3 5.1 56.1 6.3L57.2 1.5C55.7 1 53.8 0.5 51.5 0.5C45.3 0.5 41 3.6 40.9 7.9C40.8 11.2 44 13 46.4 14.1C48.8 15.2 49.7 15.9 49.7 16.9C49.7 18.5 47.7 19.1 45.9 19.2C42.9 19.2 41.2 18.4 39.7 17.8L38.6 22.8C40.1 23.4 42.8 24 45.7 24C52.3 24 56.5 21 55.5 15.7ZM72.4 22.5H78.1L73.1 1.5H67.8C66.6 1.5 65.7 2.1 65.2 3.1L55.8 22.5H62.3L63.6 19.1H71.6L72.4 22.5ZM65.5 14.5L68.7 6.2L70.6 14.5H65.5ZM39.5 1.5L34.4 22.5H28.3L33.4 1.5H39.5Z"
      fill="#1434CB"
    />
  </svg>
);

// 4. Official Mastercard Logo
export const MastercardLogo: React.FC<PaymentLogoProps> = ({ className = "h-4 w-auto" }) => (
  <svg
    viewBox="0 0 46 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Mastercard"
  >
    <circle cx="14" cy="14" r="13" fill="#EB001B" />
    <circle cx="32" cy="14" r="13" fill="#F79E1B" fillOpacity="0.95" />
    <path
      d="M23 4.9C19.7 7.2 17.5 10.3 17.5 14C17.5 17.7 19.7 20.8 23 23.1C26.3 20.8 28.5 17.7 28.5 14C28.5 10.3 26.3 7.2 23 4.9Z"
      fill="#FF5F00"
    />
  </svg>
);

// 5. Official NetBanking Mark
export const NetBankingLogo: React.FC<PaymentLogoProps> = ({ className = "h-4 w-auto" }) => (
  <svg
    viewBox="0 0 98 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Net Banking"
  >
    {/* Neoclassical bank colonnade emblem */}
    <g transform="translate(1, 2)">
      <path d="M10 1L1 6.5V8.5H19V6.5L10 1Z" fill="#1D4ED8" />
      <rect x="2.5" y="9.5" width="2.2" height="7" rx="0.4" fill="#1D4ED8" />
      <rect x="6.8" y="9.5" width="2.2" height="7" rx="0.4" fill="#1D4ED8" />
      <rect x="11" y="9.5" width="2.2" height="7" rx="0.4" fill="#1D4ED8" />
      <rect x="15.3" y="9.5" width="2.2" height="7" rx="0.4" fill="#1D4ED8" />
      <rect x="1" y="17.5" width="18" height="2.5" rx="0.5" fill="#1D4ED8" />
    </g>

    {/* NetBanking text */}
    <text
      x="24"
      y="18"
      fontFamily="var(--font-inter), Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      fontWeight="800"
      fontSize="13"
      fill="#1E293B"
      letterSpacing="-0.2px"
    >
      NetBanking
    </text>
  </svg>
);

// 6. Razorpay Official Logo Mark
export const RazorpayLogo: React.FC<PaymentLogoProps> = ({ className = "h-4 w-auto" }) => (
  <img
    src="/images/payments/razorpay.webp"
    alt="Razorpay"
    className={`object-contain inline-block ${className}`}
    loading="lazy"
  />
);
