export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  mrp: number;
  discount: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  image: string;
  badge?: string;
  description: string;
  specs: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  count: string;
  description: string;
  image: string;
  iconName: string;
}

export interface Solution {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  highlights: string[];
}

export interface Industry {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface LearningItem {
  id: string;
  category: 'Tutorials' | 'Projects' | 'Courses' | 'Workshops' | 'Certifications';
  title: string;
  level: string;
  duration: string;
  description: string;
  image: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'robotics',
    name: 'Robotics & DIY Kits',
    count: '2,400+ Products',
    description: 'Humanoid arms, robotic chassis, servos, manipulators & industrial kits.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    iconName: 'Bot',
  },
  {
    id: 'arduino',
    name: 'Arduino & Microcontrollers',
    count: '1,800+ Products',
    description: 'UNO, Mega, Nano, ESP8266, ESP32, and official expansion shields.',
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80',
    iconName: 'Cpu',
  },
  {
    id: 'drones',
    name: 'Drones & UAV Parts',
    count: '950+ Products',
    description: 'Flight controllers, ESCs, BLDC motors, FPV gear & carbon fiber frames.',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
    iconName: 'Plane',
  },
  {
    id: 'iot',
    name: 'IoT & Wireless Modules',
    count: '3,100+ Products',
    description: 'LoRaWAN modules, wireless gateways, relays, displays & power units.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    iconName: 'Wifi',
  },
  {
    id: 'stem',
    name: 'STEM & Educational Kits',
    count: '650+ Kits',
    description: 'Hands-on learning science & coding lab kits tailored for schools & DIY.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    iconName: 'GraduationCap',
  },
  {
    id: 'sensors',
    name: 'Sensors & Electronic Modules',
    count: '1,450+ Sensors',
    description: 'LiDAR, Ultrasonic, IMU 9-DOF, Gas, Biometric & Vision cameras.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    iconName: 'Activity',
  },
  {
    id: 'motors',
    name: 'Motors, Steppers & Drivers',
    count: '1,100+ Drives',
    description: 'High torque stepper motors, BLDC, planetary gearheads & motor drivers.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    iconName: 'Zap',
  },
  {
    id: 'devboards',
    name: 'Single Board Computers & Dev Boards',
    count: '820+ Boards',
    description: 'Raspberry Pi 5, Jetson Orin Nano, STM32 Nucleo & FPGA boards.',
    image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80',
    iconName: 'CircuitBoard',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'ard-uno-r3',
    name: 'Arduino UNO R3 Official Rev3 Board (ATmega328P)',
    sku: 'PRG-ARD-001',
    category: 'Arduino & Microcontrollers',
    price: 1499,
    mrp: 1999,
    discount: '25% OFF',
    rating: 4.9,
    reviews: 342,
    inStock: true,
    badge: 'BESTSELLER',
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80',
    description: 'The standard microcontroller board for robotics and IoT projects. Powered by ATmega328P with 14 digital I/O pins.',
    specs: { Microcontroller: 'ATmega328P', 'Operating Voltage': '5V', 'Digital I/O': '14', 'PWM Channels': '6' }
  },
  {
    id: 'esp32-wroom',
    name: 'ESP32 Dual-Core WiFi + Bluetooth Dev Board',
    sku: 'PRG-ESP-302',
    category: 'IoT & Wireless Modules',
    price: 549,
    mrp: 799,
    discount: '31% OFF',
    rating: 4.8,
    reviews: 518,
    inStock: true,
    badge: 'HOT DEAL',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    description: 'Powerful 240MHz dual-core microcontroller with integrated 2.4GHz Wi-Fi and BLE 4.2 for smart IoT applications.',
    specs: { Clock: '240 MHz', Wireless: 'Wi-Fi 802.11 b/g/n + BLE', Flash: '4MB', Pinout: '38 Pins' }
  },
  {
    id: 'rpi-5-8gb',
    name: 'Raspberry Pi 5 Model B (8GB RAM ARM Cortex-A76)',
    sku: 'PRG-RPI-508',
    category: 'Single Board Computers & Dev Boards',
    price: 8999,
    mrp: 10499,
    discount: '14% OFF',
    rating: 5.0,
    reviews: 189,
    inStock: true,
    badge: 'NEW GENERATION',
    image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80',
    description: 'Next-gen single board computer delivering up to 3x performance with 2.4GHz quad-core 64-bit Arm Cortex-A76 CPU.',
    specs: { RAM: '8GB LPDDR4X', CPU: 'Quad-Core 2.4GHz', Display: 'Dual 4K60 HDMI', PCI: 'PCIe 2.0 interface' }
  },
  {
    id: 'pixhawk-fc',
    name: 'Pixhawk 6C Autopilot Flight Controller Unit',
    sku: 'PRG-UAV-601',
    category: 'Drones & UAV Parts',
    price: 14500,
    mrp: 18000,
    discount: '19% OFF',
    rating: 4.9,
    reviews: 84,
    inStock: true,
    badge: 'PRO SPEC',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
    description: 'Advanced autopilot hardware standard for autonomous multirotors, fixed-wing aircraft and rover robotics.',
    specs: { Processor: 'STM32H743', IMU: 'Triple redundant', Protocol: 'MavLink 2.0', GNSS: 'Dual GPS Support' }
  },
  {
    id: 'hcsr04-ultrasonic',
    name: 'HC-SR04 Precision Ultrasonic Distance Sensor',
    sku: 'PRG-SEN-042',
    category: 'Sensors & Electronic Modules',
    price: 120,
    mrp: 199,
    discount: '39% OFF',
    rating: 4.7,
    reviews: 1240,
    inStock: true,
    badge: 'TOP RATED',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'Non-contact distance measurement module providing 2cm to 400cm ranging accuracy up to 3mm.',
    specs: { Range: '2cm - 400cm', Angle: '15 degrees', Voltage: '5V DC', Frequency: '40kHz' }
  },
  {
    id: 'prayog-stem-robot-kit',
    name: 'PRAYOG Dilay-Bot 4WD Autonomous Robotics Learning Kit',
    sku: 'PRG-KIT-100',
    category: 'Robotics & DIY Kits',
    price: 4999,
    mrp: 6999,
    discount: '28% OFF',
    rating: 5.0,
    reviews: 215,
    inStock: true,
    badge: 'FLAGSHIP KIT',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    description: 'Complete hands-on robotics kit including metal chassis, ultrasonic line follower, Bluetooth app control & code tutorials.',
    specs: { Motors: '4x Metal Gear TT Motors', Control: 'Arduino Compatible', Battery: 'Rechargeable 18650', App: 'Android & iOS' }
  }
];

export const SOLUTIONS: Solution[] = [
  {
    id: 'industrial-robotics',
    title: 'Industrial Robotics Automation',
    category: 'Automation & Manufacturing',
    description: 'Collaborative robotic arms, AGVs, and custom end-effectors designed for high-precision manufacturing.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    highlights: ['6-Axis Manipulators', 'Safety Torque Sensors', 'PLC & ROS Integration']
  },
  {
    id: 'educational-robotics',
    title: 'Turnkey Educational STEM Labs',
    category: 'STEM & Institutional',
    description: 'Turnkey robotics lab setups for schools, colleges, and polytechnics with complete curriculum manuals.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    highlights: ['Curriculum Aligned', 'Teacher Training Included', 'Multi-level DIY Hardware']
  },
  {
    id: 'drone-technology',
    title: 'UAV Aerial Surveillance & Mapping',
    category: 'Aerial Systems',
    description: 'Custom UAV platforms for agricultural mapping, surveillance, payload delivery, and aerial inspection.',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    highlights: ['Autonomous Waypoint Navigation', 'Thermal/RGB Gimbal Payload', 'DGCA Compliant Frames']
  },
  {
    id: 'ai-vision-systems',
    title: 'Edge AI Machine Vision Systems',
    category: 'Intelligent Edge',
    description: 'Embedded edge AI vision solutions powered by NVIDIA Jetson for real-time quality check & object detection.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    highlights: ['Deep Learning Models', '4K Stereo Vision', 'Sub-10ms Inference Latency']
  }
];

export const INDUSTRIES: Industry[] = [
  { id: 'edu', title: 'Education & STEM Academics', description: 'Empowering 500+ STEM labs and university research departments.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80' },
  { id: 'mfg', title: 'Smart Factory Manufacturing', description: 'Smart factory automation and custom robotic arm integrations.', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80' },
  { id: 'rd', title: 'Research & Defense Labs', description: 'Prototyping boards and precision sensors for defense & tech labs.', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80' },
  { id: 'def', title: 'Defense & Tactical Drone UAV', description: 'Ruggedized electronics, flight telemetry, and tactical drone components.', image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80' },
  { id: 'agri', title: 'Smart Agriculture & Soil IoT', description: 'IoT soil monitoring sensors and automated agricultural drones.', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80' },
  { id: 'auto', title: 'Industrial Mechatronics', description: 'Motor controllers, encoders, and pneumatic automation valves.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
  { id: 'health', title: 'Healthcare & Surgical Robotics', description: 'Precision actuators and bio-sensing modules for medical tech.', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80' },
  { id: 'train', title: 'Industrial Skill Certification', description: 'Vocational skill development kits for mechatronics & robotics certification.', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80' },
];

export const LEARNING_HUB: LearningItem[] = [
  {
    id: 'tut-1',
    category: 'Tutorials',
    title: 'Getting Started with ESP32 & FreeRTOS for IoT',
    level: 'Beginner to Intermediate',
    duration: '45 mins read',
    description: 'Learn step-by-step how to configure multi-tasking routines on dual-core ESP32 boards.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'proj-1',
    category: 'Projects',
    title: 'Building an Autonomous Obstacle Avoidance Rover',
    level: 'Intermediate',
    duration: '2 Hours build',
    description: 'Complete circuit schematics, chassis assembly guide, and Arduino C++ source code.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'course-1',
    category: 'Courses',
    title: 'ROS 2 (Robot Operating System) Masterclass',
    level: 'Advanced',
    duration: '12 Modules',
    description: 'Master publisher/subscriber nodes, TF2 transforms, and Nav2 navigation stacks.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ws-1',
    category: 'Workshops',
    title: 'Hands-on Quadcopter Flight Dynamics & PID Tuning',
    level: 'Intermediate',
    duration: 'Live Weekend',
    description: 'Interactive workshop with Dilay Robotics engineers covering flight telemetry and safety tuning.',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80'
  }
];

export const TESTIMONIALS = [
  {
    id: '1',
    name: 'Dr. Rajesh Vardhan',
    role: 'Head of Robotics Lab',
    institution: 'IIT Delhi',
    rating: 5,
    comment: 'Prayog India delivers authentic microcontrollers and sensors with unmatched quality and speedy delivery. Their technical documentation for research labs is top notch.',
    product: 'Raspberry Pi 5 & Jetson Orin'
  },
  {
    id: '2',
    name: 'Ananya Sharma',
    role: 'Lead Systems Engineer',
    institution: 'AeroTech Dynamics',
    rating: 5,
    comment: 'The Pixhawk flight controllers and BLDC drone motors supplied for our autonomous surveillance drone fleet exceeded our durability requirements under field tests.',
    product: 'Pixhawk 6C & Drone Motors'
  },
  {
    id: '3',
    name: 'Vikram Singh',
    role: 'STEM Educator & Director',
    institution: 'Innovate Academy',
    rating: 5,
    comment: 'We equipped 12 school robotics labs using Prayog India Dilay-Bot kits. Students love the clear tutorials and hands-on assembly modules!',
    product: 'Dilay-Bot 4WD STEM Kits'
  }
];
