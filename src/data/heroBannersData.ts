export interface HeroBanner {
  id: string;
  badge: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle?: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  image: string;
  alt: string;
  noteLines?: string[];
  displayOrder: number;
  isActive: boolean;
  showTextOverlay?: boolean;
  theme?: "blue-gradient" | "dark-slate" | "pure-light" | "vibrant-tech";
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: "banner-1791886998567",
    badge: "",
    titlePrefix: "",
    titleHighlight: "",
    subtitle: "",
    description: "",
    primaryButtonText: "Shop Now",
    primaryButtonLink: "/products",
    secondaryButtonText: "",
    secondaryButtonLink: "",
    image: "https://res.cloudinary.com/fyueflvh/image/upload/v1793613676/banners/banners/diwali_sale_with_tech_festivities_1793613673019.webp",
    alt: "Diwali Special Offer - Prayog India",
    noteLines: [],
    displayOrder: 1,
    isActive: true,
    showTextOverlay: false,
    theme: "blue-gradient",
    createdAt: "2026-10-13T10:23:18.608Z",
    updatedAt: "2026-11-02T10:03:07.796Z",
  },
  {
    id: "banner-1791885637209",
    badge: "",
    titlePrefix: "",
    titleHighlight: "",
    subtitle: "",
    description: "",
    primaryButtonText: "Explore Products",
    primaryButtonLink: "/products",
    secondaryButtonText: "",
    secondaryButtonLink: "",
    image: "https://res.cloudinary.com/fyueflvh/image/upload/v1793613233/banners/banners/future_coding_and_robotics_banner_1793613230770.webp",
    alt: "Future Coding and Robotics - Prayog India",
    noteLines: [],
    displayOrder: 2,
    isActive: true,
    showTextOverlay: false,
    theme: "blue-gradient",
    createdAt: "2026-10-13T10:00:37.300Z",
    updatedAt: "2026-11-02T09:53:57.117Z",
  },
];

export function sortHeroBanners(banners: HeroBanner[]): HeroBanner[] {
  return [...banners].sort((a, b) => a.displayOrder - b.displayOrder);
}
