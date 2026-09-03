export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  mission: string;
  vision: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  businessHours: string;
  googleMapUrl: string;
}

export interface JobOpening {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  shortDescription: string;
  responsibilities: string[];
  requirements: string[];
}

export const COMPANY_INFO: CompanyInfo = {
  name: "Prayog India",
  tagline:
    "Leading Mechatronics, STEM & Robotics Technology Ecosystem in India",
  description:
    "Prayog India is a premier mechatronics, STEM innovation, and robotics technology ecosystem provider based in Bengaluru, India. We empower educational institutions, universities, and industrial R&D teams with high-precision microcontrollers, drone flight hardware, sensor arrays, and turnkey lab setups.",
  mission:
    "To democratize experiential mechatronics and STEM education across India by manufacturing and delivering authentic, high-reliability electronic hardware components and turnkey laboratory setups.",
  vision:
    "To build India’s largest indigenous hardware engineering ecosystem for robotics, autonomous drones, and Industry 4.0 automation.",
  phone: "+91 98765 43210",
  email: "support@prayogindia.com",
  whatsapp: "+919876543210",
  address: "Prayog Tech Hub, Plot 42, Electronics City Phase 1",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560100",
  businessHours: "Monday – Saturday: 9:00 AM – 6:30 PM IST",
  googleMapUrl: "https://maps.google.com/?q=Electronics+City+Phase+1+Bengaluru",
};

export const JOB_OPENINGS: JobOpening[] = [
  {
    id: "job-1",
    slug: "robotics-field-application-engineer",
    title: "Robotics Field Application Engineer",
    department: "Lab Engineering & Installation",
    location: "Bengaluru, Karnataka (On-site / Field)",
    type: "Full-time",
    experience: "2 - 4 Years",
    shortDescription:
      "Lead turnkey STEM & Robotics laboratory hardware installations across universities and engineering institutions.",
    responsibilities: [
      "Install, calibrate, and verify ROS2 mobile robot platforms and 6-DOF manipulator arms.",
      "Conduct educator onboarding workshops and faculty technical training sessions.",
      "Troubleshoot microcontroller, sensor telemetry, and power electronics kits.",
    ],
    requirements: [
      "B.Tech / M.Tech in Mechatronics, Electrical, or Robotics Engineering.",
      "Proficiency in C/C++, Python, ROS2, and microcontroller bootloaders (ATmega, ESP32).",
      "Willingness to travel for institutional lab setups across South India.",
    ],
  },
  {
    id: "job-2",
    slug: "embedded-firmware-engineer",
    title: "Embedded Systems & Firmware Engineer",
    department: "Hardware R&D",
    location: "Bengaluru, Karnataka",
    type: "Full-time",
    experience: "1 - 3 Years",
    shortDescription:
      "Develop real-time C/C++ firmware and bootloaders for custom IoT sensors and UAV telemetry modules.",
    responsibilities: [
      "Write FreeRTOS & Bare-metal C/C++ firmware for ESP32 and STM32 microcontrollers.",
      "Design PCB schematics and multi-layer layouts using KiCAD or Altium.",
      "Test Pixhawk MavLink protocol communications and sensor fusion filters.",
    ],
    requirements: [
      "Bachelor’s degree in Electronics & Communication (ECE) or Embedded Systems.",
      "Hands-on experience with Oscilloscopes, Logic Analyzers, SPI, I2C, and CAN Bus.",
      "Familiarity with Git and embedded build systems.",
    ],
  },
];
