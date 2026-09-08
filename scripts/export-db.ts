import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log('📦 Exporting all database tables...');

  const exportData = {
    exportedAt: new Date().toISOString(),
    database: 'prayog_db',
    tables: {
      stores: await prisma.store.findMany(),
      storeInventory: await prisma.storeInventory.findMany(),
      storeProductSettings: await prisma.storeProductSettings.findMany(),
      devices: await prisma.device.findMany(),
      inventoryTransactions: await prisma.inventoryTransaction.findMany(),
      stockTransfers: await prisma.stockTransfer.findMany({
        include: { items: true },
      }),
      staffUsers: await prisma.staffUser.findMany(),
      users: await prisma.user.findMany({
        include: { addresses: true },
      }),
      categories: await prisma.category.findMany(),
      products: await prisma.product.findMany({
        include: { variants: true, images: true },
      }),
      carts: await prisma.cart.findMany({
        include: { items: true },
      }),
      wishlists: await prisma.wishlist.findMany({
        include: { items: true },
      }),
      orders: await prisma.order.findMany({
        include: { items: true, shipment: true },
      }),
      services: await prisma.service.findMany({
        include: { enquiries: true },
      }),
      learningContent: await prisma.learningContent.findMany(),
      offers: await prisma.offer.findMany({
        include: { products: true },
      }),
      supportTickets: await prisma.supportTicket.findMany({
        include: { messages: true },
      }),
      notifications: await prisma.notification.findMany(),
    },
  };

  const counts = Object.fromEntries(
    Object.entries(exportData.tables).map(([k, v]) => [k, (v as unknown[]).length])
  );

  const timestampFilename = `prayog_db_backup_${timestamp}.json`;
  const latestFilename = 'prayog_db_backup_latest.json';

  const fullPath = path.join(backupDir, timestampFilename);
  const latestPath = path.join(backupDir, latestFilename);

  fs.writeFileSync(fullPath, JSON.stringify(exportData, null, 2), 'utf-8');
  fs.writeFileSync(latestPath, JSON.stringify(exportData, null, 2), 'utf-8');

  console.log('\n✅ Database Export Complete!');
  console.log(`📁 Timestamp Backup: backups/${timestampFilename}`);
  console.log(`📁 Latest Snapshot: backups/${latestFilename}`);
  console.log('\nSummary:');
  console.table(counts);
}

exportDatabase()
  .catch((err) => {
    console.error('❌ Error during database export:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
