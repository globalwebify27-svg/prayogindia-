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
  salaryRange?: string;
  tags?: string[];
  isFeatured?: boolean;
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
  phone: "+91 87097 89641",
  email: "support@prayogindia.com",
  whatsapp: "+918709789641",
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
    salaryRange: "₹7.5 - 12 LPA",
    tags: ["ROS2", "Robotic Arms", "Field Calibration", "Python", "Sensors"],
    isFeatured: true,
    shortDescription:
      "Lead turnkey STEM & Robotics laboratory hardware installations across universities, innovation hubs, and engineering institutions.",
    responsibilities: [
      "Install, calibrate, and verify ROS2 mobile robot platforms and 6-DOF manipulator arms.",
      "Conduct educator onboarding workshops and faculty technical training sessions.",
      "Troubleshoot microcontroller, sensor telemetry, and power electronics kits.",
      "Collaborate with institutional lab directors on custom curriculum and hardware integration.",
    ],
    requirements: [
      "B.Tech / M.Tech in Mechatronics, Electrical, or Robotics Engineering.",
      "Proficiency in C/C++, Python, ROS2, and microcontroller bootloaders (ATmega, ESP32).",
      "Willingness to travel for institutional lab setups across India.",
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
    salaryRange: "₹8.0 - 14 LPA",
    tags: ["FreeRTOS", "STM32", "ESP32-S3", "KiCAD", "Bare-Metal C"],
    isFeatured: true,
    shortDescription:
      "Develop real-time C/C++ firmware and bootloaders for custom IoT sensors, motor drivers, and UAV telemetry modules.",
    responsibilities: [
      "Write FreeRTOS & Bare-metal C/C++ firmware for ESP32 and STM32 microcontrollers.",
      "Design PCB schematics and multi-layer layouts using KiCAD or Altium Designer.",
      "Test Pixhawk MavLink protocol communications and sensor fusion filters.",
      "Perform hardware debugging using digital oscilloscopes, logic analyzers, and JTAG emulators.",
    ],
    requirements: [
      "Bachelor’s degree in Electronics & Communication (ECE) or Embedded Systems.",
      "Hands-on experience with Oscilloscopes, Logic Analyzers, SPI, I2C, UART, and CAN Bus.",
      "Familiarity with Git and embedded build systems like PlatformIO or CMake.",
    ],
  },
  {
    id: "job-3",
    slug: "autonomous-drone-flight-controls-engineer",
    title: "Autonomous Drone & UAV Flight Controls Engineer",
    department: "Flight Systems & Avionics",
    location: "Bengaluru, Karnataka (Lab & Flying Field)",
    type: "Full-time",
    experience: "2 - 5 Years",
    salaryRange: "₹10 - 18 LPA",
    tags: ["PX4 / ArduPilot", "MAVLink", "PID Tuning", "GPS RTK", "Gazebo"],
    isFeatured: true,
    shortDescription:
      "Architect and tune autonomous flight control algorithms, fail-safe state machines, and obstacle avoidance payloads for commercial quadcopters and fixed-wing UAVs.",
    responsibilities: [
      "Tune cascade PID and EKF2 state estimators on PX4 and ArduPilot autopilot platforms.",
      "Integrate precision GPS-RTK, LIDAR rangefinders, and companion computer payloads.",
      "Conduct outdoor flight test campaigns, telemetry log analysis, and aerodynamic optimizations.",
    ],
    requirements: [
      "Degree in Aerospace, Avionics, Electrical, or Robotics Engineering.",
      "Demonstrated track record of building and flying custom multirotors or VTOL aircraft.",
      "Proficiency with Python/C++, QGroundControl, and MAVLink protocol.",
    ],
  },
  {
    id: "job-4",
    slug: "ros2-computer-vision-engineer",
    title: "ROS2 Robotics Software & Computer Vision Engineer",
    department: "Autonomous Systems & AI",
    location: "Bengaluru, Karnataka",
    type: "Full-time",
    experience: "2 - 4 Years",
    salaryRange: "₹9.0 - 16 LPA",
    tags: ["ROS2 Humble", "OpenCV", "SLAM / Nav2", "YOLOv8", "Nvidia Jetson"],
    isFeatured: false,
    shortDescription:
      "Deploy SLAM navigation, 3D point cloud processing, and deep learning vision models on edge compute platforms (NVIDIA Jetson, Raspberry Pi 5) for ground rover robotics.",
    responsibilities: [
      "Implement real-time obstacle detection and semantic segmentation using PyTorch and TensorRT.",
      "Build ROS2 node pipelines for Nav2 autonomous path planning, costmaps, and localization.",
      "Simulate mobile robot kinematic dynamics in Gazebo / Isaac Sim before physical test bench deployment.",
    ],
    requirements: [
      "Hands-on experience with ROS2 Humble / Iron, Nav2, and Linux kernel drivers.",
      "Strong proficiency in C++17/20, Python, OpenCV, and point-cloud libraries.",
      "Experience optimizing neural nets for embedded edge accelerators.",
    ],
  },
  {
    id: "job-5",
    slug: "mechanical-mechatronics-cad-engineer",
    title: "Mechanical & Mechatronics CAD Design Engineer",
    department: "Mechanical Design & Prototyping",
    location: "Bengaluru, Karnataka (Tech Hub Lab)",
    type: "Full-time",
    experience: "1 - 3 Years",
    salaryRange: "₹6.5 - 11 LPA",
    tags: ["SolidWorks", "FEA Analysis", "CNC Machining", "3D Printing", "Mechatronics"],
    isFeatured: false,
    shortDescription:
      "Design rugged chassis enclosures, carbon-fiber drone arm mounts, planetary gearboxes, and injection molded robotics kits built for educational and industrial duty.",
    responsibilities: [
      "Create parametric 3D CAD assemblies and GD&T production drawings in SolidWorks or Fusion 360.",
      "Perform stress FEA and thermal simulations on robotic arm joints and high-torque motor housings.",
      "Operate in-house SLA/FDM 3D printers and liaise with CNC machine shops for batch fabrication.",
    ],
    requirements: [
      "B.Tech in Mechanical Engineering, Production, or Mechatronics.",
      "Thorough understanding of manufacturing processes (DMLS, CNC, Sheet Metal, Injection Molding).",
      "Passionate maker with a physical portfolio of functional mechanisms or robotic systems.",
    ],
  },
];
