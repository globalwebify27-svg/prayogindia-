import React from "react";

// 1. Robotics Kits - Mechatronics joint & manipulator gripper
export const RoboticsCategoryIcon = ({
  className = "w-5 h-5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label="Robotics Kits"
  >
    <circle cx="12" cy="19" r="2.5" />
    <path d="M12 16.5V11" />
    <circle cx="12" cy="9" r="2" />
    <path d="M10.5 7.5L8 4" />
    <path d="M13.5 7.5L16 4" />
    <path d="M6.5 3.5h3" />
    <path d="M14.5 3.5h3" />
    <path d="M7 21h10" strokeWidth="2" />
  </svg>
);

// 2. Arduino & Microcontrollers - Dual-in-line IC microchip with clock crystal
export const ArduinoCategoryIcon = ({
  className = "w-5 h-5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label="Arduino"
  >
    <rect x="5" y="5" width="14" height="14" rx="2.5" />
    <circle cx="9" cy="9" r="1" fill="currentColor" />
    <path d="M9 13h6" />
    <path d="M12 11v4" />
    <path d="M1 8h4M1 12h4M1 16h4" />
    <path d="M19 8h4M19 12h4M19 16h4" />
  </svg>
);

// 3. Sensors & Modules - Radar ultrasonic transducer & signal emission
export const SensorsCategoryIcon = ({
  className = "w-5 h-5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label="Sensors & Modules"
  >
    <circle cx="8" cy="12" r="3.5" />
    <circle cx="8" cy="12" r="1.2" fill="currentColor" />
    <path d="M15 8a6 6 0 0 1 0 8" />
    <path d="M18.5 5a10.5 10.5 0 0 1 0 14" />
    <path d="M22 2a15 15 0 0 1 0 20" />
  </svg>
);

// 4. Drone Technology - UAV Quadcopter with telemetry airframe
export const DroneCategoryIcon = ({
  className = "w-5 h-5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label="Drone Technology"
  >
    <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <path d="M10 10L5 5M14 10l5-5M10 14l-5 5M14 14l5 5" />
    <circle cx="4.5" cy="4.5" r="2" />
    <circle cx="19.5" cy="4.5" r="2" />
    <circle cx="4.5" cy="19.5" r="2" />
    <circle cx="19.5" cy="19.5" r="2" />
  </svg>
);

// 5. STEM Kits - Experimental scientific chemistry flask & robotics gear
export const StemCategoryIcon = ({
  className = "w-5 h-5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label="STEM Kits"
  >
    <path d="M10 2v5l-4.5 7.5A3 3 0 0 0 8 19h8a3 3 0 0 0 2.5-4.5L14 7V2" />
    <path d="M8.5 2h7" />
    <circle cx="12" cy="13" r="1.5" fill="currentColor" />
    <path d="M7 14h10" strokeDasharray="1.5 1.5" />
  </svg>
);

// 6. IoT Products - Connected wireless node & telemetry mesh
export const IoTCategoryIcon = ({
  className = "w-5 h-5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label="IoT Products"
  >
    <circle cx="12" cy="12" r="2.5" fill="currentColor" />
    <path d="M12 2a10 10 0 0 1 10 10" />
    <path d="M12 6a6 6 0 0 1 6 6" />
    <path d="M2 12a10 10 0 0 1 10-10" />
    <path d="M6 12a6 6 0 0 1 6-6" />
    <path d="M12 16v6M9 22h6" />
  </svg>
);

// 7. Development Boards - Embedded SBC board with GPIO header pin array
export const DevBoardCategoryIcon = ({
  className = "w-5 h-5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label="Development Boards"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <rect x="7" y="7" width="5" height="5" rx="1" />
    <path d="M15 6v12" strokeWidth="2" strokeDasharray="1 2" strokeLinecap="butt" />
    <circle cx="6" cy="18" r="1" fill="currentColor" />
    <circle cx="18" cy="18" r="1" fill="currentColor" />
    <path d="M7 15h4" />
  </svg>
);

// 8. Electronic Components - Active circuit pulse & transistor nodes
export const ComponentsCategoryIcon = ({
  className = "w-5 h-5",
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label="Electronic Components"
  >
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="12" r="2.5" />
    <path d="M8.5 12h2.5l1.5-3 2 6 1.5-3h2" />
    <path d="M12 3v3M12 18v3" />
  </svg>
);
