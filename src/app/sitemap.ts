import { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/mockData";
import { SERVICES_DATA } from "@/data/servicesData";
import { OFFERS_DATA } from "@/data/offersData";
import { JOB_OPENINGS } from "@/data/companyData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://prayogindia.com";

  const staticRoutes = [
    "",
    "/categories",
    "/products",
    "/services",
    "/offers",
    "/about",
    "/contact",
    "/careers",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  let productRoutes = PRODUCTS.map((p) => ({
    url: `${baseUrl}/products/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@/lib/db");
      const dbProducts = await db.product.findMany({
        select: { slug: true, updatedAt: true },
        take: 200,
      });
      if (dbProducts.length > 0) {
        productRoutes = dbProducts.map((p) => ({
          url: `${baseUrl}/products/${p.slug}`,
          lastModified: p.updatedAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
      }
    } catch {
      // Fall back to mock product routes
    }
  }

  const serviceRoutes = SERVICES_DATA.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const offerRoutes = OFFERS_DATA.map((o) => ({
    url: `${baseUrl}/offers/${o.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const careerRoutes = JOB_OPENINGS.map((j) => ({
    url: `${baseUrl}/careers/${j.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...serviceRoutes,
    ...offerRoutes,
    ...careerRoutes,
  ];
}
