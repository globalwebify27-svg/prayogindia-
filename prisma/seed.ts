import { PrismaClient } from '@prisma/client';
import { PRODUCTS, CATEGORIES } from '../src/data/mockData';

const prisma = new PrismaClient();

const CATEGORY_SLUG_MAP: Record<string, string> = {
  'Arduino & Microcontrollers': 'arduino',
  'Drones & UAV Parts': 'drones',
  'Robotics & DIY Kits': 'robotics',
  'IoT & Wireless Modules': 'iot',
  'Sensors & Electronic Modules': 'sensors',
  'Single Board Computers & Dev Boards': 'devboards',
  'STEM & Educational Kits': 'stem',
  'Motors, Steppers & Drivers': 'motors',
};

export async function seedDatabase() {
  console.log('🌱 Starting Prayog India Database Seed...');

  // 1. Seed Categories
  const categoryRecords: Record<string, any> = {};

  for (const cat of CATEGORIES) {
    const slug = CATEGORY_SLUG_MAP[cat.name] || cat.id;
    const record = await prisma.category.upsert({
      where: { slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
      },
      create: {
        slug,
        name: cat.name,
        description: cat.description,
        image: cat.image,
      },
    });
    categoryRecords[cat.name] = record;
    console.log(`✓ Category synced: ${record.name} (${record.slug})`);
  }

  // 2. Seed Products (80+ products, at least 10 per category)
  let createdCount = 0;
  let updatedCount = 0;

  for (const prod of PRODUCTS) {
    const categoryRecord = categoryRecords[prod.category];
    if (!categoryRecord) {
      console.warn(`⚠️ Warning: Category not found for product "${prod.name}": "${prod.category}"`);
      continue;
    }

    const slug = prod.slug || prod.id;

    const existing = await prisma.product.findUnique({
      where: { sku: prod.sku },
    });

    if (existing) {
      await prisma.product.update({
        where: { sku: prod.sku },
        data: {
          name: prod.name,
          slug,
          description: prod.description || prod.name,
          price: prod.price,
          mrp: prod.mrp,
          inStock: prod.inStock,
          rating: prod.rating || 4.9,
          reviewCount: prod.reviews || 50,
          categoryId: categoryRecord.id,
          brand: prod.brand || 'Prayog India',
          specifications: prod.specs || {},
          features: prod.features || [],
        },
      });
      updatedCount++;
    } else {
      const created = await prisma.product.create({
        data: {
          id: prod.id,
          name: prod.name,
          slug,
          sku: prod.sku,
          description: prod.description || prod.name,
          price: prod.price,
          mrp: prod.mrp,
          inStock: prod.inStock,
          stock: prod.inStock ? 50 : 0,
          rating: prod.rating || 4.9,
          reviewCount: prod.reviews || 50,
          categoryId: categoryRecord.id,
          brand: prod.brand || 'Prayog India',
          specifications: prod.specs || {},
          features: prod.features || [],
          images: {
            create: [
              {
                imageUrl: prod.image,
                altText: prod.name,
                sortOrder: 0,
              },
            ],
          },
        },
      });
      createdCount++;
    }
  }

  console.log(`🎉 Database Seed Completed: ${createdCount} created, ${updatedCount} updated. Total: ${PRODUCTS.length}`);
}

seedDatabase()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
