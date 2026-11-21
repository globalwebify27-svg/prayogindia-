import React from "react";

interface FilterFunnelIconProps {
  className?: string;
  size?: number;
}

/**
 * FilterFunnelIcon
 * Custom authentic SVG icon based on the user's funnel illustration:
 * Features the geometric shapes (cube & sphere) dropping into the funnel
 * with a wide rim, tapered cone body, and bottom spout.
 */
export const FilterFunnelIcon: React.FC<FilterFunnelIconProps> = ({
  className = "w-4 h-4",
  size,
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Geometric shape 1 (tilted cube) entering funnel */}
    <rect
      x="6.2"
      y="1.8"
      width="3"
      height="3"
      rx="0.5"
      transform="rotate(15 7.7 3.3)"
      fill="currentColor"
      stroke="none"
    />
    {/* Geometric shape 2 (sphere) entering funnel */}
    <circle cx="15.8" cy="3.2" r="1.5" fill="currentColor" stroke="none" />
    {/* Funnel top rim */}
    <path d="M3 7h18" />
    {/* Funnel tapered body and spout */}
    <path d="M4 7l6 6.5v6.5l4-1.5v-5L20 7" />
  </svg>
);

export default FilterFunnelIcon;
