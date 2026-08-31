export interface RewardPointsRule {
  id: string;
  name: string;
  customerType: 'All' | 'Registered Customer' | 'B2B Customer' | 'B2C Customer';
  pointsPer100Spent: number; // e.g. 1 pt per ₹100
  redemptionRateRupees: number; // e.g. 1 pt = ₹0.50
  minRedemptionPoints: number; // min points to redeem at checkout
  maxRedemptionPercentage: number; // max % of subtotal that can be paid via points (e.g. 20%)
  validityDays: number; // expiry days (e.g. 365 days)
  registrationBonus: number; // welcome bonus points
  isActive: boolean;
}

export interface PointsLedgerEntry {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  type: 'Earned' | 'Redeemed' | 'Registration Bonus' | 'Admin Adjustment' | 'Expired';
  points: number;
  orderNumber?: string;
  date: string;
  expiryDate?: string;
  notes: string;
}

// Configurable Admin Loyalty Rules
export const DEFAULT_REWARD_RULES: RewardPointsRule[] = [
  {
    id: 'rule-standard',
    name: 'Standard Maker Loyalty Tier',
    customerType: 'Registered Customer',
    pointsPer100Spent: 1, // 1 point per ₹100
    redemptionRateRupees: 0.50, // 1 point = ₹0.50
    minRedemptionPoints: 50, // Min 50 points
    maxRedemptionPercentage: 25, // Up to 25% of subtotal
    validityDays: 365,
    registrationBonus: 100,
    isActive: true,
  },
  {
    id: 'rule-b2b',
    name: 'B2B & Institutional Labs Tier',
    customerType: 'B2B Customer',
    pointsPer100Spent: 2, // 2 points per ₹100
    redemptionRateRupees: 0.50,
    minRedemptionPoints: 100,
    maxRedemptionPercentage: 15,
    validityDays: 730,
    registrationBonus: 250,
    isActive: true,
  },
  {
    id: 'rule-b2c',
    name: 'Retail B2C Shopper Tier',
    customerType: 'B2C Customer',
    pointsPer100Spent: 1,
    redemptionRateRupees: 0.50,
    minRedemptionPoints: 50,
    maxRedemptionPercentage: 20,
    validityDays: 365,
    registrationBonus: 50,
    isActive: true,
  },
];

// Activity Ledger Entries
export const INITIAL_POINTS_LEDGER: PointsLedgerEntry[] = [
  {
    id: 'ledg-101',
    userEmail: 'om.prakash@prayogindia.com',
    userName: 'Dr. Om Prakash',
    type: 'Registration Bonus',
    points: 100,
    date: '2026-08-10',
    expiryDate: '2027-08-10',
    notes: 'Welcome reward bonus for creating a verified Prayog account.',
  },
  {
    id: 'ledg-102',
    userEmail: 'om.prakash@prayogindia.com',
    userName: 'Dr. Om Prakash',
    type: 'Earned',
    points: 145,
    orderNumber: 'PRG-2026-8941',
    date: '2026-08-24',
    expiryDate: '2027-08-24',
    notes: '1% loyalty reward points earned on hardware order PRG-2026-8941.',
  },
  {
    id: 'ledg-103',
    userEmail: 'om.prakash@prayogindia.com',
    userName: 'Dr. Om Prakash',
    type: 'Admin Adjustment',
    points: 1000,
    date: '2026-08-25',
    expiryDate: '2027-08-25',
    notes: 'Granted for University Lab Hardware Feedback Submission by Admin desk.',
  },
];
