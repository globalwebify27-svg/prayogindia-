import { PRODUCTS, Product } from "@/data/mockData";

export const SLUG_ALIASES: Record<string, string[]> = {
  // Raspberry Pi
  "raspberry-pi-5-8gb": ["rpi-5-8gb", "prg-rpi-508", "raspberry-pi-5", "rpi5-8gb"],
  "rpi-5-8gb": ["raspberry-pi-5-8gb", "prg-rpi-508", "raspberry-pi-5"],
  "raspberry-pi-4-4gb": ["rpi-4-4gb", "prg-rpi-404", "raspberry-pi-4"],
  "rpi-4-4gb": ["raspberry-pi-4-4gb", "prg-rpi-404"],

  // Arduino Boards
  "arduino-uno-r3": ["ard-uno-r3", "arduino-uno-r3-official-rev3-board", "prg-ard-001"],
  "arduino-uno-r3-official-rev3-board": ["arduino-uno-r3", "ard-uno-r3", "prg-ard-001"],
  "ard-uno-r3": ["arduino-uno-r3", "arduino-uno-r3-official-rev3-board", "prg-ard-001"],
  "arduino-uno-r4-wifi": ["ard-uno-r4-wifi", "prg-ard-006"],
  "ard-uno-r4-wifi": ["arduino-uno-r4-wifi", "prg-ard-006"],

  // ESP32 Development Boards
  "esp32-devkit-v1": ["esp32-development-board-esp32-001", "esp32-001", "prg-esp-001", "prg-iot-001"],
  "esp32-development-board-esp32-001": ["esp32-devkit-v1", "esp32-001", "prg-esp-001", "prg-iot-001"],
  "esp32-cam-ov2640": ["esp32-cam-wifi-camera-module", "prg-esp-302", "prg-iot-007", "prg-esp-308"],
  "esp32-cam-wifi-camera-module": ["esp32-cam-ov2640", "prg-esp-302", "prg-iot-007", "prg-esp-308"],

  // Sensors
  "hcsr04-ultrasonic": ["ultrasonic-sensor-hcsr04", "prg-sen-001", "prg-sen-042"],
  "ultrasonic-sensor-hcsr04": ["hcsr04-ultrasonic", "prg-sen-001", "prg-sen-042"],

  // Drones & UAV
  "pixhawk-fc": ["pixhawk-6c-autopilot", "pixhawk-6c-flight-controller", "prg-drn-001", "prg-uav-601"],
  "pixhawk-6c-autopilot": ["pixhawk-fc", "pixhawk-6c-flight-controller", "prg-drn-001", "prg-uav-601"],
  "pixhawk-6c-flight-controller": ["pixhawk-fc", "pixhawk-6c-autopilot", "prg-drn-001", "prg-uav-601"],
  "speedybee-f405-stack": ["prg-drn-005"],

  // Motors & Drivers
  "l298n-motor-driver": ["l298n-dual-hbridge", "l298n-dual-h-bridge-motor-driver", "prg-mot-001", "prg-mot-002", "prg-mot-201"],
  "l298n-dual-hbridge": ["l298n-motor-driver", "l298n-dual-h-bridge-motor-driver", "prg-mot-002", "prg-mot-201"],
  "l298n-dual-h-bridge-motor-driver": ["l298n-motor-driver", "l298n-dual-hbridge", "prg-mot-001"],
  "tt-gear-motor-wheel": ["tt-gear-motor-with-wheel-65mm", "prg-mot-001", "prg-mot-002"],
  "tt-gear-motor-with-wheel-65mm": ["tt-gear-motor-wheel", "prg-mot-001", "prg-mot-002"],
  "nema-17-stepper": ["nema-17-stepper-motor", "nema17-stepper-59ncm", "nema-17-stepper-motor-high-torque", "prg-mot-005", "prg-mot-003"],
  "nema-17-stepper-motor": ["nema-17-stepper", "nema17-stepper-59ncm", "prg-mot-005", "prg-mot-003"],
  "nema17-stepper-59ncm": ["nema-17-stepper", "nema-17-stepper-motor", "prg-mot-005"],
  "nema-17-stepper-motor-high-torque": ["nema-17-stepper", "nema17-stepper-59ncm"],

  // Robotics Chassis & Kits
  "prayog-stem-robot-kit": ["4wd-smart-robot-car-chassis-kit", "4wd-robot-chassis", "prg-rob-001", "prg-kit-101"],
  "4wd-smart-robot-car-chassis-kit": ["prayog-stem-robot-kit", "4wd-robot-chassis", "prg-rob-001", "prg-kit-101"],
  "4wd-robot-chassis": ["prayog-stem-robot-kit", "4wd-smart-robot-car-chassis-kit", "prg-rob-001", "prg-kit-101"],
  "arm-manipulator-6dof": ["prg-rob-003"],
  "mecanum-4wd-car": ["prg-rob-004"],
  "stem-starter-lab-kit": ["prg-stm-001", "stem-starter-kit"],

  // Tools & Fabrication
  "soldering-iron-kit-60w": ["soldering-multimeter-kit", "soldering-iron-kit-temperature-controlled", "prg-tls-001", "prg-tool-001"],
  "soldering-multimeter-kit": ["soldering-iron-kit-60w", "soldering-iron-kit-temperature-controlled", "prg-tls-001", "prg-tool-001"],
  "soldering-iron-kit-temperature-controlled": ["soldering-iron-kit-60w", "soldering-multimeter-kit", "prg-tool-001"],
  "3d-printing-extruder-kit": ["3d-printer-hotend-v6", "all-metal-v6-hotend-extruder", "prg-3dp-001", "prg-tool-002"],
  "3d-printer-hotend-v6": ["3d-printing-extruder-kit", "all-metal-v6-hotend-extruder", "prg-3dp-001", "prg-tool-002"],
  "all-metal-v6-hotend-extruder": ["3d-printing-extruder-kit", "3d-printer-hotend-v6", "prg-3dp-001", "prg-tool-002"],
};

export const POPULAR_FALLBACK_PRODUCTS: Product[] = [
  {
    id: "tt-gear-motor-wheel",
    slug: "tt-gear-motor-wheel",
    name: "TT Dual-Shaft Gear Motor with 65mm Anti-Skid Rubber Wheel",
    sku: "PRG-MOT-001",
    brand: "Prayog India",
    category: "Motors, Steppers & Drivers",
    price: 129,
    mrp: 199,
    discount: "35% OFF",
    rating: 5,
    reviews: 510,
    inStock: true,
    image: "/images/products/tt-gear-motor-wheel.png",
    images: ["/images/products/tt-gear-motor-wheel.png", "/images/categories/motors_robotics.jpg"],
    description: "Reliable 1:48 reduction DC gearbox motor with high-grip rubber robotics tire.",
    features: ["1:48 dual-shaft gear ratio", "High-grip 65mm rubber tire", "Operating range 3V to 6V DC"],
    specs: { Ratio: "1:48", Voltage: "3V - 6V DC", Speed: "200 RPM @ 6V" },
  },
  {
    id: "stem-starter-lab-kit",
    slug: "stem-starter-lab-kit",
    name: "STEM Educational Robotics & Electronics Starter Lab Kit",
    sku: "PRG-STM-001",
    brand: "Prayog STEM",
    category: "STEM & Educational Kits",
    price: 1899,
    mrp: 2699,
    discount: "30% OFF",
    rating: 5,
    reviews: 290,
    inStock: true,
    image: "/images/categories/stem_kits.jpg",
    images: ["/images/categories/stem_kits.jpg", "/images/stem_robot_banner.jpg"],
    description: "Over 45+ components including breadboard, sensors, LEDs, buzzer, and illustrated guidebook.",
    features: ["45+ high quality hardware components", "Step-by-step curriculum with 20 lessons", "Compatible with Arduino & Micro:bit"],
    specs: { Components: "45+ Pieces", Compatibility: "Arduino & Micro:bit", Curriculum: "20 Lessons" },
  },
  {
    id: "soldering-multimeter-kit",
    slug: "soldering-multimeter-kit",
    name: "Electronics Soldering Iron & Digital Multimeter Lab Kit",
    sku: "PRG-TLS-001",
    brand: "ToolCraft",
    category: "Robotics & DIY Kits",
    price: 1299,
    mrp: 1899,
    discount: "32% OFF",
    rating: 5,
    reviews: 175,
    inStock: true,
    image: "/images/categories/tools.jpg",
    images: ["/images/categories/tools.jpg", "/images/categories/components.jpg"],
    description: "60W adjustable temperature soldering iron with digital multimeter, solder wire, and stand.",
    features: ["Fast ceramic heating core", "200°C - 450°C variable temperature dial", "Auto-ranging digital multimeter included"],
    specs: { Power: "60W 110V/220V", Multimeter: "Auto-ranging Digital", Tips: "5x Interchangeable" },
  },
  {
    id: "3d-printing-extruder-kit",
    slug: "3d-printing-extruder-kit",
    name: "3D Rapid Prototyping Dual-Gear Extruder & Hotend Assembly",
    sku: "PRG-3DP-001",
    brand: "Creality Lab",
    category: "Robotics & DIY Kits",
    price: 2199,
    mrp: 2999,
    discount: "27% OFF",
    rating: 5,
    reviews: 64,
    inStock: true,
    image: "/images/categories/3d_printing.jpg",
    images: ["/images/categories/3d_printing.jpg", "/images/categories/tools.jpg"],
    description: "All-metal direct drive dual gear extruder assembly with titanium heatbreak for 3D printers.",
    features: ["Hardened steel dual drive gears", "All-metal heatbreak up to 300°C", "Precise TPU, PLA & PETG filament feeding"],
    specs: { Filament: "1.75mm PLA/PETG/ABS", MaxTemp: "300°C", Gear: "Dual Hardened Steel" },
  },
  {
    id: "l298n-motor-driver",
    slug: "l298n-motor-driver",
    name: "L298N Dual H-Bridge DC Stepper Motor Driver Module",
    sku: "PRG-MOT-002",
    brand: "Prayog India",
    category: "Motors, Steppers & Drivers",
    price: 189,
    mrp: 299,
    discount: "37% OFF",
    rating: 5,
    reviews: 260,
    inStock: true,
    image: "/images/products/l298n-motor-driver.jpg",
    images: ["/images/products/l298n-motor-driver.jpg", "/images/categories/motors_robotics.jpg"],
    description: "High-power motor driver capable of driving 2 DC motors or 1 bipolar stepper motor.",
    features: ["Dual H-bridge control with PWM speed adjustment", "Built-in 78M05 5V regulator", "Over-temperature protection"],
    specs: { Chip: "L298N", "Peak Current": "2A per bridge", "Supply Voltage": "5V - 35V" },
  },
  {
    id: "nema-17-stepper",
    slug: "nema-17-stepper",
    name: "NEMA 17 High-Torque 1.8° Bipolar Hybrid Stepper Motor",
    sku: "PRG-MOT-005",
    brand: "MotionTech",
    category: "Motors, Steppers & Drivers",
    price: 799,
    mrp: 1199,
    discount: "33% OFF",
    rating: 5,
    reviews: 140,
    inStock: true,
    image: "/images/categories/stepper_motor.jpg",
    images: ["/images/categories/stepper_motor.jpg", "/images/categories/3d_printing.jpg"],
    description: "Precision 42mm stepper motor with 45N.cm holding torque for 3D printers and CNC machines.",
    features: ["1.8° precision step angle (200 steps/rev)", "High holding torque of 45 N.cm", "Low vibration and silent operation"],
    specs: { "Step Angle": "1.8 deg", "Holding Torque": "45 N.cm", Current: "1.5A/phase" },
  },
];

/**
 * Returns candidate identifier strings (slugs, ids, SKUs, and known aliases)
 * for looking up a product in the database or mock array.
 */
export function getCandidateSlugs(rawSlug: string): string[] {
  const decodedSlug = decodeURIComponent(rawSlug || "").trim();
  const slugLower = decodedSlug.toLowerCase();
  const normalized = slugLower.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const candidates = new Set<string>();
  if (decodedSlug) candidates.add(decodedSlug);
  if (slugLower) candidates.add(slugLower);
  if (normalized) candidates.add(normalized);

  // Check aliases dictionary
  for (const [key, aliases] of Object.entries(SLUG_ALIASES)) {
    const keyLower = key.toLowerCase();
    const allGroup = [keyLower, ...aliases.map((a) => a.toLowerCase())];

    if (
      keyLower === slugLower ||
      keyLower === normalized ||
      aliases.some((a) => a.toLowerCase() === slugLower || a.toLowerCase() === normalized)
    ) {
      allGroup.forEach((item) => candidates.add(item));
    }
  }

  return Array.from(candidates);
}

/**
 * Resolves a product from mock data using candidate slugs and fuzzy matching.
 */
export function findMockProduct(rawSlug: string): Product | null {
  const candidates = getCandidateSlugs(rawSlug);
  const slugLower = decodeURIComponent(rawSlug || "").trim().toLowerCase();
  const allProducts = [...PRODUCTS, ...POPULAR_FALLBACK_PRODUCTS];

  // 1. Direct candidate match on slug, id, or sku
  for (const candidate of candidates) {
    const match = allProducts.find(
      (p) =>
        (p.slug && p.slug.toLowerCase() === candidate) ||
        p.id.toLowerCase() === candidate ||
        (p.sku && p.sku.toLowerCase() === candidate)
    );
    if (match) return match;
  }

  // 2. Normalized name match
  for (const candidate of candidates) {
    const match = allProducts.find((p) => {
      const normName = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      return normName === candidate || p.name.toLowerCase() === candidate;
    });
    if (match) return match;
  }

  // 3. Partial substring match for common prefixes (e.g. "raspberry-pi-5" -> "rpi-5-8gb")
  const partial = allProducts.find((p) => {
    const pSlug = (p.slug || "").toLowerCase();
    const pId = p.id.toLowerCase();
    return (
      (pSlug && (slugLower.includes(pSlug) || pSlug.includes(slugLower))) ||
      slugLower.includes(pId) ||
      pId.includes(slugLower)
    );
  });

  return partial || null;
}
