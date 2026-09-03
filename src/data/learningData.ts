export interface LearningResource {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  level: string;
  shortDescription: string;
  bannerImage: string;
  content: string;
  relatedProductIds: string[];
}

export const LEARNING_RESOURCES: LearningResource[] = [
  {
    id: "lrn-arduino-uno-guide",
    slug: "getting-started-with-arduino-uno-r3-pinouts",
    title: "Getting Started with Arduino UNO R3 & GPIO Pinouts",
    category: "Microcontrollers",
    readTime: "8 Min Read",
    level: "Beginner",
    shortDescription:
      "Complete beginner guide to setting up Arduino IDE 2.0, uploading your first blink sketch, and understanding digital PWM pins.",
    bannerImage:
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1200&q=80",
    content:
      "Arduino UNO R3 is the world standard microcontroller board for educational STEM prototyping. Based on ATmega328P, it features 14 digital I/O pins, 6 analog inputs, 16 MHz ceramic resonator, and USB-B connection.",
    relatedProductIds: ["ard-uno-r3", "ard-mega-2560"],
  },
  {
    id: "lrn-pixhawk-uav-calibration",
    slug: "pixhawk-6c-flight-controller-mission-planner-setup",
    title: "Pixhawk 6C Autopilot Mission Planner & ESC Calibration",
    category: "Drone Technology",
    readTime: "15 Min Read",
    level: "Advanced",
    shortDescription:
      "Step-by-step ArduPilot telemetry tuning, compass calibration, and 4-in-1 ESC motor direction configuration.",
    bannerImage:
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80",
    content:
      "Pixhawk 6C is a high-performance open-hardware autopilot flight controller powered by STM32H753 MCU with redundant IMUs and barometer.",
    relatedProductIds: ["pixhawk-6c", "esc-4in1-45a", "lipo-4s-5200"],
  },
];
