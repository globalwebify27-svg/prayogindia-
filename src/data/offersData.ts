export interface OfferItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  image: string;
  badge: 'ACTIVE' | 'UPCOMING' | 'FEATURED';
  status: 'Active' | 'Upcoming' | 'Expired';
  startDate: string;
  endDate: string;
  couponCode?: string;
  customerEligibility?: string;
  productIds: string[];
}

export const OFFERS_DATA: OfferItem[] = [
  {
    id: 'off-monsoon-stem-2026',
    slug: 'monsoon-stem-lab-bundle-deal',
    title: 'Monsoon STEM & Robotics Bundle Offer',
    shortDescription: 'Get 25% catalogue discount on complete Arduino UNO R3, flight controllers, and ultrasonic sensor bundles.',
    image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=1000&q=80',
    badge: 'FEATURED',
    status: 'Active',
    startDate: '01 Aug 2026',
    endDate: '31 Aug 2026',
    couponCode: 'PRAYOG10',
    customerEligibility: 'All Customers (B2C & B2B)',
    productIds: ['ard-uno-r3', 'ard-mega-2560', 'pixhawk-6c', 'lipo-4s-5200']
  },
  {
    id: 'off-institutional-lab-setup',
    slug: 'institutional-lab-invoicing-special',
    title: 'Institutional B2B Invoicing Special',
    shortDescription: 'Flat ₹500 instant checkout voucher on engineering college lab setup & multi-pack developer kits.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    badge: 'ACTIVE',
    status: 'Active',
    startDate: '15 Aug 2026',
    endDate: '15 Sep 2026',
    couponCode: 'MAKER500',
    customerEligibility: 'Institutional & Registered Customers',
    productIds: ['prayog-bot-kit', 'pixhawk-6c', 'esc-4in1-45a']
  },
  {
    id: 'off-uav-drone-fest',
    slug: 'drone-flight-controller-fest',
    title: 'Upcoming UAV Flight Controller Fest',
    shortDescription: 'Special pricing launch for Pixhawk flight controllers, 4-in-1 ESCs, and carbon fiber propeller sets.',
    image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1000&q=80',
    badge: 'UPCOMING',
    status: 'Upcoming',
    startDate: '01 Sep 2026',
    endDate: '15 Sep 2026',
    customerEligibility: 'All Registered Customers',
    productIds: ['pixhawk-6c', 'esc-4in1-45a', 'lipo-4s-5200']
  }
];
