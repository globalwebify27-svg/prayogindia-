export interface StoreDevice {
  id: string;
  deviceName: string;
  deviceModel: string;
  token: string;
  assignedStaff: string;
  status: 'Active / Paired' | 'Suspended' | 'Pending Activation';
  lastActiveAt: string;
}

export interface PhysicalStoreBranch {
  id: string;
  code: 'RANCHI' | 'PATNA' | 'DELHI' | 'MUMBAI' | string;
  name: string;
  type: 'Central Main Hub & Store' | 'Physical Branch Store';
  isCentralHub: boolean;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPhone: string;
  contactEmail: string;
  storeManager: string;
  operatingHours: string;
  status: 'Operational' | 'Coming Soon' | 'Maintenance';
  authorizedDevices: StoreDevice[];
  totalStockUnits: number;
  monthlyWalkInRevenue: number;
}

export const INITIAL_STORES: PhysicalStoreBranch[] = [
  {
    id: 'str-ranchi-01',
    code: 'RANCHI',
    name: 'Prayog India Ranchi Main Branch & Central Hub',
    type: 'Central Main Hub & Store',
    isCentralHub: true,
    address: 'Plot 42, Tech Innovation Corridor, Main Road',
    city: 'Ranchi',
    state: 'Jharkhand',
    pincode: '834001',
    contactPhone: '+91 94311 02931',
    contactEmail: 'ranchi.hub@prayogindia.com',
    storeManager: 'Abhishek Kumar',
    operatingHours: '09:30 AM - 08:30 PM (7 Days)',
    status: 'Operational',
    totalStockUnits: 8450,
    monthlyWalkInRevenue: 1285000,
    authorizedDevices: [
      {
        id: 'dev-rnc-01',
        deviceName: 'Front POS Terminal 1',
        deviceModel: 'Apple iPad Pro 11" (Store Counter)',
        token: 'PRG_POS_AUTH_RNC_TAB01',
        assignedStaff: 'Shahnawaz Abbas',
        status: 'Active / Paired',
        lastActiveAt: 'Just now',
      },
      {
        id: 'dev-rnc-02',
        deviceName: 'B2B Quotation Desk Tablet',
        deviceModel: 'Samsung Galaxy Tab S9',
        token: 'PRG_POS_AUTH_RNC_TAB02',
        assignedStaff: 'Emraan Hassan',
        status: 'Active / Paired',
        lastActiveAt: '12 mins ago',
      },
    ],
  },
  {
    id: 'str-patna-02',
    code: 'PATNA',
    name: 'Prayog India Patna Robotics & STEM Branch',
    type: 'Physical Branch Store',
    isCentralHub: false,
    address: 'Boring Road Tech Plaza, Near Science College',
    city: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    contactPhone: '+91 98123 45678',
    contactEmail: 'patna.branch@prayogindia.com',
    storeManager: 'Jay Prakash',
    operatingHours: '10:00 AM - 08:00 PM (Mon - Sat)',
    status: 'Operational',
    totalStockUnits: 1420,
    monthlyWalkInRevenue: 435000,
    authorizedDevices: [
      {
        id: 'dev-pat-01',
        deviceName: 'Patna Billing Desk Tab',
        deviceModel: 'iPad Air 5th Gen',
        token: 'PRG_POS_AUTH_PAT_TAB01',
        assignedStaff: 'Rohan Mehta',
        status: 'Active / Paired',
        lastActiveAt: '25 mins ago',
      },
    ],
  },
  {
    id: 'str-delhi-03',
    code: 'DELHI',
    name: 'Prayog India NCR Innovation Center',
    type: 'Physical Branch Store',
    isCentralHub: false,
    address: 'Okhla Industrial Area Phase-III',
    city: 'New Delhi',
    state: 'Delhi NCR',
    pincode: '110020',
    contactPhone: '+91 98333 44455',
    contactEmail: 'delhi.ncr@prayogindia.com',
    storeManager: 'Vikramaditya Sahay',
    operatingHours: '10:00 AM - 07:30 PM (Mon - Sat)',
    status: 'Operational',
    totalStockUnits: 980,
    monthlyWalkInRevenue: 610000,
    authorizedDevices: [
      {
        id: 'dev-del-01',
        deviceName: 'NCR Retail Counter Tab',
        deviceModel: 'Lenovo Tab P12 Pro',
        token: 'PRG_POS_AUTH_DEL_TAB01',
        assignedStaff: 'Anjali Singhal',
        status: 'Active / Paired',
        lastActiveAt: '1 hour ago',
      },
    ],
  },
  {
    id: 'str-mumbai-04',
    code: 'MUMBAI',
    name: 'Prayog India Mumbai Drone Hub',
    type: 'Physical Branch Store',
    isCentralHub: false,
    address: 'MIDC Andheri East, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400093',
    contactPhone: '+91 98999 11223',
    contactEmail: 'mumbai@prayogindia.com',
    storeManager: 'Siddharth Rao',
    operatingHours: '10:00 AM - 08:00 PM',
    status: 'Coming Soon',
    totalStockUnits: 0,
    monthlyWalkInRevenue: 0,
    authorizedDevices: [],
  },
];
