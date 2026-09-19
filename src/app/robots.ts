import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/store/",
        "/storemanager/",
        "/kiosk/",
        "/store-pos/",
        "/walk-in/",
        "/account/",
        "/checkout/",
        "/cart/",
        "/login",
        "/login-staff",
        "/register",
        "/forgot-password",
        "/verify-otp",
        "/api/",
      ],
    },
    sitemap: "https://prayogindia.com/sitemap.xml",
  };
}
