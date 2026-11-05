export interface ProductPromoBanner {
  id: string;
  title: string;
  subtitle: string;
  tagText: string;
  couponCode: string;
  phoneBadgeText: string;
  phoneTitle: string;
  redirectUrl: string;
  googlePlayUrl?: string;
  appStoreUrl?: string;
  bannerImageUrl?: string;
  useCustomImage: boolean;
  isActive: boolean;
  updatedAt?: string;
}

export const DEFAULT_PRODUCT_PROMO_BANNER: ProductPromoBanner = {
  id: "product-promo-1",
  title: "ORDER ON PRAYOG APP",
  subtitle: "ROBOTICS AT YOUR FINGERTIPS",
  tagText: "GET FLAT 5% OFF",
  couponCode: "PRGAPP",
  phoneBadgeText: "5% OFF",
  phoneTitle: "APP 2.0",
  redirectUrl: "/download",
  googlePlayUrl: "https://play.google.com/store/apps",
  appStoreUrl: "https://apps.apple.com",
  bannerImageUrl: "",
  useCustomImage: false,
  isActive: true,
  updatedAt: "2026-11-04T10:00:00.000Z",
};

