import { db } from "../lib/db";
import { hashPassword } from "../lib/authUtils";
import { PRODUCTS, CATEGORIES } from "../data/mockData";
import { Role } from "@prisma/client";

async function seed() {
  console.log("🌱 SEEDING PRAYOG INDIA POSTGRESQL DATABASE...");

  // 1. Seed Default Admin Account
  const adminEmail = "admin@prayogindia.com";
  const adminPassHash = await hashPassword("admin123");

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" as Role },
    create: {
      name: "System Administrator",
      email: adminEmail,
      phone: "+91 99999 88888",
      passwordHash: adminPassHash,
      role: "ADMIN" as Role,
    },
  });
  console.log(`✅ Admin Account Created/Verified: ${admin.email}`);

  // 2. Seed Categories
  for (const cat of CATEGORIES) {
    const slug = cat.id || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await db.category.upsert({
      where: { slug },
      update: { name: cat.name },
      create: {
        name: cat.name,
        slug,
        description: cat.description || `Category for ${cat.name}`,
        image: cat.image || null,
      },
    });
  }
  console.log(`✅ ${CATEGORIES.length} Categories Seeded`);

  // 3. Seed Products
  const firstCat = await db.category.findFirst();
  if (firstCat) {
    for (const prod of PRODUCTS) {
      const slug = prod.slug || prod.id;
      await db.product.upsert({
        where: { slug },
        update: {
          price: prod.price,
          mrp: prod.mrp || null,
          stock: (prod as any).stock || 20,
          inStock: prod.inStock !== false,
        },
        create: {
          name: prod.name,
          slug,
          sku: prod.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
          description: prod.description || prod.name,
          price: prod.price,
          mrp: prod.mrp || null,
          stock: (prod as any).stock || 20,
          inStock: prod.inStock !== false,
          brand: prod.brand || "Prayog India",
          categoryId: firstCat.id,
        },
      });
    }
    console.log(`✅ ${PRODUCTS.length} Products Seeded`);
  }

  console.log("🚀 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
}

seed()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
