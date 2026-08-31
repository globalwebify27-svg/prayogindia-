export type CustomerType = 
  | 'B2C Customer'
  | 'B2B Customer'
  | 'Walk-in Customer'
  | 'Registered Customer'
  | 'Guest Customer';

export type CustomerTypeCode = 'B2C' | 'B2B' | 'WALK_IN' | 'REGISTERED' | 'GUEST';

export interface CustomerTypeRule {
  id: CustomerTypeCode;
  name: CustomerType;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;

  // 1. Pricing Rule
  pricing: {
    ruleName: string;
    discountPercent: number; // General discount off catalog/MRP
    minOrderForWholesale?: number;
    description: string;
  };

  // 2. Promotions Rule
  promotions: {
    eligibleCoupons: string[];
    allowPublicPromos: boolean;
    allowWholesalePromos: boolean;
    description: string;
  };

  // 3. Invoice Rule
  invoice: {
    type: 'TAX_INVOICE_B2B' | 'RETAIL_INVOICE_B2C' | 'POS_THERMAL_RECEIPT' | 'MEMBER_TAX_INVOICE' | 'GUEST_EXPRESS_RECEIPT';
    label: string;
    requiresGSTIN: boolean;
    requiresStoreDeviceId: boolean;
    includesLoyaltyLedger: boolean;
    description: string;
  };

  // 4. Reports & Analytics Rule
  reports: {
    segmentName: string;
    channelAttribution: 'ONLINE' | 'INSTITUTIONAL' | 'STORE_POS' | 'OMNICHANNEL';
    trackLTV: boolean;
    description: string;
  };

  // 5. Applicable Rewards Rule
  rewards: {
    coinsPerHundredRs: number; // 1 Prayog Coin per X amount
    allowCoinRedemption: boolean;
    redemptionRate: number; // 1 coin = ₹0.50
    specialPerk: string;
    description: string;
  };
}

export const CUSTOMER_TYPE_RULES: Record<CustomerTypeCode, CustomerTypeRule> = {
  B2C: {
    id: 'B2C',
    name: 'B2C Customer',
    badgeColor: 'text-slate-700',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-300',
    description: 'Standard retail consumer purchasing through website or mobile app for hobby or personal tinkering.',
    pricing: {
      ruleName: 'Standard Retail Price',
      discountPercent: 0,
      description: 'Standard catalog price and publicly listed manufacturer discounts.',
    },
    promotions: {
      eligibleCoupons: ['WELCOME10', 'ROBOTICS50', 'FESTIVE5'],
      allowPublicPromos: true,
      allowWholesalePromos: false,
      description: 'Eligible for sitewide public promotional coupon codes.',
    },
    invoice: {
      type: 'RETAIL_INVOICE_B2C',
      label: 'Retail Consumer Bill (B2C)',
      requiresGSTIN: false,
      requiresStoreDeviceId: false,
      includesLoyaltyLedger: false,
      description: 'Standard consumer retail invoice with CGST/SGST/IGST tax breakup.',
    },
    reports: {
      segmentName: 'Retail Consumer (B2C)',
      channelAttribution: 'ONLINE',
      trackLTV: true,
      description: 'Tracks retail cart conversion, average basket size, and organic repurchase rate.',
    },
    rewards: {
      coinsPerHundredRs: 1, // 1 coin per ₹100
      allowCoinRedemption: true,
      redemptionRate: 0.5,
      specialPerk: 'Standard 1% Cashback Coins',
      description: 'Earns 1 Prayog Coin per ₹100 spent on qualifying hardware kits.',
    },
  },

  B2B: {
    id: 'B2B',
    name: 'B2B Customer',
    badgeColor: 'text-[#00AEEF]',
    badgeBg: 'bg-sky-50',
    badgeBorder: 'border-sky-200',
    description: 'Corporate, university, school, or research lab account with official GSTIN and bulk institutional purchase terms.',
    pricing: {
      ruleName: 'Wholesale / Tier Volume Pricing',
      discountPercent: 15, // 15% wholesale discount on eligible items
      minOrderForWholesale: 10000,
      description: '15% institutional procurement discount with Input Tax Credit (ITC) eligibility.',
    },
    promotions: {
      eligibleCoupons: ['B2BINSTITUTE', 'BULKSTEM20', 'LABSETUP15', 'GOVTECH10'],
      allowPublicPromos: false,
      allowWholesalePromos: true,
      description: 'Eligible for institutional volume coupons and custom purchase-order agreements.',
    },
    invoice: {
      type: 'TAX_INVOICE_B2B',
      label: 'Formal B2B Tax Invoice',
      requiresGSTIN: true,
      requiresStoreDeviceId: false,
      includesLoyaltyLedger: false,
      description: 'Official GST Tax Invoice containing Buyer GSTIN, Company Name, Place of Supply, and HSN/SAC codes.',
    },
    reports: {
      segmentName: 'Institutional B2B',
      channelAttribution: 'INSTITUTIONAL',
      trackLTV: true,
      description: 'Institutional volume pipeline, quotation conversion rate, and credit term compliance.',
    },
    rewards: {
      coinsPerHundredRs: 2, // 2 coins per ₹100 for commercial accounts
      allowCoinRedemption: true,
      redemptionRate: 0.5,
      specialPerk: 'Institutional Rebates & 30-Day Credit Terms',
      description: 'Commercial procurement volume rebates and credit terms.',
    },
  },

  WALK_IN: {
    id: 'WALK_IN',
    name: 'Walk-in Customer',
    badgeColor: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    description: 'In-store physical customer checked out at Ranchi/Patna/Delhi experience center POS.',
    pricing: {
      ruleName: 'In-Store POS Special Pricing',
      discountPercent: 5, // 5% in-store instant promotional discount
      description: 'In-store special pricing, cash round-off benefits, and local walk-in deals.',
    },
    promotions: {
      eligibleCoupons: ['STORECASH50', 'RANCHIPOS', 'LOCALSTORE5', 'WALKIN100'],
      allowPublicPromos: true,
      allowWholesalePromos: false,
      description: 'Eligible for physical store scratch vouchers and point-of-sale promo codes.',
    },
    invoice: {
      type: 'POS_THERMAL_RECEIPT',
      label: 'In-Store POS Thermal Slip',
      requiresGSTIN: false,
      requiresStoreDeviceId: true,
      includesLoyaltyLedger: false,
      description: 'Point-of-sale thermal or digital slip with Store ID, Device Token, and Cash/UPI/Card split.',
    },
    reports: {
      segmentName: 'Retail Walk-in (POS)',
      channelAttribution: 'STORE_POS',
      trackLTV: false,
      description: 'In-store daily cash register ledger, device authorization logs, and local walk-in footfall.',
    },
    rewards: {
      coinsPerHundredRs: 1,
      allowCoinRedemption: true,
      redemptionRate: 0.5,
      specialPerk: 'Physical Stamp Card & WhatsApp Cashbacks',
      description: 'Instant WhatsApp receipt cashback tokens and physical stamp card verification.',
    },
  },

  REGISTERED: {
    id: 'REGISTERED',
    name: 'Registered Customer',
    badgeColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    description: 'Verified account holder with saved shipping addresses, order history, and Prayog Coin wallet.',
    pricing: {
      ruleName: 'Member Loyalty Pricing',
      discountPercent: 5, // 5% member loyalty discount
      description: 'Exclusive 5% registered member discount plus dynamic Prayog Coin redemption.',
    },
    promotions: {
      eligibleCoupons: ['WELCOME10', 'MEMBERPERK', 'VIPCOIN100', 'BIRTHDAY20', 'ROBOTICS50'],
      allowPublicPromos: true,
      allowWholesalePromos: false,
      description: 'Full access to public promotions plus member-only VIP coupon codes.',
    },
    invoice: {
      type: 'MEMBER_TAX_INVOICE',
      label: 'Registered Member Tax Invoice',
      requiresGSTIN: false,
      requiresStoreDeviceId: false,
      includesLoyaltyLedger: true,
      description: 'Comprehensive tax invoice featuring Loyalty Points Earned, Redeemed, and Closing Coin Balance.',
    },
    reports: {
      segmentName: 'Verified Member Account',
      channelAttribution: 'OMNICHANNEL',
      trackLTV: true,
      description: 'Customer lifetime value, repeat retention rate, and loyalty point velocity.',
    },
    rewards: {
      coinsPerHundredRs: 2,
      allowCoinRedemption: true,
      redemptionRate: 0.5,
      specialPerk: '2x Prayog Coins + Early Hardware Access',
      description: '2 Prayog Coins per ₹100 spent, priority express dispatch, and lab workshop tickets.',
    },
  },

  GUEST: {
    id: 'GUEST',
    name: 'Guest Customer',
    badgeColor: 'text-zinc-600',
    badgeBg: 'bg-zinc-100',
    badgeBorder: 'border-zinc-300',
    description: 'Express non-registered buyer with one-click checkout and automatic account provisioning.',
    pricing: {
      ruleName: 'Standard Express Retail',
      discountPercent: 0,
      description: 'Standard retail catalogue pricing with fast checkout.',
    },
    promotions: {
      eligibleCoupons: ['WELCOME10'],
      allowPublicPromos: true,
      allowWholesalePromos: false,
      description: 'Eligible for first-purchase welcome coupon upon email verification.',
    },
    invoice: {
      type: 'GUEST_EXPRESS_RECEIPT',
      label: 'Guest Purchase Receipt',
      requiresGSTIN: false,
      requiresStoreDeviceId: false,
      includesLoyaltyLedger: false,
      description: 'Express guest receipt including a secure one-click link to claim and activate account.',
    },
    reports: {
      segmentName: 'Guest Checkout',
      channelAttribution: 'ONLINE',
      trackLTV: false,
      description: 'Guest cart abandonment rate and guest-to-registered account conversion funnel.',
    },
    rewards: {
      coinsPerHundredRs: 1,
      allowCoinRedemption: false, // Locked until claimed
      redemptionRate: 0.5,
      specialPerk: 'Escrow Coins Claimable upon Sign-up',
      description: 'Reward points earned during checkout are held in escrow and credited upon password setup.',
    },
  },
};

/**
 * Maps any CustomerType string to standard CustomerTypeCode
 */
export function getCustomerTypeCode(type: string): CustomerTypeCode {
  const normalized = type.toUpperCase().trim();
  if (normalized.includes('B2B') || normalized.includes('INSTITUTIONAL')) return 'B2B';
  if (normalized.includes('WALK') || normalized.includes('POS') || normalized.includes('STORE')) return 'WALK_IN';
  if (normalized.includes('REGISTERED') || normalized.includes('MEMBER')) return 'REGISTERED';
  if (normalized.includes('GUEST')) return 'GUEST';
  return 'B2C';
}

/**
 * Calculates effective unit price based on customer type rules and optional quantity
 */
export function calculateCustomerPrice(
  basePrice: number,
  customerType: CustomerType | CustomerTypeCode,
  quantity: number = 1
): { unitPrice: number; discountAmount: number; discountPercent: number; ruleName: string } {
  const code = typeof customerType === 'string' && customerType in CUSTOMER_TYPE_RULES 
    ? (customerType as CustomerTypeCode) 
    : getCustomerTypeCode(customerType);
  
  const rule = CUSTOMER_TYPE_RULES[code];
  let discountPercent = rule.pricing.discountPercent;

  // Extra tier discount for B2B on high volume
  if (code === 'B2B' && quantity >= 10) {
    discountPercent = Math.min(25, discountPercent + 5);
  }

  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const unitPrice = Math.max(0, basePrice - discountAmount);

  return {
    unitPrice,
    discountAmount,
    discountPercent,
    ruleName: rule.pricing.ruleName,
  };
}

/**
 * Validates whether a coupon code is eligible for a specific customer type
 */
export function isCouponEligibleForCustomer(
  couponCode: string,
  customerType: CustomerType | CustomerTypeCode
): { eligible: boolean; message: string; discountPercent?: number } {
  const code = typeof customerType === 'string' && customerType in CUSTOMER_TYPE_RULES
    ? (customerType as CustomerTypeCode)
    : getCustomerTypeCode(customerType);

  const rule = CUSTOMER_TYPE_RULES[code];
  const upperCoupon = couponCode.toUpperCase().trim();

  if (rule.promotions.eligibleCoupons.includes(upperCoupon)) {
    return {
      eligible: true,
      message: `Coupon "${upperCoupon}" applied successfully for ${rule.name}.`,
      discountPercent: upperCoupon.includes('20') ? 20 : upperCoupon.includes('50') ? 50 : 10,
    };
  }

  // Check if coupon belongs to another exclusive customer type
  for (const [otherCode, otherRule] of Object.entries(CUSTOMER_TYPE_RULES)) {
    if (otherCode !== code && otherRule.promotions.eligibleCoupons.includes(upperCoupon)) {
      return {
        eligible: false,
        message: `Coupon "${upperCoupon}" is exclusive to ${otherRule.name} accounts.`,
      };
    }
  }

  return {
    eligible: false,
    message: `Coupon "${upperCoupon}" is invalid or expired.`,
  };
}

/**
 * Calculates reward coins earned on order total
 */
export function calculateEarnedRewards(
  orderTotal: number,
  customerType: CustomerType | CustomerTypeCode
): { coinsEarned: number; rupeeValue: number; specialPerk: string } {
  const code = typeof customerType === 'string' && customerType in CUSTOMER_TYPE_RULES
    ? (customerType as CustomerTypeCode)
    : getCustomerTypeCode(customerType);

  const rule = CUSTOMER_TYPE_RULES[code];
  const coinsEarned = Math.floor((orderTotal / 100) * rule.rewards.coinsPerHundredRs);
  const rupeeValue = coinsEarned * rule.rewards.redemptionRate;

  return {
    coinsEarned,
    rupeeValue,
    specialPerk: rule.rewards.specialPerk,
  };
}
