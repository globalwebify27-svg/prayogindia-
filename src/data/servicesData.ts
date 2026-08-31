export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  image: string;
  bannerImage: string;
  description: string;
  features: string[];
  applications: string[];
  gallery: string[];
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'stem-lab-setup',
    slug: 'stem-lab-setup',
    name: 'STEM Lab Setup',
    shortDescription: 'Turnkey K-12 STEM & Tinkering laboratory setup with curriculums, microcontrollers, sensor kits, and trainer certification.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    description: 'Prayog India provides end-to-end turnkey STEM (Science, Technology, Engineering, & Mathematics) Innovation Lab setups for schools and educational institutions. We equip institutions with modular workbenches, microchip kits, 3D printers, and structured hands-on curriculums.',
    features: [
      'Turnkey STEM Workbench Hardware & ESD Equipment Installation.',
      'Comprehensive K-12 Hands-on Experiential Learning Curriculum.',
      'Arduino, Raspberry Pi, and IoT Sensor Component Bundles.',
      'Faculty Training & Educator Certification Workshops.',
      'Annual Maintenance Support & Component Replacement Guarantee.'
    ],
    applications: [
      'K-12 School STEM Laboratories & Atal Tinkering Labs (ATL)',
      'Undergraduate Engineering Innovation & Maker Spaces',
      'Vocational Skill Development Centers',
      'Private STEM Coaching Academies'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'robotics-lab-setup',
    slug: 'robotics-lab-setup',
    name: 'Robotics Lab Setup',
    shortDescription: 'Advanced mechatronics, mobile robotics, ROS integration, and industrial manipulator arm lab installations.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    description: 'Complete Robotics & Mechatronics research lab design for polytechnics and universities. Outfitted with ROS-compatible mobile platforms, 6-DOF robotic arms, LiDAR navigation modules, and real-time motor control benches.',
    features: [
      'ROS & ROS2-Native Mobile Autonomous Robot Chassis.',
      '6-Axis Industrial Robotic Manipulators & Servo Controllers.',
      'LiDAR, ToF, and Stereo Vision Sensor Integration.',
      'MATLAB Simulink & Python Embedded Control Environment.',
      'Standard Operating Manuals & Safety Enclosures.'
    ],
    applications: [
      'Mechatronics & Robotics Engineering Departments',
      'Autonomous AGV Warehouse Vehicle Research',
      'University Robotics Competition Arena Setup',
      'Industrial Automation Training Hubs'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'drone-lab-setup',
    slug: 'drone-lab-setup',
    name: 'Drone Lab Setup',
    shortDescription: 'UAV assembly, flight controller tuning, telemetry calibration, and pilot simulation training facilities.',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80',
    description: 'Institutional Drone Technology & Unmanned Aerial Vehicle (UAV) lab infrastructure. Includes Pixhawk 6C testing rigs, ESC calibration stations, RF spectrum analyzers, and indoor safety mesh flight nets.',
    features: [
      'Custom Quadcopter & Fixed-Wing UAV DIY Kits.',
      'Pixhawk & ArduPilot Flight Controller Calibration Workbenches.',
      'Outdoor RF Telemetry & Ground Control Station Setup.',
      'Indoor Drone Safety Net Cage Enclosure.',
      'DGCA Certification Orientation & Flight Simulator Software.'
    ],
    applications: [
      'Aeronautical & Aerospace University Laboratories',
      'Precision Agriculture Drone Research Facilities',
      'Defence & Security UAV Prototyping Units',
      'Drone Pilot Training Academies'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'industrial-projects',
    slug: 'industrial-projects',
    name: 'Industrial Projects',
    shortDescription: 'Custom embedded systems development, IoT telemetry, industrial automation, and hardware prototyping.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    description: 'Prayog India executes specialized industrial hardware engineering projects for manufacturing units, defense startups, and IoT enterprises. From custom PCB layout to firmware deployment.',
    features: [
      'Custom Multi-layer PCB Layout Design & Prototyping.',
      'Industrial Modbus, CAN Bus, and RS485 Telemetry Nodes.',
      'Firmware Engineering (C/C++, ESP-IDF, FreeRTOS).',
      'IP67 Ruggedized Enclosure Design & 3D Printing.',
      'Pre-compliance EMC/EMI Testing Guidance.'
    ],
    applications: [
      'Smart Factory Industry 4.0 Telemetry Monitoring',
      'Commercial Electric Vehicle (EV) Battery BMS Prototyping',
      'Agritech Remote Sensor Gateways',
      'Custom Defense Mechatronic Actuators'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'consultancy',
    slug: 'consultancy',
    name: 'Consultancy',
    shortDescription: 'Technical advisorship for curriculum design, procurement planning, lab accreditation, and research grants.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    bannerImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    description: 'Expert technical consultancy services for academic leadership, government departments, and corporate CSR wings seeking to establish state-of-the-art technology initiatives.',
    features: [
      'Curriculum Alignment with NEP 2020 & Global STEM Standards.',
      'BOQ (Bill of Quantities) & Technical Procurement Planning.',
      'NAAC / NBA Accreditation Lab Audit & Documentation.',
      'Research Grant Proposal Technical Drafting.',
      'CSR STEM Education Project Execution Strategy.'
    ],
    applications: [
      'University Deans & Department Heads',
      'Corporate Social Responsibility (CSR) Foundations',
      'State Skill Development Missions',
      'EdTech Hardware Product Teams'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'
    ]
  }
];
