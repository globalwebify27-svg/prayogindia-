export interface Subcategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface CategoryData {
  id: string;
  slug: string;
  slugAlias?: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  productCount: number;
  featured?: boolean;
  subcategories: Subcategory[];
}

export const CATEGORIES_DATA: CategoryData[] = [
  {
    id: 'cat-robotics',
    slug: 'robotics',
    name: 'Robotics',
    shortDescription: 'Build, learn and explore autonomous robotics, arms & chassis.',
    fullDescription: 'Comprehensive range of robotics hardware, 6-DOF manipulator arms, ROS 2 mobility platforms, metal chassis, servos, and industrial actuators.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    productCount: 2450,
    featured: true,
    subcategories: [
      { id: 'sub-robotics-kits', slug: 'robotics-kits', name: 'Robotics Kits', description: 'Complete hands-on STEM & ROS robotics kits with tutorials.', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80', productCount: 420 },
      { id: 'sub-robot-parts', slug: 'robot-parts', name: 'Robot Parts & Chassis', description: 'Metal frames, omni wheels, TT motors & structural brackets.', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80', productCount: 680 },
      { id: 'sub-motors-actuators', slug: 'motors-actuators', name: 'Motors & Actuators', description: 'High torque stepper motors, MG996R servos & planetary gearboxes.', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80', productCount: 850 },
      { id: 'sub-robot-controllers', slug: 'controllers', name: 'Controllers & Motor Drivers', description: 'L298N, PCA9685 16-channel servo drivers & motor shields.', image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80', productCount: 500 },
    ]
  },
  {
    id: 'cat-arduino-devboards',
    slug: 'arduino-development-boards',
    name: 'Arduino & Development Boards',
    slugAlias: 'arduino',
    shortDescription: 'Official microcontrollers, ESP32 dual-core & Raspberry Pi.',
    fullDescription: 'Official microcontrollers and dev boards including Arduino UNO R3, Mega 2560, Nano Type-C, ESP32 Wi-Fi + BLE, and Raspberry Pi 5 8GB single board computers.',
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80',
    productCount: 1820,
    featured: true,
    subcategories: [
      { id: 'sub-arduino-boards', slug: 'arduino-boards', name: 'Arduino Boards', description: 'Official UNO R3, Mega 2560, Nano & Leonardo microcontrollers.', image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80', productCount: 650 },
      { id: 'sub-esp32-esp8266', slug: 'esp32-esp8266', name: 'ESP32 & ESP8266', description: 'Dual-core Wi-Fi + BLE 4.2 modules for IoT automation.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', productCount: 540 },
      { id: 'sub-raspberry-pi', slug: 'raspberry-pi', name: 'Raspberry Pi & SBCs', description: 'Raspberry Pi 5 8GB, Pi 4 4GB, and NVIDIA Jetson Orin Nano AI.', image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80', productCount: 380 },
      { id: 'sub-microcontrollers', slug: 'microcontrollers', name: 'STM32 & Microcontrollers', description: 'STM32 Blue Pill ARM Cortex-M3 and PIC microcontrollers.', image: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80', productCount: 250 },
    ]
  },
  {
    id: 'cat-sensors-modules',
    slug: 'sensors-modules',
    name: 'Sensors & Modules',
    shortDescription: 'Precision LiDAR, ultrasonic distance, IMU gyro & gas sensors.',
    fullDescription: 'High precision electronic sensor modules for robotics, drone telemetry, environmental monitoring, and biometric security systems.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    productCount: 1450,
    subcategories: [
      { id: 'sub-distance-sensors', slug: 'distance-ranging', name: 'Distance & LiDAR', description: 'HC-SR04 ultrasonic, TF-Luna LiDAR & ToF laser sensors.', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', productCount: 320 },
      { id: 'sub-imu-motion', slug: 'imu-motion-sensors', name: 'IMU & Motion Tracking', description: 'MPU6050 6-DOF gyro, BNO055 9-DOF orientation sensors.', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', productCount: 280 },
      { id: 'sub-temp-environment', slug: 'environmental-sensors', name: 'Temperature & Humidity', description: 'DHT11, DHT22, BME280 barometric pressure sensors.', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', productCount: 450 },
      { id: 'sub-biometric-vision', slug: 'biometric-vision', name: 'Camera & Biometric', description: 'ESP32-CAM optical sensors and R307 fingerprint scanners.', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', productCount: 400 },
    ]
  },
  {
    id: 'cat-drone-tech',
    slug: 'drone-technology',
    name: 'Drone Technology',
    shortDescription: 'Flight controllers, ESCs, BLDC motors, FPV & frames.',
    fullDescription: 'Professional UAV hardware for aerial mapping, racing drones, and payload delivery. Featuring Pixhawk 6C autopilots, SimonK ESCs, and carbon fiber frames.',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
    productCount: 950,
    featured: true,
    subcategories: [
      { id: 'sub-flight-controllers', slug: 'flight-controllers', name: 'Flight Controllers', description: 'Pixhawk 6C, ArduPilot, Betaflight F4/F7 flight boards.', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80', productCount: 180 },
      { id: 'sub-bldc-motors', slug: 'motors', name: 'Drone Motors & Props', description: 'A2212 1000KV BLDC outrunners and 1045 carbon propellers.', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80', productCount: 310 },
      { id: 'sub-esc-speed', slug: 'esc', name: 'ESC Speed Controllers', description: '30A SimonK and BLHeli_S 4-in-1 electronic speed controls.', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80', productCount: 220 },
      { id: 'sub-gps-telemetry', slug: 'gps-modules', name: 'GPS Modules & Telemetry', description: 'NEO-M8N MavLink 2.0 dual GPS and 915MHz telemetry radios.', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80', productCount: 240 },
    ]
  },
  {
    id: 'cat-stem-kits',
    slug: 'stem-kits',
    name: 'STEM Kits',
    shortDescription: 'Hands-on educational coding & science kits for schools & DIY.',
    fullDescription: 'ATL-compliant educational STEM kits designed for school innovation labs, DIY student projects, and hands-on robotics workshops.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    productCount: 650,
    subcategories: [
      { id: 'sub-school-stem', slug: 'school-stem-kits', name: 'School STEM Kits', description: 'ATL tinkering lab kits for physics, robotics, and coding.', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80', productCount: 210 },
      { id: 'sub-science-kits', slug: 'science-kits', name: 'Science & Physics Kits', description: 'Solar energy, hydraulic arms, and magnetic levitation kits.', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80', productCount: 190 },
      { id: 'sub-diy-electronics', slug: 'electronics-kits', name: 'DIY Electronics Kits', description: 'Starter breadboard learning kits with resistor/LED sets.', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80', productCount: 250 },
    ]
  },
  {
    id: 'cat-iot-products',
    slug: 'iot',
    name: 'IoT & Wireless',
    shortDescription: 'LoRaWAN modules, Bluetooth transceivers, relays & gateways.',
    fullDescription: 'Wireless communication hardware including Ra-02 LoRa 433MHz modules, HC-05 Bluetooth transceivers, NRF24L01+, and industrial IoT relays.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    productCount: 3100,
    subcategories: [
      { id: 'sub-lora-modules', slug: 'lora-modules', name: 'LoRa & Long Range', description: 'Ra-02 SX1278 433MHz transceivers for smart agriculture.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', productCount: 800 },
      { id: 'sub-bluetooth-rf', slug: 'bluetooth-rf', name: 'Bluetooth & RF', description: 'HC-05 serial Bluetooth master/slave and NRF24L01+ modules.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', productCount: 1100 },
      { id: 'sub-relays-switches', slug: 'relays-switches', name: 'Relays & Gateways', description: 'Optocoupler isolated 5V/12V relay modules and IoT gateways.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', productCount: 1200 },
    ]
  },
  {
    id: 'cat-electronic-components',
    slug: 'electronic-components',
    name: 'Electronic Components',
    shortDescription: 'Passive components, ICs, connectors, jumper wires & cables.',
    fullDescription: 'Official electronic passives, IC chips, breadboard jumper wires, Dupont connectors, LiPo batteries, and power supply modules.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    productCount: 5000,
    subcategories: [
      { id: 'sub-connectors-cables', slug: 'connectors-wires', name: 'Wires & Connectors', description: 'Male-to-female jumper wires, JST connectors, and XT60 plugs.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', productCount: 1800 },
      { id: 'sub-batteries-power', slug: 'batteries-power', name: 'Batteries & Power', description: '18650 Li-ion cells, 3S/4S LiPo battery packs, and buck converters.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', productCount: 1700 },
      { id: 'sub-ics-passives', slug: 'ics-passives', name: 'ICs & Passives', description: '555 timers, NE555, resistors, capacitors, and transistor ICs.', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', productCount: 1500 },
    ]
  }
];

export const COLLECTION_ECOSYSTEMS = [
  {
    id: 'eco-robotics',
    title: 'Robotics & Manipulators Ecosystem',
    description: 'Explore 6-DOF robotic arm manipulators, SLAM LiDAR rovers, and metal gear servos built for research labs.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80',
    categorySlug: 'robotics',
    tag: 'INDUSTRIAL SPEC'
  },
  {
    id: 'eco-arduino',
    title: 'Arduino & Microcontroller Platform',
    description: 'Official ATmega328P UNO boards, ESP32 dual-core Wi-Fi, and Raspberry Pi 5 single board computers.',
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1000&q=80',
    categorySlug: 'arduino-development-boards',
    tag: 'DEVELOPER SPEC'
  },
  {
    id: 'eco-drones',
    title: 'UAV Aerial Drone Hardware',
    description: 'Pixhawk 6C autopilots, SimonK 30A ESC speed controls, BLDC motors, and MavLink 2.0 telemetry radios.',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80',
    categorySlug: 'drone-technology',
    tag: 'AERIAL SPEC'
  }
];
