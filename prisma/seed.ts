import { PrismaClient, StaffRole, StaffStatus } from '@prisma/client';
import { PRODUCTS, CATEGORIES } from '../src/data/mockData';
import bcrypt from 'bcryptjs';

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

// ─────────────────────────────────────────────────────────────────────────────
// Seed Physical Stores
// ─────────────────────────────────────────────────────────────────────────────
async function seedStores() {
  console.log('\n🏪 Seeding Physical Stores...');

  const stores = [
    {
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
      operatingHours: '09:30 AM - 08:30 PM (7 Days)',
      status: 'Operational',
      totalStockUnits: 8450,
      monthlyWalkInRevenue: 1285000,
    },
    {
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
      operatingHours: '10:00 AM - 08:00 PM (Mon - Sat)',
      status: 'Operational',
      totalStockUnits: 1420,
      monthlyWalkInRevenue: 435000,
    },
    {
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
      operatingHours: '10:00 AM - 07:30 PM (Mon - Sat)',
      status: 'Operational',
      totalStockUnits: 980,
      monthlyWalkInRevenue: 610000,
    },
    {
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
      operatingHours: '10:00 AM - 08:00 PM',
      status: 'Coming Soon',
      totalStockUnits: 0,
      monthlyWalkInRevenue: 0,
    },
  ];

  const storeRecords: Record<string, { id: string }> = {};

  for (const store of stores) {
    const record = await prisma.store.upsert({
      where: { code: store.code },
      update: { ...store },
      create: { ...store },
    });
    storeRecords[store.code] = record;
    console.log(`  ✓ Store: ${record.name} (${record.code})`);
  }

  return storeRecords;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed Staff Users
// ─────────────────────────────────────────────────────────────────────────────
async function seedStaffUsers(storeRecords: Record<string, { id: string }>) {
  console.log('\n👤 Seeding Staff Users...');

  const superAdminHash = await bcrypt.hash('admin123', 10);
  const managerHash    = await bcrypt.hash('manager123', 10);
  const kioskHash      = await bcrypt.hash('kiosk123', 10);

  const staffUsers = [
    // ── SUPER ADMIN ──────────────────────────────────────────────────────────
    {
      name: 'System Administrator',
      email: 'admin@prayogindia.com',
      username: 'superadmin',
      passwordHash: superAdminHash,
      role: StaffRole.SUPER_ADMIN,
      storeId: null,
      phone: '+91 99999 88888',
      status: StaffStatus.ACTIVE,
    },
    // ── STORE MANAGERS ───────────────────────────────────────────────────────
    {
      name: 'Abhishek Kumar',
      email: 'ranchi.manager@prayogindia.com',
      username: 'ranchi_manager',
      passwordHash: managerHash,
      role: StaffRole.STORE_MANAGER,
      storeId: storeRecords['RANCHI']?.id ?? null,
      phone: '+91 94301 11111',
      status: StaffStatus.ACTIVE,
    },
    {
      name: 'Jay Prakash',
      email: 'patna.manager@prayogindia.com',
      username: 'patna_manager',
      passwordHash: managerHash,
      role: StaffRole.STORE_MANAGER,
      storeId: storeRecords['PATNA']?.id ?? null,
      phone: '+91 94302 22222',
      status: StaffStatus.ACTIVE,
    },
    {
      name: 'Vikramaditya Sahay',
      email: 'delhi.manager@prayogindia.com',
      username: 'delhi_manager',
      passwordHash: managerHash,
      role: StaffRole.STORE_MANAGER,
      storeId: storeRecords['DELHI']?.id ?? null,
      phone: '+91 94303 33333',
      status: StaffStatus.ACTIVE,
    },
    // ── KIOSK USERS (one per operational store) ───────────────────────────────
    {
      name: 'Ranchi Kiosk',
      email: null,
      username: 'ranchi_kiosk',
      passwordHash: kioskHash,
      role: StaffRole.KIOSK_USER,
      storeId: storeRecords['RANCHI']?.id ?? null,
      phone: null,
      status: StaffStatus.ACTIVE,
    },
    {
      name: 'Patna Kiosk',
      email: null,
      username: 'patna_kiosk',
      passwordHash: kioskHash,
      role: StaffRole.KIOSK_USER,
      storeId: storeRecords['PATNA']?.id ?? null,
      phone: null,
      status: StaffStatus.ACTIVE,
    },
    {
      name: 'Delhi Kiosk',
      email: null,
      username: 'delhi_kiosk',
      passwordHash: kioskHash,
      role: StaffRole.KIOSK_USER,
      storeId: storeRecords['DELHI']?.id ?? null,
      phone: null,
      status: StaffStatus.ACTIVE,
    },
  ];

  for (const staff of staffUsers) {
    await prisma.staffUser.upsert({
      where: { username: staff.username },
      update: {
        name: staff.name,
        role: staff.role,
        storeId: staff.storeId,
        status: staff.status,
        phone: staff.phone,
      },
      create: staff as any,
    });
    console.log(`  ✓ Staff: ${staff.name} [${staff.role}] — @${staff.username}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed Categories + Products (existing logic)
// ─────────────────────────────────────────────────────────────────────────────
async function seedDatabase() {
  console.log('🌱 Starting Prayog India Database Seed...');

  // 1. Seed Stores
  const storeRecords = await seedStores();

  // 2. Seed Staff Users
  await seedStaffUsers(storeRecords);

  // 3. Seed Categories
  console.log('\n📦 Seeding Categories & Products...');
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
    console.log(`  ✓ Category: ${record.name}`);
  }

  // 4. Seed Products
  let createdCount = 0;
  let updatedCount = 0;

  for (const prod of PRODUCTS) {
    const categoryRecord = categoryRecords[prod.category];
    if (!categoryRecord) {
      console.warn(`  ⚠️ Category not found for product: ${prod.name}`);
      continue;
    }

    const slug = prod.slug || prod.id;
    const existing = await prisma.product.findUnique({ where: { sku: prod.sku } });

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
      await prisma.product.create({
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
            create: [{ imageUrl: prod.image, altText: prod.name, sortOrder: 0 }],
          },
        },
      });
      createdCount++;
    }
  }

  console.log(`\n🎉 Seed Complete: ${createdCount} products created, ${updatedCount} updated.`);
  console.log('\n📋 Default Staff Credentials:');
  console.log('  SUPER_ADMIN  → superadmin / admin123');
  console.log('  STORE_MANAGER → ranchi_manager / manager123');
  console.log('  STORE_MANAGER → patna_manager / manager123');
  console.log('  KIOSK_USER   → ranchi_kiosk / kiosk123');
}

seedDatabase()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

