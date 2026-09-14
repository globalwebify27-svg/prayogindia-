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
  shortName?: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  productCount: number;
  featured?: boolean;
  color?: string;
  bgColor?: string;
  subcategories: Subcategory[];
}

export const CATEGORIES_DATA: CategoryData[] = [
  // 1. Arduino & Development Boards
  {
    id: "cat-arduino-devboards",
    slug: "arduino-development-boards",
    slugAlias: "arduino",
    name: "Arduino & Development Boards",
    shortName: "Arduino",
    shortDescription: "Official Arduino boards, shields, microcontrollers & accessories.",
    fullDescription: "Explore our range of authentic Arduino boards, ATmega328P platforms, R4 WiFi series, shield expansion modules, and development accessories for engineers & hobbyists.",
    image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=800&q=80",
    productCount: 1850,
    featured: true,
    color: "#00878F",
    bgColor: "#E6F7F8",
    subcategories: [
      { id: "sub-ard-boards", slug: "arduino-boards", name: "Arduino Boards", description: "UNO, Nano, Mega, Pro Mini & MKR boards.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 450 },
      { id: "sub-ard-shields", slug: "arduino-shields", name: "Arduino Shields", description: "Motor, Ethernet, Relay, and CNC shields.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 320 },
      { id: "sub-ard-modules", slug: "arduino-modules", name: "Arduino Modules", description: "Sensor breakout boards & communication modules.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", productCount: 520 },
      { id: "sub-mcu-boards", slug: "microcontroller-boards", name: "Microcontroller Boards", description: "ESP32, STM32, NodeMCU, PIC & AVR boards.", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80", productCount: 280 },
      { id: "sub-dev-boards", slug: "development-boards", name: "Development Boards", description: "FPGA, CPLD, and specialized SOC development kits.", image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80", productCount: 160 },
      { id: "sub-prog-debug", slug: "programmer-debugger", name: "Programmer & Debugger", description: "ST-Link, USBasp, FTDI, JTAG & CP2102 debuggers.", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80", productCount: 120 },
    ],
  },

  // 2. Raspberry Pi
  {
    id: "cat-raspberry-pi",
    slug: "raspberry-pi",
    shortName: "Raspberry Pi",
    name: "Raspberry Pi",
    shortDescription: "Single-board compute modules, HATs, displays & power supplies.",
    fullDescription: "Raspberry Pi 5, Pi 4B, Compute Module 4, official cases, camera modules, active coolers, Touch displays, and AI accelerators.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    productCount: 1200,
    featured: true,
    color: "#C51A4A",
    bgColor: "#FDE8EF",
    subcategories: [
      { id: "sub-rpi-boards", slug: "raspberry-pi-boards", name: "Raspberry Pi Boards", description: "Raspberry Pi 5, 4 Model B, Zero 2W & CM4.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", productCount: 280 },
      { id: "sub-rpi-hats", slug: "raspberry-pi-hats", name: "Raspberry Pi HATs", description: "PoE HATs, Motor Driver HATs, GPS & Audio DACs.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 340 },
      { id: "sub-rpi-cases", slug: "raspberry-pi-cases", name: "Raspberry Pi Cases", description: "Aluminum passive cooling cases and acrylic enclosures.", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", productCount: 210 },
      { id: "sub-rpi-power", slug: "power-supplies", name: "Power Supplies", description: "Official 27W USB-C PD and 15W power adapters.", image: "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80", productCount: 150 },
      { id: "sub-rpi-display", slug: "display-camera", name: "Display & Camera", description: "HQ Camera 12MP, Global Shutter & DSI Touchscreens.", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80", productCount: 220 },
    ],
  },

  // 3. Robotics
  {
    id: "cat-robotics",
    slug: "robotics",
    shortName: "Robotics",
    name: "Robotics",
    shortDescription: "Build, learn and explore autonomous robotics, arms & chassis.",
    fullDescription: "Comprehensive range of robotics hardware, 6-DOF manipulator arms, ROS 2 mobility platforms, metal chassis, servos, and industrial actuators.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    productCount: 2450,
    featured: true,
    color: "#7C3AED",
    bgColor: "#F5F3FF",
    subcategories: [
      { id: "sub-robotics-kits", slug: "robotics-kits", name: "Robot Kits", description: "Complete hands-on STEM & ROS robotics kits.", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80", productCount: 420 },
      { id: "sub-robot-parts", slug: "robot-chassis", name: "Robot Chassis", description: "Metal frames, omni wheels & structural brackets.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 680 },
      { id: "sub-robot-wheels", slug: "robot-wheels", name: "Robot Wheels", description: "Mecanum wheels, rubber tracks & caster wheels.", image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80", productCount: 310 },
      { id: "sub-robot-arms", slug: "robot-arms", name: "Robot Arms", description: "6-DOF robotic metal arm grippers and kinematic kits.", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80", productCount: 290 },
      { id: "sub-robot-controllers", slug: "robotics-controllers", name: "Robotics Controllers", description: "PCA9685 16-channel servo drivers & ROS controllers.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 500 },
      { id: "sub-line-following", slug: "line-following-robots", name: "Line Following Robots", description: "High-speed line tracker sensors and DIY STEM kits.", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80", productCount: 250 },
    ],
  },

  // 4. Sensors & Modules
  {
    id: "cat-sensors-modules",
    slug: "sensors-modules",
    shortName: "Sensors",
    name: "Sensors & Modules",
    shortDescription: "Precision environmental, motion, optical, gas & biosensors.",
    fullDescription: "From temperature and humidity probes (DHT22, BME280) to 6-axis IMUs (MPU6050), LiDAR distance sensors, and smart AI vision modules.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    productCount: 3100,
    featured: true,
    color: "#D97706",
    bgColor: "#FFFBEB",
    subcategories: [
      { id: "sub-temp-sensors", slug: "temperature-sensors", name: "Temperature Sensors", description: "DHT11, DHT22, DS18B20 & PT100 thermal probes.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 410 },
      { id: "sub-humidity-sensors", slug: "humidity-sensors", name: "Humidity Sensors", description: "BME280, SHT31 & capacitive soil moisture sensors.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", productCount: 330 },
      { id: "sub-ultrasonic-sensors", slug: "ultrasonic-sensors", name: "Ultrasonic Sensors", description: "HC-SR04, waterproof JSN-SR04T distance sensors.", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80", productCount: 290 },
      { id: "sub-motion-sensors", slug: "motion-sensors", name: "Motion & IMU Sensors", description: "MPU6050, PIR motion, ADXL345 & radar sensors.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 460 },
      { id: "sub-gas-sensors", slug: "gas-sensors", name: "Gas Sensors", description: "MQ-2, MQ-7, MQ-135 air quality & CO2 sensors.", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", productCount: 380 },
      { id: "sub-gps-rfid", slug: "gps-rfid-modules", name: "GPS & RFID Modules", description: "NEO-6M GPS, RC522 RFID & NFC readers.", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80", productCount: 420 },
    ],
  },

  // 5. Motors & Motor Drivers
  {
    id: "cat-motors-drivers",
    slug: "motors-drivers",
    shortName: "Motors",
    name: "Motors & Motor Drivers",
    shortDescription: "DC, Stepper, BLDC, Servo motors and H-bridge motor drivers.",
    fullDescription: "Heavy-duty NEMA 17/23 stepper motors, MG996R metal gear servos, drone BLDC brushless motors, and high-current L298N/TB6600 driver controllers.",
    image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=800&q=80",
    productCount: 1950,
    featured: true,
    color: "#EA580C",
    bgColor: "#FFF7ED",
    subcategories: [
      { id: "sub-dc-motors", slug: "dc-motors", name: "DC Motors", description: "Bo motor, high-torque RS775, and micro vibration motors.", image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80", productCount: 410 },
      { id: "sub-gear-motors", slug: "gear-motors", name: "Gear Motors", description: "Planetary gear, metal spur gearbox & worm gear motors.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 380 },
      { id: "sub-servo-motors", slug: "servo-motors", name: "Servo Motors", description: "SG90 micro servos, MG995/MG996R & serial bus servos.", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80", productCount: 360 },
      { id: "sub-stepper-motors", slug: "stepper-motors", name: "Stepper Motors", description: "NEMA 17, NEMA 23 & 28BYJ-48 stepper motors.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 310 },
      { id: "sub-bldc-motors", slug: "bldc-motors", name: "BLDC Motors", description: "A2212, 2205 brushless drone motors & outrunners.", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80", productCount: 290 },
      { id: "sub-motor-drivers", slug: "motor-drivers", name: "Motor Drivers & ESC", description: "L298N, L293D, TB6600, A4988 & 30A SimonK ESCs.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", productCount: 320 },
    ],
  },

  // 6. Electronic Components
  {
    id: "cat-electronic-components",
    slug: "electronic-components",
    shortName: "Components",
    name: "Electronic Components",
    shortDescription: "Semiconductors, resistors, capacitors, ICs, relays & switches.",
    fullDescription: "Core discrete active and passive components, NE555 timers, LM358 op-amps, MOSFETs, diodes, high-precision metal film resistors, and relays.",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
    productCount: 5400,
    featured: true,
    color: "#0284C7",
    bgColor: "#F0F9FF",
    subcategories: [
      { id: "sub-resistors", slug: "resistors", name: "Resistors", description: "Carbon film, metal film, SMD & potentiometer trimmer resistors.", image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80", productCount: 890 },
      { id: "sub-capacitors", slug: "capacitors", name: "Capacitors", description: "Electrolytic, ceramic disc, tantalum & SMD capacitors.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", productCount: 780 },
      { id: "sub-diodes-transistors", slug: "diodes-transistors", name: "Diodes & Transistors", description: "1N4007, Zener, Schottky, BC547, 2N2222 & IRF540N MOSFETs.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 940 },
      { id: "sub-ics", slug: "ics", name: "Integrated Circuits (ICs)", description: "Logic gates, operational amplifiers, timers & voltage regulators.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 1100 },
      { id: "sub-relays-switches", slug: "relays-switches", name: "Relays & Switches", description: "5V/12V relay modules, tactile push buttons, toggle switches.", image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80", productCount: 650 },
    ],
  },

  // 7. IoT & Wireless
  {
    id: "cat-iot-wireless",
    slug: "iot-wireless",
    shortName: "IoT & Wireless",
    name: "IoT & Wireless",
    shortDescription: "Wi-Fi, Bluetooth, LoRa, GSM, RF modules & antennas.",
    fullDescription: "Long-range wireless transceivers, ESP8266 ESP-01, ESP32 NodeMCU, SX1278 LoRa 433MHz, SIM800L GSM, and high-gain SMA antennas.",
    image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80",
    productCount: 1650,
    featured: true,
    color: "#2563EB",
    bgColor: "#EFF6FF",
    subcategories: [
      { id: "sub-wifi-modules", slug: "wifi-modules", name: "Wi-Fi Modules", description: "ESP8266, ESP32-WROOM & USB Wi-Fi dongles.", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80", productCount: 380 },
      { id: "sub-bluetooth-modules", slug: "bluetooth-modules", name: "Bluetooth Modules", description: "HC-05, HC-06, BLE 4.0 & ESP32 BLE transceivers.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 310 },
      { id: "sub-lora-rf", slug: "lora-rf-modules", name: "LoRa & RF Modules", description: "SX1278 LoRa, NRF24L01+ 2.4GHz & 433MHz RF pairs.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", productCount: 290 },
      { id: "sub-gsm-gprs", slug: "gsm-gprs-modules", name: "GSM/GPRS Modules", description: "SIM800L, SIM900A & 4G LTE IoT gateways.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 240 },
    ],
  },

  // 8. Batteries & Power
  {
    id: "cat-batteries-power",
    slug: "batteries-power",
    shortName: "Power & Batt",
    name: "Batteries & Power",
    shortDescription: "Li-ion cells, LiPo battery packs, BMS, chargers & buck converters.",
    fullDescription: "High-discharge 18650 Li-ion cells, 3S/4S drone LiPo packs, TP4056 chargers, multi-cell BMS protection boards, and DC-DC step-down converters.",
    image: "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=800&q=80",
    productCount: 1420,
    featured: true,
    color: "#059669",
    bgColor: "#ECFDF5",
    subcategories: [
      { id: "sub-li-ion", slug: "li-ion-batteries", name: "Li-ion Batteries", description: "18650 2600mAh/3000mAh, 21700 high-capacity cells.", image: "https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=600&q=80", productCount: 320 },
      { id: "sub-lipo", slug: "lipo-batteries", name: "Li-Po Batteries", description: "11.1V 3S, 14.8V 4S high-C discharge drone packs.", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80", productCount: 290 },
      { id: "sub-bms-chargers", slug: "battery-chargers-bms", name: "Battery Chargers & BMS", description: "TP4056 USB Type-C, IMAX B6, 3S/4S BMS modules.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 350 },
      { id: "sub-power-supplies", slug: "dc-dc-power-modules", name: "DC-DC Converters & Supplies", description: "LM2596 buck, XL6009 boost & 12V 5A SMPS power bricks.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 360 },
    ],
  },

  // 9. Cameras & Imaging
  {
    id: "cat-cameras-imaging",
    slug: "cameras-imaging",
    shortName: "Cameras",
    name: "Cameras & Imaging",
    shortDescription: "USB, Pi, ESP32-CAM, lenses & smart machine vision sensors.",
    fullDescription: "High-resolution camera sensors, OV2640, Raspberry Pi HQ camera lenses, thermal imaging modules, and smart optical flow sensors.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    productCount: 780,
    color: "#9333EA",
    bgColor: "#FAF5FF",
    subcategories: [
      { id: "sub-esp-cam", slug: "esp-cameras", name: "ESP32-CAM & AI Cams", description: "OV2640, OV7670 and Wi-Fi camera breakout modules.", image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80", productCount: 190 },
      { id: "sub-pi-cam", slug: "raspberry-pi-cameras", name: "Raspberry Pi Cameras", description: "Pi Camera v2, HQ Camera 12MP & Wide-Angle lenses.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", productCount: 240 },
      { id: "sub-usb-cam", slug: "usb-cameras-lenses", name: "USB Cameras & Lenses", description: "UVC plug-and-play USB cameras & CS-mount optical lenses.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 210 },
    ],
  },

  // 10. Connectors, Cables & Adapters
  {
    id: "cat-cables-connectors",
    slug: "cables-connectors",
    shortName: "Cables",
    name: "Connectors, Cables & Adapters",
    shortDescription: "Jumper wires, Dupont connectors, USB, HDMI & power cables.",
    fullDescription: "Premium male-to-male, male-to-female jumper cables, Dupont connector crimping kits, high-speed USB-C cables, and terminal block connectors.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    productCount: 2100,
    color: "#4F46E5",
    bgColor: "#EEF2FF",
    subcategories: [
      { id: "sub-jumper-wires", slug: "jumper-wires", name: "Jumper Wires", description: "M-M, M-F, F-F 10cm/20cm/30cm ribbon jumper wires.", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80", productCount: 520 },
      { id: "sub-dupont-pin", slug: "dupont-pin-headers", name: "Dupont & Pin Headers", description: "2.54mm pitch male/female headers & crimp pins.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 480 },
      { id: "sub-usb-hdmi", slug: "usb-hdmi-cables", name: "USB & HDMI Cables", description: "Type-C, Micro USB, Mini HDMI & ribbon display cables.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 410 },
      { id: "sub-terminals", slug: "terminal-blocks", name: "Terminal Blocks & Plugs", description: "Screw terminals, DC barrel jacks & XT60 connectors.", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80", productCount: 430 },
    ],
  },

  // 11. Mechanical Components
  {
    id: "cat-mechanical-components",
    slug: "mechanical-components",
    shortName: "Mechanical",
    name: "Mechanical Components",
    shortDescription: "Bearings, gears, shafts, pulleys, couplers & structural fasteners.",
    fullDescription: "608ZZ bearings, GT2 timing belts, aluminum flexible shaft couplers, lead screws, and CNC mechanical structural hardware.",
    image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80",
    productCount: 1890,
    color: "#475569",
    bgColor: "#F1F5F9",
    subcategories: [
      { id: "sub-bearings", slug: "bearings", name: "Bearings", description: "608ZZ, 625ZZ, linear ball bearings & flange bearings.", image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80", productCount: 390 },
      { id: "sub-gears-pulleys", slug: "gears-pulleys", name: "Gears & GT2 Pulleys", description: "Plastic & brass spur gears, GT2 20T timing pulleys.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 440 },
      { id: "sub-shafts-couplers", slug: "shafts-couplers", name: "Shafts & Couplers", description: "5mm to 8mm aluminum couplers, stainless steel rods.", image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?auto=format&fit=crop&w=600&q=80", productCount: 420 },
      { id: "sub-fasteners", slug: "screws-nuts-spacers", name: "Screws, Nuts & Spacers", description: "M3/M4 nylon standoff kits, hex socket cap screws.", image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80", productCount: 510 },
    ],
  },

  // 12. Drone Technology
  {
    id: "cat-drone-technology",
    slug: "drone-technology",
    shortName: "Drones",
    name: "Drone Technology",
    shortDescription: "FPV frames, flight controllers, propellers & telemetry radios.",
    fullDescription: "Pixhawk 6C autopilots, F4/F7 flight controllers, 5-inch carbon fiber racing frames, 30A BLDC ESCs, and Gemfan propellers.",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    productCount: 1350,
    color: "#0284C7",
    bgColor: "#E0F2FE",
    subcategories: [
      { id: "sub-drone-frames", slug: "drone-frames", name: "Drone Frames", description: "Carbon fiber quadcopter & hexacopter frame kits.", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80", productCount: 260 },
      { id: "sub-flight-controllers", slug: "flight-controllers", name: "Flight Controllers", description: "APM 2.8, Pixhawk 2.4.8, Betaflight F4/F7 controllers.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 310 },
      { id: "sub-props-motors", slug: "propellers-motors", name: "Propellers & ESC", description: "1045 propellers, Gemfan 5-inch, 30A 4-in-1 ESCs.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", productCount: 390 },
      { id: "sub-transmitters", slug: "transmitters-receivers", name: "Transmitters & Radios", description: "FlySky FS-i6X, ELRS receivers & telemetry radios.", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80", productCount: 220 },
    ],
  },

  // 13. 3D Printing & Accessories
  {
    id: "cat-3d-printing",
    slug: "3d-printing",
    shortName: "3D Printing",
    name: "3D Printing & Accessories",
    shortDescription: "PLA/ABS filaments, nozzles, hotends, extruders & build plates.",
    fullDescription: "Premium 1.75mm PLA filaments, brass & hardened steel nozzles, Creality/Ender hotend assemblies, PEI spring steel magnetic beds.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    productCount: 1100,
    color: "#DB2777",
    bgColor: "#FDF2F8",
    subcategories: [
      { id: "sub-filaments", slug: "filaments", name: "Filaments", description: "1.75mm PLA, ABS, PETG, TPU flexible filaments.", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", productCount: 380 },
      { id: "sub-nozzles-hotends", slug: "nozzles-hotends", name: "Nozzles & Hot Ends", description: "0.4mm MK8 nozzles, V6 all-metal hotends, heater blocks.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 320 },
      { id: "sub-beds-extruders", slug: "build-plates-extruders", name: "Build Plates & Extruders", description: "PEI magnetic textured sheets, dual-gear extruders.", image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80", productCount: 240 },
    ],
  },

  // 14. Educational & STEM
  {
    id: "cat-educational-stem",
    slug: "educational-stem",
    shortName: "STEM Kits",
    name: "Educational & STEM",
    shortDescription: "STEM learning kits, science experiment sets & school lab modules.",
    fullDescription: "Structured curriculum-aligned STEM kits, electronics fundamentals sets, DIY robotics learning boxes for school & university students.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    productCount: 890,
    color: "#10B981",
    bgColor: "#ECFDF5",
    subcategories: [
      { id: "sub-stem-kits", slug: "stem-kits", name: "STEM Learning Kits", description: "Hands-on physics, electronics & programming starter packs.", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80", productCount: 310 },
      { id: "sub-science-kits", slug: "science-kits", name: "Science & Lab Kits", description: "Solar energy kits, electromagnetism experiments.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 290 },
      { id: "sub-school-kits", slug: "school-lab-kits", name: "School Lab Kits", description: "Classroom bulk kits with manuals and lesson plans.", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80", productCount: 190 },
    ],
  },

  // 15. Project Kits
  {
    id: "cat-project-kits",
    slug: "project-kits",
    shortName: "Projects",
    name: "Project Kits",
    shortDescription: "Arduino, IoT, automation & final-year academic project packages.",
    fullDescription: "Turnkey project hardware bundles with source code, circuit diagrams, and components for home automation, obstacle avoidance, and IoT monitors.",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    productCount: 1150,
    color: "#8B5CF6",
    bgColor: "#F3E8FF",
    subcategories: [
      { id: "sub-iot-projects", slug: "iot-project-kits", name: "IoT Project Kits", description: "Smart weather station, agriculture & home automation.", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80", productCount: 390 },
      { id: "sub-robot-projects", slug: "robotics-project-kits", name: "Robotics Project Kits", description: "Bluetooth controlled car, robotic arm & maze solver.", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80", productCount: 360 },
      { id: "sub-final-year", slug: "final-year-projects", name: "Final Year Engineering Kits", description: "Advanced AI, renewable energy & automation projects.", image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80", productCount: 280 },
    ],
  },

  // 16. Industrial Automation
  {
    id: "cat-industrial-automation",
    slug: "industrial-automation",
    shortName: "Automation",
    name: "Industrial Automation",
    shortDescription: "PLCs, HMIs, proximity sensors, relays, contactors & DIN rail modules.",
    fullDescription: "Industrial automation hardware, micro PLCs, touch HMIs, 24V industrial proximity switches, solid state relays, and DIN-rail power modules.",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80",
    productCount: 920,
    color: "#0F766E",
    bgColor: "#CCFBF1",
    subcategories: [
      { id: "sub-plc-hmi", slug: "plc-hmi", name: "PLCs & HMIs", description: "Micro PLCs, expansion cards & color HMI touch panels.", image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80", productCount: 310 },
      { id: "sub-ind-sensors", slug: "industrial-sensors", name: "Industrial Sensors", description: "Inductive proximity, optical photoelectric & limit switches.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 340 },
      { id: "sub-contactors", slug: "relays-contactors", name: "Relays & Contactors", description: "DIN-rail solid state relays, 24V DC industrial contactors.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 210 },
    ],
  },

  // 17. Hardware & Tools
  {
    id: "cat-hardware-tools",
    slug: "hardware-tools",
    shortName: "Tools",
    name: "Hardware & Tools",
    shortDescription: "Soldering irons, digital multimeters, wire strippers & screwdrivers.",
    fullDescription: "60W temperature-controlled soldering stations, solder wire, digital auto-ranging multimeters, wire strippers, tweezers & precision screwdrivers.",
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80",
    productCount: 1650,
    color: "#B45309",
    bgColor: "#FEF3C7",
    subcategories: [
      { id: "sub-soldering", slug: "soldering-tools", name: "Soldering Tools", description: "Soldering irons, flux, wick, desoldering pumps & brass cleaners.", image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80", productCount: 480 },
      { id: "sub-multimeters", slug: "multimeters-testing", name: "Multimeters & Testing", description: "Digital multimeters, logic analyzers & oscilloscope probes.", image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80", productCount: 390 },
      { id: "sub-hand-tools", slug: "hand-tools-cutters", name: "Hand Tools & Cutters", description: "Precision flush cutters, wire strippers & screwdriver sets.", image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80", productCount: 490 },
    ],
  },

  // 18. Displays & Input Devices
  {
    id: "cat-displays-input",
    slug: "displays-input-devices",
    shortName: "Displays",
    name: "Displays & Input Devices",
    shortDescription: "16x2 LCDs, OLED, TFT SPI screens, keypads & touch interfaces.",
    fullDescription: "I2C 1602 character LCDs, 0.96-inch SSD1306 OLEDs, Nextion HMI displays, matrix keypads, and joystick controllers.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    productCount: 1250,
    color: "#0369A1",
    bgColor: "#E0F2FE",
    subcategories: [
      { id: "sub-lcd-oled", slug: "lcd-oled-displays", name: "LCD & OLED Displays", description: "16x2 I2C LCD, 20x4 LCD, 0.96-inch & 1.3-inch OLED screens.", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80", productCount: 440 },
      { id: "sub-tft-touch", slug: "tft-touch-displays", name: "TFT & Touch Displays", description: "2.4-inch, 3.5-inch SPI/DSI TFT LCDs & Nextion displays.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", productCount: 380 },
      { id: "sub-keypads-input", slug: "keypads-joysticks", name: "Keypads & Input Devices", description: "4x4 matrix membrane keypads, analog joystick modules.", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80", productCount: 310 },
    ],
  },

  // 19. Communication & Networking
  {
    id: "cat-comm-networking",
    slug: "communication-networking",
    shortName: "Networking",
    name: "Communication & Networking",
    shortDescription: "Ethernet shields, RS485, CAN bus, UART & industrial adapters.",
    fullDescription: "W5500 Ethernet controllers, MAX485 differential transceivers, MCP2515 CAN bus modules, and isolated USB-to-RS232 bridges.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    productCount: 860,
    color: "#4338CA",
    bgColor: "#E0E7FF",
    subcategories: [
      { id: "sub-ethernet", slug: "ethernet-modules", name: "Ethernet Modules", description: "ENC28J60, W5500 & RJ45 breakout networking boards.", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80", productCount: 290 },
      { id: "sub-serial-bus", slug: "serial-can-rs485", name: "RS485 & CAN Bus", description: "MAX485, SN65HVD230 CAN transceivers & isolated converters.", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80", productCount: 340 },
    ],
  },

  // 20. Accessories & Miscellaneous
  {
    id: "cat-accessories-misc",
    slug: "accessories-miscellaneous",
    shortName: "Accessories",
    name: "Accessories & Miscellaneous",
    shortDescription: "Breadboards, prototype PCBs, heatsinks, cooling fans & enclosures.",
    fullDescription: "830-point solderless breadboards, perfboards, copper clad PCBs, aluminum heatsink assortments, and electronics project boxes.",
    image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=800&q=80",
    productCount: 1490,
    color: "#64748B",
    bgColor: "#F1F5F9",
    subcategories: [
      { id: "sub-breadboards", slug: "breadboards-pcbs", name: "Breadboards & Perfboards", description: "400/830-tie point breadboards, single/double sided PCBs.", image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80", productCount: 460 },
      { id: "sub-heatsinks-fans", slug: "heatsinks-cooling", name: "Heatsinks & Cooling Fans", description: "5V/12V brushless fans, thermal paste & adhesive heatsinks.", image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80", productCount: 380 },
      { id: "sub-enclosures", slug: "project-enclosures", name: "Enclosures & Boxes", description: "Waterproof ABS plastic enclosures & junction boxes.", image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80", productCount: 390 },
    ],
  },
];

export const COLLECTION_ECOSYSTEMS = [
  {
    id: "eco-robotics",
    title: "Robotics & Manipulators Ecosystem",
    description: "Explore 6-DOF robotic arm manipulators, SLAM LiDAR rovers, and metal gear servos built for research labs.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1000&q=80",
    categorySlug: "robotics",
    tag: "INDUSTRIAL SPEC",
  },
  {
    id: "eco-arduino",
    title: "Arduino & Microcontroller Platform",
    description: "Official ATmega328P UNO boards, ESP32 dual-core Wi-Fi, and Raspberry Pi 5 single board computers.",
    image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1000&q=80",
    categorySlug: "arduino-development-boards",
    tag: "DEVELOPER SPEC",
  },
  {
    id: "eco-drones",
    title: "UAV Aerial Drone Hardware",
    description: "Pixhawk 6C autopilots, SimonK 30A ESC speed controls, BLDC motors, and MavLink 2.0 telemetry radios.",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80",
    categorySlug: "drone-technology",
    tag: "AERIAL SPEC",
  },
];
