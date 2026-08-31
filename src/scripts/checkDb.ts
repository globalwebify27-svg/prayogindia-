import { db } from '../lib/db';

async function checkDb() {
  const usersCount = await db.user.count();
  const productsCount = await db.product.count();
  const categoriesCount = await db.category.count();

  console.log('--- DATABASE CONNECTION STATUS ---');
  console.log('✅ PostgreSQL Database: CONNECTED & IN SYNC');
  console.log(`📊 Registered Users: ${usersCount}`);
  console.log(`📦 Seeded Products: ${productsCount}`);
  console.log(`📁 Seeded Categories: ${categoriesCount}`);
  console.log('----------------------------------');
}

checkDb()
  .catch(e => {
    console.error('Database connection test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
