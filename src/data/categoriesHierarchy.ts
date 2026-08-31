// Section 7: Multi-Level Category System
// Full 16-domain hardware catalogue hierarchy with SEO, banners, and dynamic filter definitions

export interface CategoryFilterOption {
  label: string;
  values: string[];
}

export interface CategoryDynamicFilters {
  voltage?: string[];
  current?: string[];
  rpmKv?: string[];
  compatibility?: string[];
  material?: string[];
  application?: string[];
  interface?: string[];
  outputType?: string[];
  chemistry?: string[];
  capacity?: string[];
  cRating?: string[];
  dof?: string[];
  connectivity?: string[];
  frequency?: string[];
  resolution?: string[];
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: 0 | 1 | 2; // 0 = parent, 1 = subcategory, 2 = nested
  description: string;
  seoTitle: string;
  seoDescription: string;
  bannerUrl: string;
  iconName: string;
  productCount: number;
  sortOrder: number;
  dynamicFilters?: CategoryDynamicFilters;
  children?: CategoryNode[];
}

// =====================================================================
// CATEGORY HIERARCHY TREE
// =====================================================================

export const CATEGORIES_HIERARCHY: CategoryNode[] = [
  // ============================================================
  // 1. ARDUINO & MICROCONTROLLERS
  // ============================================================
  {
    id: 'arduino',
    name: 'Arduino & Microcontrollers',
    slug: 'arduino-microcontrollers',
    parentId: null,
    level: 0,
    description: 'Official Arduino boards, ESP32/ESP8266, STM32, AVR microcontrollers, and compatible development platforms for all skill levels.',
    seoTitle: 'Arduino Boards & Microcontrollers | Buy Official Arduino UNO, Mega, Nano in India',
    seoDescription: 'Shop genuine Arduino UNO R3, R4 WiFi, Mega 2560, Nano, ESP32, ESP8266, STM32 Blue Pill, and more. Bulk pricing for schools and labs.',
    bannerUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Cpu',
    productCount: 1800,
    sortOrder: 1,
    dynamicFilters: {
      voltage: ['3.3V', '5V', '7-12V Input'],
      compatibility: ['Arduino IDE', 'PlatformIO', 'MicroPython', 'CircuitPython'],
      connectivity: ['USB-C', 'USB-B', 'USB-Micro', 'Wi-Fi', 'Bluetooth'],
      application: ['Robotics', 'IoT Projects', 'STEM Education', 'Industrial Automation'],
    },
    children: [
      { id: 'arduino-boards', name: 'Arduino Boards', slug: 'arduino-boards', parentId: 'arduino', level: 1, description: 'Official Arduino UNO, Mega, Leonardo, Nano, and Nano Every boards.', seoTitle: 'Buy Arduino Boards', seoDescription: '', bannerUrl: '', iconName: 'CircuitBoard', productCount: 650, sortOrder: 1 },
      { id: 'esp32-esp8266', name: 'ESP32 / ESP8266 Modules', slug: 'esp32-esp8266-modules', parentId: 'arduino', level: 1, description: 'Wi-Fi and Bluetooth enabled MCU modules for IoT and edge computing.', seoTitle: 'ESP32 & ESP8266 Boards', seoDescription: '', bannerUrl: '', iconName: 'Wifi', productCount: 420, sortOrder: 2 },
      { id: 'stm32-arm', name: 'STM32 / ARM Cortex Boards', slug: 'stm32-arm-cortex', parentId: 'arduino', level: 1, description: 'High-performance STM32 Blue Pill, Nucleo, and Discovery boards.', seoTitle: 'STM32 & ARM Boards', seoDescription: '', bannerUrl: '', iconName: 'Zap', productCount: 280, sortOrder: 3 },
      { id: 'avr-pic', name: 'AVR / PIC Microcontrollers', slug: 'avr-pic-microcontrollers', parentId: 'arduino', level: 1, description: 'ATmega328P, ATtiny, PIC16, PIC32 standalone ICs and programmer kits.', seoTitle: 'AVR & PIC MCUs', seoDescription: '', bannerUrl: '', iconName: 'Chip', productCount: 450, sortOrder: 4 },
    ],
  },

  // ============================================================
  // 2. RASPBERRY PI
  // ============================================================
  {
    id: 'raspberry-pi',
    name: 'Raspberry Pi',
    slug: 'raspberry-pi',
    parentId: null,
    level: 0,
    description: 'Official Raspberry Pi single-board computers, HATs, accessories, and starter kits for Linux computing, AI, and IoT applications.',
    seoTitle: 'Raspberry Pi 5, 4B, CM4, Pico | Official Distributor India – Prayog India',
    seoDescription: 'Buy Raspberry Pi 5 8GB, 4 Model B, Compute Module 4, Pi Pico W, and complete starter kits with power supply and SD card. Authorized India distributor.',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    iconName: 'CircuitBoard',
    productCount: 820,
    sortOrder: 2,
    dynamicFilters: {
      voltage: ['5V USB-C', '5V USB-Micro'],
      compatibility: ['Raspberry Pi OS', 'Ubuntu', 'Python', 'Node.js'],
      application: ['AI Edge', 'Computer Vision', 'Media Center', 'STEM Education', 'Home Automation'],
    },
    children: [
      { id: 'rpi-sbc', name: 'Single Board Computers', slug: 'raspberry-pi-sbc', parentId: 'raspberry-pi', level: 1, description: 'Raspberry Pi 5, Pi 4 Model B, Pi 3, and Zero 2W boards.', seoTitle: 'Raspberry Pi SBCs', seoDescription: '', bannerUrl: '', iconName: 'Server', productCount: 200, sortOrder: 1 },
      { id: 'rpi-hats', name: 'HATs & Expansion Boards', slug: 'raspberry-pi-hats', parentId: 'raspberry-pi', level: 1, description: 'Display HATs, Sense HAT, motor controller HATs, and UPS HATs.', seoTitle: 'Raspberry Pi HATs', seoDescription: '', bannerUrl: '', iconName: 'Layers', productCount: 180, sortOrder: 2 },
      { id: 'rpi-pico', name: 'Raspberry Pi Pico & RP2040', slug: 'raspberry-pi-pico-rp2040', parentId: 'raspberry-pi', level: 1, description: 'Pico, Pico W, and RP2040-based microcontroller boards.', seoTitle: 'Raspberry Pi Pico', seoDescription: '', bannerUrl: '', iconName: 'Cpu', productCount: 190, sortOrder: 3 },
      { id: 'rpi-accessories', name: 'Accessories & Power', slug: 'raspberry-pi-accessories', parentId: 'raspberry-pi', level: 1, description: 'Official cases, power supplies, microSD cards, and cooling fans.', seoTitle: 'Raspberry Pi Accessories', seoDescription: '', bannerUrl: '', iconName: 'Package', productCount: 250, sortOrder: 4 },
    ],
  },

  // ============================================================
  // 3. DEVELOPMENT BOARDS
  // ============================================================
  {
    id: 'dev-boards',
    name: 'Development Boards',
    slug: 'development-boards',
    parentId: null,
    level: 0,
    description: 'NVIDIA Jetson Orin, BeagleBone, STM32 Nucleo, FPGA Xilinx, and industrial SBCs for AI edge computing and embedded applications.',
    seoTitle: 'Development Boards | NVIDIA Jetson, BeagleBone, FPGA, STM32 Nucleo – India',
    seoDescription: 'Shop NVIDIA Jetson Orin Nano, AGX Orin, BeagleBone Black, Xilinx FPGA Artix, STM32 Discovery boards at competitive prices.',
    bannerUrl: 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Server',
    productCount: 820,
    sortOrder: 3,
    dynamicFilters: {
      compatibility: ['ROS 2', 'CUDA', 'TensorFlow Lite', 'OpenCV', 'Ubuntu', 'RTOS'],
      application: ['Computer Vision', 'Edge AI', 'Robotics', 'SLAM Navigation', 'Industrial HMI'],
      connectivity: ['HDMI', 'USB 3.0', 'PCIe', 'Gigabit Ethernet', 'CSI Camera'],
    },
    children: [
      { id: 'jetson-boards', name: 'NVIDIA Jetson Series', slug: 'nvidia-jetson-boards', parentId: 'dev-boards', level: 1, description: 'Jetson Nano, Jetson Orin Nano, AGX Xavier, and AGX Orin for edge AI inference.', seoTitle: 'NVIDIA Jetson Boards India', seoDescription: '', bannerUrl: '', iconName: 'Sparkles', productCount: 120, sortOrder: 1 },
      { id: 'fpga-boards', name: 'FPGA Boards', slug: 'fpga-development-boards', parentId: 'dev-boards', level: 1, description: 'Xilinx Artix-7, Zynq-7000, Intel Cyclone V FPGA development kits.', seoTitle: 'FPGA Boards India', seoDescription: '', bannerUrl: '', iconName: 'Circuit', productCount: 80, sortOrder: 2 },
      { id: 'industrial-sbcs', name: 'Industrial SBCs & Carrier Boards', slug: 'industrial-sbcs-carrier-boards', parentId: 'dev-boards', level: 1, description: 'Compact industrial SBCs with wide temperature range and fanless cooling.', seoTitle: 'Industrial SBCs India', seoDescription: '', bannerUrl: '', iconName: 'Boxes', productCount: 90, sortOrder: 3 },
      { id: 'compute-modules', name: 'Compute Modules & SoMs', slug: 'compute-modules-soms', parentId: 'dev-boards', level: 1, description: 'Raspberry Pi Compute Module 4, Jetson NX module, and Qualcomm RB3 SoMs.', seoTitle: 'Compute Modules India', seoDescription: '', bannerUrl: '', iconName: 'Cpu', productCount: 95, sortOrder: 4 },
    ],
  },

  // ============================================================
  // 4. SENSORS & ELECTRONIC MODULES
  // ============================================================
  {
    id: 'sensors',
    name: 'Sensors & Electronic Modules',
    slug: 'sensors-electronic-modules',
    parentId: null,
    level: 0,
    description: 'LiDAR, ultrasonic, IMU 9-DOF, temperature, gas detection, biometric, vision, and environmental sensors for robotics and automation.',
    seoTitle: 'Buy Sensors & Modules India | LiDAR, IMU, Ultrasonic, Gas, Temperature Sensors',
    seoDescription: 'Extensive range of sensors for robotics, IoT, and industrial automation: RPLiDAR, MPU6050, HC-SR04, DHT22, MQ-series gas sensors, and more.',
    bannerUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Activity',
    productCount: 1450,
    sortOrder: 4,
    dynamicFilters: {
      voltage: ['3.3V', '5V', '12V'],
      interface: ['I2C', 'SPI', 'UART', 'Analog', 'PWM', 'GPIO'],
      outputType: ['Digital', 'Analog', 'I2C', 'UART'],
      application: ['Obstacle Detection', 'Navigation', 'Environmental Monitoring', 'Safety & Security', 'Health Monitoring'],
    },
    children: [
      { id: 'lidar-distance', name: 'LiDAR & Distance Sensors', slug: 'lidar-distance-sensors', parentId: 'sensors', level: 1, description: 'RPLiDAR A1/A3, TF-Luna ToF, HC-SR04 ultrasonic and laser range finders.', seoTitle: 'LiDAR & Distance Sensors', seoDescription: '', bannerUrl: '', iconName: 'ScanLine', productCount: 95, sortOrder: 1 },
      { id: 'imu-motion', name: 'IMU & Motion Sensors', slug: 'imu-motion-sensors', parentId: 'sensors', level: 1, description: 'MPU6050, MPU9250, BNO055, BMI160 6-DOF and 9-DOF IMU sensor modules.', seoTitle: 'IMU Motion Sensors India', seoDescription: '', bannerUrl: '', iconName: 'Compass', productCount: 180, sortOrder: 2 },
      { id: 'gas-environment', name: 'Gas & Environmental Sensors', slug: 'gas-environmental-sensors', parentId: 'sensors', level: 1, description: 'MQ-2 Smoke, MQ-135 Air Quality, DHT11/22, BME280 temperature & humidity sensors.', seoTitle: 'Gas & Environmental Sensors India', seoDescription: '', bannerUrl: '', iconName: 'Wind', productCount: 220, sortOrder: 3 },
      { id: 'vision-camera', name: 'Vision & Camera Modules', slug: 'vision-camera-modules', parentId: 'sensors', level: 1, description: 'Pi Camera v3, Intel RealSense Depth, OV7670, ESP32-CAM vision modules.', seoTitle: 'Vision Camera Modules India', seoDescription: '', bannerUrl: '', iconName: 'Camera', productCount: 140, sortOrder: 4 },
      { id: 'color-optical', name: 'Color & Optical Sensors', slug: 'color-optical-sensors', parentId: 'sensors', level: 1, description: 'TCS3200 color, APDS9960 gesture, IR proximity, and photodiode sensors.', seoTitle: 'Color & Optical Sensors India', seoDescription: '', bannerUrl: '', iconName: 'Eye', productCount: 115, sortOrder: 5 },
    ],
  },

  // ============================================================
  // 5. IOT & WIRELESS MODULES
  // ============================================================
  {
    id: 'iot',
    name: 'IoT & Wireless Modules',
    slug: 'iot-wireless-modules',
    parentId: null,
    level: 0,
    description: 'LoRa, Zigbee, NB-IoT, GSM/GPRS, Bluetooth, and Wi-Fi modules for building connected Industrial IoT and smart home systems.',
    seoTitle: 'IoT & Wireless Modules India | LoRa, Zigbee, GSM, NRF24L01, ESP Wi-Fi',
    seoDescription: 'Shop LoRa SX1278, HC-05 Bluetooth, SIM800L GSM, 8-channel relay, NRF24L01, and advanced IoT gateway modules at best prices.',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Wifi',
    productCount: 3100,
    sortOrder: 5,
    dynamicFilters: {
      voltage: ['3.3V', '5V', '3.7V LiPo'],
      frequency: ['433 MHz', '915 MHz', '2.4 GHz', 'GSM Quad-band', 'Zigbee 2.4GHz'],
      compatibility: ['Arduino IDE', 'ESP-IDF', 'MicroPython', 'MQTT', 'HTTP/REST'],
      connectivity: ['UART', 'SPI', 'I2C', 'USB', 'GPIO'],
    },
    children: [
      { id: 'lora-lpwan', name: 'LoRa & LPWAN Modules', slug: 'lora-lpwan-modules', parentId: 'iot', level: 1, description: 'Ra-02 SX1278 LoRa, LoRaWAN gateways, and LPWAN evaluation boards.', seoTitle: 'LoRa & LPWAN Modules India', seoDescription: '', bannerUrl: '', iconName: 'Radio', productCount: 280, sortOrder: 1 },
      { id: 'gsm-cellular', name: 'GSM & Cellular Modules', slug: 'gsm-cellular-modules', parentId: 'iot', level: 1, description: 'SIM800L, SIM7600 4G LTE, and NB-IoT cellular modules for remote monitoring.', seoTitle: 'GSM Cellular Modules India', seoDescription: '', bannerUrl: '', iconName: 'Signal', productCount: 190, sortOrder: 2 },
      { id: 'bluetooth-modules', name: 'Bluetooth Modules', slug: 'bluetooth-wireless-modules', parentId: 'iot', level: 1, description: 'HC-05, HC-06, BLE 5.0 modules, and Bluetooth mesh modules.', seoTitle: 'Bluetooth Modules India', seoDescription: '', bannerUrl: '', iconName: 'Bluetooth', productCount: 240, sortOrder: 3 },
      { id: 'relay-control', name: 'Relay & Control Modules', slug: 'relay-control-modules', parentId: 'iot', level: 1, description: '1, 2, 4, 8-channel relay boards, SSR, and optocoupler isolation modules.', seoTitle: 'Relay Modules India', seoDescription: '', bannerUrl: '', iconName: 'ToggleLeft', productCount: 310, sortOrder: 4 },
    ],
  },

  // ============================================================
  // 6. DRONE TECHNOLOGY
  // ============================================================
  {
    id: 'drones',
    name: 'Drone Technology',
    slug: 'drone-technology',
    parentId: null,
    level: 0,
    description: 'Complete UAV ecosystem: flight controllers, BLDC motors, ESCs, FPV cameras, LiPo batteries, frames, and GPS modules for drones.',
    seoTitle: 'Drone Parts & UAV Technology India | Pixhawk, BLDC Motors, ESC, FPV Camera',
    seoDescription: 'Buy Pixhawk 6C, SpeedyBee F405, BLDC motors, 30A/50A ESCs, FPV cameras, XT60 connectors, drone frames, and GPS modules at the best prices.',
    bannerUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Plane',
    productCount: 950,
    sortOrder: 6,
    dynamicFilters: {
      voltage: ['3S LiPo (11.1V)', '4S LiPo (14.8V)', '6S LiPo (22.2V)', '2-3S'],
      rpmKv: ['900 KV', '1000 KV', '1400 KV', '2300 KV', '2600 KV'],
      current: ['20A', '30A', '40A', '50A ESC'],
      compatibility: ['Pixhawk / ArduPilot', 'Betaflight', 'INAV', 'DJI NAZA'],
      application: ['Agricultural Spray', 'FPV Racing', 'Photography / Cinema', 'Inspection / Survey'],
    },
    children: [
      { id: 'flight-controllers', name: 'Flight Controllers & Autopilots', slug: 'flight-controllers-autopilots', parentId: 'drones', level: 1, description: 'Pixhawk 6C, SpeedyBee F405, Betaflight F7 flight stacks for multirotors.', seoTitle: 'Flight Controllers India', seoDescription: '', bannerUrl: '', iconName: 'Navigation', productCount: 95, sortOrder: 1 },
      { id: 'bldc-motors', name: 'Brushless BLDC Motors', slug: 'brushless-bldc-motors', parentId: 'drones', level: 1, description: 'A2212, T-Motor, Emax BLDC motors in various KV ratings for drone propulsion.', seoTitle: 'BLDC Drone Motors India', seoDescription: '', bannerUrl: '', iconName: 'Zap', productCount: 130, sortOrder: 2 },
      { id: 'escs', name: 'ESCs & 4-in-1 Stacks', slug: 'esc-electronic-speed-controllers', parentId: 'drones', level: 1, description: '20A, 30A, 50A single and 4-in-1 ESC stacks with BLHeli firmware.', seoTitle: 'ESCs for Drones India', seoDescription: '', bannerUrl: '', iconName: 'Zap', productCount: 110, sortOrder: 3 },
      { id: 'fpv-cameras', name: 'FPV & Camera Systems', slug: 'fpv-cameras-drone', parentId: 'drones', level: 1, description: 'Foxeer Predator, RunCam FPV cameras, VTX transmitters, and antennas.', seoTitle: 'FPV Cameras India', seoDescription: '', bannerUrl: '', iconName: 'Camera', productCount: 90, sortOrder: 4 },
      { id: 'drone-frames', name: 'Frames & Chassis', slug: 'drone-frames-chassis', parentId: 'drones', level: 1, description: 'F450, S500, and 3K carbon fiber racing frames with motor mounts.', seoTitle: 'Drone Frames India', seoDescription: '', bannerUrl: '', iconName: 'Frame', productCount: 80, sortOrder: 5 },
    ],
  },

  // ============================================================
  // 7. ROBOTICS ACCESSORIES
  // ============================================================
  {
    id: 'robotics',
    name: 'Robotics Accessories',
    slug: 'robotics-accessories',
    parentId: null,
    level: 0,
    description: 'Robot chassis kits, servo motors, gripper claws, motor drivers, wheels, encoders, and complete DIY robot assembly kits.',
    seoTitle: 'Robotics Accessories India | Robot Kits, Servo Motors, Chassis, Motor Drivers',
    seoDescription: 'Buy 4WD robot chassis, MG996R servos, L298N motor drivers, robotic arms, mecanum wheels, ROS2 SLAM navigation platforms and more.',
    bannerUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Bot',
    productCount: 2400,
    sortOrder: 7,
    dynamicFilters: {
      voltage: ['5V', '6V', '12V', '24V'],
      rpmKv: ['100 RPM', '200 RPM', '300 RPM', '600 RPM'],
      dof: ['2-DOF', '4-DOF', '6-DOF'],
      material: ['CNC Aluminium', 'ABS Plastic', 'Acrylic', 'Steel Alloy'],
      compatibility: ['Arduino IDE', 'ROS 2', 'MicroPython'],
      application: ['Line Follower', 'Obstacle Avoidance', 'SLAM Navigation', 'Manipulator Arm', 'Industrial Inspection'],
    },
    children: [
      { id: 'robot-kits', name: 'Robot Kits', slug: 'robot-kits', parentId: 'robotics', level: 1, description: 'Complete 4WD, 6WD, mecanum, and tracked robot chassis assembly kits.', seoTitle: 'Robot Kits India', seoDescription: '', bannerUrl: '', iconName: 'Bot', productCount: 280, sortOrder: 1 },
      { id: 'servo-motors', name: 'Servo Motors', slug: 'servo-motors', parentId: 'robotics', level: 1, description: 'SG90 micro, MG996R high-torque, digital servo motors for robotics and RC.', seoTitle: 'Servo Motors India', seoDescription: '', bannerUrl: '', iconName: 'Rotate3D', productCount: 240, sortOrder: 2 },
      { id: 'motor-drivers', name: 'Motor Drivers', slug: 'motor-drivers', parentId: 'robotics', level: 1, description: 'L298N, L293D, TB6612FNG dual H-bridge motor driver modules.', seoTitle: 'Motor Drivers India', seoDescription: '', bannerUrl: '', iconName: 'Zap', productCount: 320, sortOrder: 3 },
      { id: 'wheels-tracks', name: 'Wheels, Tracks & Couplers', slug: 'wheels-tracks-couplers', parentId: 'robotics', level: 1, description: 'TT motor wheels, mecanum wheels, rubber tracks, and motor shaft couplers.', seoTitle: 'Robot Wheels & Tracks India', seoDescription: '', bannerUrl: '', iconName: 'Circle', productCount: 190, sortOrder: 4 },
      { id: 'grippers-endeffectors', name: 'Grippers & End-Effectors', slug: 'robot-grippers-end-effectors', parentId: 'robotics', level: 1, description: 'Aluminium gripper claws, suction cup, magnetic and pneumatic grippers.', seoTitle: 'Robot Grippers India', seoDescription: '', bannerUrl: '', iconName: 'Hand', productCount: 120, sortOrder: 5 },
    ],
  },

  // ============================================================
  // 8. BATTERIES
  // ============================================================
  {
    id: 'batteries',
    name: 'Batteries',
    slug: 'batteries',
    parentId: null,
    level: 0,
    description: 'LiPo, Li-ion, LiFe4, NiMH battery packs, BMS boards, and battery chargers for drones, robots, and portable electronics.',
    seoTitle: 'LiPo Batteries & Chargers India | 2S, 3S, 4S, 6S Drone & Robot Batteries',
    seoDescription: 'Buy LiPo 4S 2200mAh, 18650 Li-ion packs, BMS protection boards, balance chargers, and XT60/XT90 connectors. Surface freight only for LiPo.',
    bannerUrl: 'https://images.unsplash.com/photo-1609592806596-b6d2b0a2f1d7?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Battery',
    productCount: 680,
    sortOrder: 8,
    dynamicFilters: {
      chemistry: ['LiPo', 'Li-ion 18650', 'LiFePO4', 'NiMH'],
      voltage: ['3.7V (1S)', '7.4V (2S)', '11.1V (3S)', '14.8V (4S)', '22.2V (6S)'],
      capacity: ['1000 mAh', '1500 mAh', '2200 mAh', '3000 mAh', '5000 mAh', '10000 mAh'],
      cRating: ['25C', '35C', '50C', '75C', '100C'],
      application: ['FPV Racing', 'Agricultural Drone', 'Robot Power', 'RC Car', 'Portable Power Bank'],
    },
    children: [
      { id: 'lipo-packs', name: 'LiPo Battery Packs', slug: 'lipo-battery-packs', parentId: 'batteries', level: 1, description: '2S through 6S LiPo packs for drones, RC vehicles, and robot power.', seoTitle: 'LiPo Battery Packs India', seoDescription: '', bannerUrl: '', iconName: 'BatteryFull', productCount: 210, sortOrder: 1 },
      { id: 'lion-18650', name: 'Li-ion 18650 Cells & Packs', slug: 'li-ion-18650-cells', parentId: 'batteries', level: 1, description: 'Samsung 25R, LG HG2, and Panasonic NCR 18650 cells and assembled packs.', seoTitle: '18650 Li-ion Cells India', seoDescription: '', bannerUrl: '', iconName: 'BatteryMedium', productCount: 180, sortOrder: 2 },
      { id: 'bms-chargers', name: 'BMS & Battery Chargers', slug: 'bms-balance-chargers', parentId: 'batteries', level: 1, description: 'IMAX B6, Junsi iCharger, and 2S-8S LiPo balance chargers with BMS protection.', seoTitle: 'Battery Chargers India', seoDescription: '', bannerUrl: '', iconName: 'Zap', productCount: 120, sortOrder: 3 },
    ],
  },

  // ============================================================
  // 9. ELECTRONIC COMPONENTS
  // ============================================================
  {
    id: 'components',
    name: 'Electronic Components',
    slug: 'electronic-components',
    parentId: null,
    level: 0,
    description: 'Resistors, capacitors, ICs, transistors, LEDs, relays, connectors, and passive components for PCB design and circuit prototyping.',
    seoTitle: 'Electronic Components India | Resistors, Capacitors, ICs, LEDs, Relays',
    seoDescription: 'Shop through metal film resistors, electrolytic capacitors, 555 timers, MOSFETs, NPN/PNP transistors, relays, and terminal blocks for prototyping.',
    bannerUrl: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?auto=format&fit=crop&w=1600&q=80',
    iconName: 'CircuitBoard',
    productCount: 4200,
    sortOrder: 9,
    dynamicFilters: {
      voltage: ['3.3V', '5V', '12V', '24V', '50V'],
      material: ['SMD', 'Through-Hole', 'DIP Package', 'SOIC Package'],
      application: ['Power Regulation', 'Signal Conditioning', 'Switching', 'Amplification', 'Logic Gates'],
    },
    children: [
      { id: 'resistors', name: 'Resistors', slug: 'resistors', parentId: 'components', level: 1, description: 'Metal film, carbon film, wirewound, and SMD resistor assortment kits.', seoTitle: 'Resistors India', seoDescription: '', bannerUrl: '', iconName: 'Minus', productCount: 580, sortOrder: 1 },
      { id: 'capacitors', name: 'Capacitors', slug: 'capacitors', parentId: 'components', level: 1, description: 'Electrolytic, ceramic, film, and MLCC capacitor kits in various ratings.', seoTitle: 'Capacitors India', seoDescription: '', bannerUrl: '', iconName: 'Layers', productCount: 520, sortOrder: 2 },
      { id: 'ics-logic', name: 'ICs & Logic Gates', slug: 'ics-logic-gates', parentId: 'components', level: 1, description: '555 timer, 74xx series logic gates, operational amplifiers, and shift registers.', seoTitle: 'ICs Logic Gates India', seoDescription: '', bannerUrl: '', iconName: 'Cpu', productCount: 850, sortOrder: 3 },
      { id: 'leds-display', name: 'LEDs & Display Modules', slug: 'leds-display-modules', parentId: 'components', level: 1, description: '5mm/3mm LEDs, WS2812B RGB strips, 0.96" OLED, 16x2 LCD displays.', seoTitle: 'LEDs & Displays India', seoDescription: '', bannerUrl: '', iconName: 'Lightbulb', productCount: 490, sortOrder: 4 },
      { id: 'relays-transistors', name: 'Relays & Transistors', slug: 'relays-transistors', parentId: 'components', level: 1, description: 'SPDT/DPDT relays, NPN/PNP transistors, MOSFETs, and BJTs.', seoTitle: 'Relays & Transistors India', seoDescription: '', bannerUrl: '', iconName: 'ToggleRight', productCount: 380, sortOrder: 5 },
    ],
  },

  // ============================================================
  // 10. CAMERAS
  // ============================================================
  {
    id: 'cameras',
    name: 'Cameras',
    slug: 'cameras',
    parentId: null,
    level: 0,
    description: 'Raspberry Pi Camera Module, Intel RealSense Depth cameras, ArduCam, ESP32-CAM, and machine vision cameras for AI and automation.',
    seoTitle: 'Cameras for Robotics & AI India | Intel RealSense, Pi Camera, ArduCam',
    seoDescription: 'Buy Intel RealSense D435i, Pi Camera Module 3, ArduCam 64MP, OAK-D, and FPV cameras for computer vision and AI edge applications.',
    bannerUrl: 'https://images.unsplash.com/photo-1588941288445-a3b1c6a1f e7a?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Camera',
    productCount: 420,
    sortOrder: 10,
    dynamicFilters: {
      resolution: ['0.3 MP (VGA)', '2 MP (1080p)', '5 MP', '12 MP', '64 MP'],
      interface: ['USB 3.0', 'CSI-2', 'MIPI', 'GigE', 'HDMI'],
      application: ['FPV / Racing', 'Computer Vision', 'Machine Learning', '3D Depth Mapping', 'Industrial Inspection'],
    },
    children: [
      { id: 'pi-cameras', name: 'Raspberry Pi Cameras', slug: 'raspberry-pi-cameras', parentId: 'cameras', level: 1, description: 'Official Pi Camera Module 3, NoIR, Global Shutter and HQ cameras.', seoTitle: 'Raspberry Pi Cameras', seoDescription: '', bannerUrl: '', iconName: 'Camera', productCount: 95, sortOrder: 1 },
      { id: 'depth-cameras', name: 'Depth & 3D Cameras', slug: 'depth-3d-cameras', parentId: 'cameras', level: 1, description: 'Intel RealSense D435i, D455, OAK-D, and Orbbec depth sensing cameras.', seoTitle: 'Depth Cameras India', seoDescription: '', bannerUrl: '', iconName: 'Scan', productCount: 80, sortOrder: 2 },
      { id: 'machine-vision', name: 'Machine Vision Cameras', slug: 'machine-vision-cameras', parentId: 'cameras', level: 1, description: 'GigE industrial cameras, USB3 vision cameras, and global shutter sensors.', seoTitle: 'Machine Vision Cameras', seoDescription: '', bannerUrl: '', iconName: 'ScanEye', productCount: 70, sortOrder: 3 },
    ],
  },

  // ============================================================
  // 11. CONNECTORS
  // ============================================================
  {
    id: 'connectors',
    name: 'Connectors',
    slug: 'connectors',
    parentId: null,
    level: 0,
    description: 'XT60, XT90, JST, Deans T-plug, Futaba, banana, SMA, U.FL RF connectors and battery pigtails for drones and electronics.',
    seoTitle: 'Connectors & Plugs India | XT60, JST, Deans, SMA, U.FL RF Connectors',
    seoDescription: 'Buy XT60, XT90, JST-PH, JST-ZH, Deans T-plug, EC3, EC5, SMA antenna connectors, and pin header terminal blocks at best prices.',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Plug',
    productCount: 1200,
    sortOrder: 11,
    dynamicFilters: {
      current: ['10A', '30A', '60A', '90A', '150A'],
      voltage: ['5V', '12V', '22.2V', '36V'],
      application: ['Battery Power', 'RF Antenna', 'Signal Wire', 'Power Distribution', 'PCB Headers'],
    },
    children: [
      { id: 'xt-connectors', name: 'XT60 / XT90 Battery Connectors', slug: 'xt60-xt90-battery-connectors', parentId: 'connectors', level: 1, description: 'XT60 and XT90 male/female pigtails, pairs, and extension wires.', seoTitle: 'XT60 XT90 Connectors India', seoDescription: '', bannerUrl: '', iconName: 'Zap', productCount: 280, sortOrder: 1 },
      { id: 'jst-connectors', name: 'JST Connectors', slug: 'jst-connectors', parentId: 'connectors', level: 1, description: 'JST-PH, JST-ZH, JST-XH 2/3/4 pin connectors and harnesses.', seoTitle: 'JST Connectors India', seoDescription: '', bannerUrl: '', iconName: 'Plug', productCount: 320, sortOrder: 2 },
      { id: 'rf-antenna-connectors', name: 'RF & Antenna Connectors', slug: 'rf-antenna-connectors', parentId: 'connectors', level: 1, description: 'SMA, RP-SMA, U.FL/IPEX, N-type RF connectors and adapters.', seoTitle: 'RF Antenna Connectors', seoDescription: '', bannerUrl: '', iconName: 'Radio', productCount: 210, sortOrder: 3 },
    ],
  },

  // ============================================================
  // 12. MECHANICAL PRODUCTS
  // ============================================================
  {
    id: 'mechanical',
    name: 'Mechanical Products',
    slug: 'mechanical-products',
    parentId: null,
    level: 0,
    description: 'Bearings, gears, belts, pulleys, lead screws, linear rails, aluminum profiles, and mechanical hardware for robotics and machines.',
    seoTitle: 'Mechanical Parts India | Bearings, Gears, Linear Rails, Aluminum Extrusions',
    seoDescription: 'Buy linear rails, ball bearings, timing belts, GT2 pulleys, lead screws, 2020 aluminum extrusions, and structural hardware for CNC and robotics.',
    bannerUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Settings',
    productCount: 950,
    sortOrder: 12,
    dynamicFilters: {
      material: ['Stainless Steel', 'Aluminium 6061', 'PTFE', 'Acetal Delrin', 'Carbon Fiber'],
      application: ['CNC Machine', '3D Printer', 'Robotic Arm', 'Linear Motion', 'Gearbox Assembly'],
    },
    children: [
      { id: 'linear-motion', name: 'Linear Motion (Rails & Slides)', slug: 'linear-motion-rails-slides', parentId: 'mechanical', level: 1, description: 'MGN12, MGN15 linear rails, SBR rails, LM8UU ball bearings, and lead screws.', seoTitle: 'Linear Motion Rails India', seoDescription: '', bannerUrl: '', iconName: 'MoveHorizontal', productCount: 195, sortOrder: 1 },
      { id: 'gears-belts', name: 'Gears, Belts & Pulleys', slug: 'gears-belts-pulleys', parentId: 'mechanical', level: 1, description: 'GT2 timing belts, 20T/40T pulleys, spur gears, and worm gear sets.', seoTitle: 'Gears & Belts India', seoDescription: '', bannerUrl: '', iconName: 'Cog', productCount: 220, sortOrder: 2 },
      { id: 'aluminum-profiles', name: 'Aluminium Extrusion Profiles', slug: 'aluminium-extrusion-profiles', parentId: 'mechanical', level: 1, description: '2020, 2040, 3030 V-slot and T-slot aluminium extrusion profiles and brackets.', seoTitle: 'Aluminium Profiles India', seoDescription: '', bannerUrl: '', iconName: 'Ruler', productCount: 180, sortOrder: 3 },
    ],
  },

  // ============================================================
  // 13. 3D ACCESSORIES
  // ============================================================
  {
    id: '3d-printing',
    name: '3D Printing Accessories',
    slug: '3d-printing-accessories',
    parentId: null,
    level: 0,
    description: 'PLA, PETG, ABS, TPU filaments, hotends, extruders, bed adhesives, and 3D printer spare parts for FDM and resin printing.',
    seoTitle: '3D Printing Filaments & Accessories India | PLA, PETG, ABS, TPU',
    seoDescription: 'Shop PLA+, PETG, ABS, TPU, Nylon filaments, Creality hotend kits, extruders, Heatbreak throats, and glass/PEI print beds.',
    bannerUrl: 'https://images.unsplash.com/photo-1609592806596-b6d2b0a2f1d7?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Layers',
    productCount: 780,
    sortOrder: 13,
    dynamicFilters: {
      material: ['PLA', 'PLA+', 'PETG', 'ABS', 'TPU', 'Nylon', 'Carbon Fiber Composite'],
      application: ['FDM Printing', 'Resin SLA', 'Flexible Parts', 'Functional Prototypes', 'High-Temp Parts'],
    },
    children: [
      { id: 'filaments', name: 'Filaments', slug: '3d-printing-filaments', parentId: '3d-printing', level: 1, description: 'Premium PLA, PETG, ABS, TPU, and specialty composite filaments in all colors.', seoTitle: '3D Printing Filaments India', seoDescription: '', bannerUrl: '', iconName: 'Layers', productCount: 320, sortOrder: 1 },
      { id: 'printer-parts', name: 'Printer Parts & Hotends', slug: '3d-printer-parts-hotends', parentId: '3d-printing', level: 1, description: 'E3D V6, Volcano, Creality hotends, nozzles, extruder kits, and heatbreaks.', seoTitle: '3D Printer Hotends India', seoDescription: '', bannerUrl: '', iconName: 'Flame', productCount: 260, sortOrder: 2 },
    ],
  },

  // ============================================================
  // 14. EDUCATIONAL TOYS
  // ============================================================
  {
    id: 'educational-toys',
    name: 'Educational Toys',
    slug: 'educational-toys',
    parentId: null,
    level: 0,
    description: 'LEGO Technic, Makeblock mBot, coding toys, scratch-compatible kits, and engaging educational toys for kids aged 6-18.',
    seoTitle: 'Educational Toys & Coding Kits India | STEM Toys for Kids 6-18',
    seoDescription: 'Buy LEGO Technic sets, mBot, Cubetto, Osmo, and coding kits that teach robotics, programming, and engineering to school-age children.',
    bannerUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    iconName: 'GraduationCap',
    productCount: 580,
    sortOrder: 14,
    dynamicFilters: {
      application: ['Coding / Programming', 'Mechanical Engineering', 'Electronics Basics', 'AI & Machine Learning', 'Environmental Science'],
    },
    children: [
      { id: 'coding-toys', name: 'Coding & Scratch Toys', slug: 'coding-scratch-toys', parentId: 'educational-toys', level: 1, description: 'mBot, Cubetto, Ozobot coding toys and Scratch-compatible programming blocks.', seoTitle: 'Coding Toys India', seoDescription: '', bannerUrl: '', iconName: 'Code', productCount: 180, sortOrder: 1 },
      { id: 'building-sets', name: 'Building & Mechanical Sets', slug: 'building-mechanical-sets', parentId: 'educational-toys', level: 1, description: 'LEGO Technic, K-nex, Thames & Kosmos engineering activity sets.', seoTitle: 'Building Sets India', seoDescription: '', bannerUrl: '', iconName: 'Blocks', productCount: 220, sortOrder: 2 },
    ],
  },

  // ============================================================
  // 15. STEM KITS
  // ============================================================
  {
    id: 'stem-kits',
    name: 'STEM Kits',
    slug: 'stem-kits',
    parentId: null,
    level: 0,
    description: 'ATL Tinkering Lab kits, CBSE-aligned school electronics kits, robotics competition kits, and advanced university project starter packs.',
    seoTitle: 'STEM Kits India | ATL Tinkering Lab Kits, School Science, Robotics Kits',
    seoDescription: 'Buy ready-to-use STEM kits for Atal Tinkering Labs (ATL), CBSE school competitions, robotics olympiad, and college project labs with full documentation.',
    bannerUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    iconName: 'BookOpen',
    productCount: 650,
    sortOrder: 15,
    dynamicFilters: {
      application: ['ATL Lab', 'School Project', 'Competition / Olympiad', 'University Research', 'Hobbyist'],
    },
    children: [
      { id: 'atl-kits', name: 'ATL Tinkering Lab Kits', slug: 'atl-tinkering-lab-kits', parentId: 'stem-kits', level: 1, description: 'Government-approved ATL starter kit, advanced kit, and individual replenishment packs.', seoTitle: 'ATL Kits India', seoDescription: '', bannerUrl: '', iconName: 'FlaskConical', productCount: 120, sortOrder: 1 },
      { id: 'school-kits', name: 'School Science & Electronics Kits', slug: 'school-science-electronics-kits', parentId: 'stem-kits', level: 1, description: 'Breadboard electronics kits, basic circuits kits, and Grade 8-12 lab activity packs.', seoTitle: 'School Science Kits India', seoDescription: '', bannerUrl: '', iconName: 'GraduationCap', productCount: 240, sortOrder: 2 },
      { id: 'competition-kits', name: 'Competition & Olympiad Kits', slug: 'competition-olympiad-kits', parentId: 'stem-kits', level: 1, description: 'WRO, FIRST, FLL, and Science Olympiad approved kit bundles for competitive robotics.', seoTitle: 'Competition Kits India', seoDescription: '', bannerUrl: '', iconName: 'Trophy', productCount: 95, sortOrder: 3 },
    ],
  },

  // ============================================================
  // 16. INDUSTRIAL AUTOMATION
  // ============================================================
  {
    id: 'industrial',
    name: 'Industrial Automation',
    slug: 'industrial-automation',
    parentId: null,
    level: 0,
    description: 'PLCs, HMI panels, VFDs, industrial sensors, SCADA interfaces, and DIN rail power supplies for factory and process automation.',
    seoTitle: 'Industrial Automation Components India | PLC, HMI, VFD, SCADA Modules',
    seoDescription: 'Buy Siemens LOGO! PLCs, Allen Bradley Micro PLCs, Weintek HMI panels, Schneider VFDs, and Modbus RS485 sensors for industrial automation projects.',
    bannerUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
    iconName: 'Factory',
    productCount: 740,
    sortOrder: 16,
    dynamicFilters: {
      voltage: ['24V DC', '110V AC', '230V AC', '400V 3-Phase'],
      application: ['PLC Programming', 'Motor Speed Control (VFD)', 'Industrial HMI', 'SCADA / Modbus', 'Conveyor Control'],
      interface: ['Modbus RTU', 'Modbus TCP', 'Profibus', 'EtherNet/IP', 'OPC-UA'],
    },
    children: [
      { id: 'plcs', name: 'PLCs', slug: 'programmable-logic-controllers', parentId: 'industrial', level: 1, description: 'Siemens S7-1200, LOGO!, Allen Bradley Micro820, Click PLCs for industrial control.', seoTitle: 'PLCs India', seoDescription: '', bannerUrl: '', iconName: 'Server', productCount: 110, sortOrder: 1 },
      { id: 'vfds', name: 'Variable Frequency Drives (VFDs)', slug: 'variable-frequency-drives-vfd', parentId: 'industrial', level: 1, description: 'Schneider ATV310, ABB ACH550, Omron 3G3MX2 VFD motor drives.', seoTitle: 'VFDs India', seoDescription: '', bannerUrl: '', iconName: 'Gauge', productCount: 90, sortOrder: 2 },
      { id: 'hmis', name: 'HMI Panels', slug: 'hmi-panels', parentId: 'industrial', level: 1, description: 'Weintek MT8071, iE, Pro-face, and Siemens HMI touchscreen panels.', seoTitle: 'HMI Panels India', seoDescription: '', bannerUrl: '', iconName: 'Monitor', productCount: 70, sortOrder: 3 },
    ],
  },
];

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

/** Flat list of all categories (for filter dropdowns and breadcrumbs) */
export function flattenCategories(nodes: CategoryNode[] = CATEGORIES_HIERARCHY): CategoryNode[] {
  const result: CategoryNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children) {
      result.push(...flattenCategories(node.children));
    }
  }
  return result;
}

/** Get all top-level (parent) categories */
export const PARENT_CATEGORIES = CATEGORIES_HIERARCHY.filter(c => c.level === 0);

/** Get category node by slug */
export function getCategoryBySlug(slug: string): CategoryNode | undefined {
  return flattenCategories().find(c => c.slug === slug);
}

/** Get all children of a parent category */
export function getCategoryChildren(parentId: string): CategoryNode[] {
  return flattenCategories().filter(c => c.parentId === parentId);
}

/** Get dynamic filter labels for a category by its ID */
export function getCategoryDynamicFilters(categoryId: string): CategoryDynamicFilters | undefined {
  const cat = flattenCategories().find(c => c.id === categoryId);
  if (!cat) return undefined;
  if (cat.dynamicFilters) return cat.dynamicFilters;
  // Inherit from parent
  if (cat.parentId) {
    const parent = flattenCategories().find(c => c.id === cat.parentId);
    return parent?.dynamicFilters;
  }
  return undefined;
}
