import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enableRowLevelSecurity() {
  console.log('🔒 Enabling Row Level Security (RLS) on all public tables...\n');

  try {
    // 1. Fetch all public tables excluding internal migration tables
    const tables: { tablename: string; rowsecurity: boolean }[] = await prisma.$queryRawUnsafe(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT LIKE '_prisma%'
      ORDER BY tablename ASC;
    `);

    if (!tables.length) {
      console.log('⚠️ No public tables found in the database.');
      return;
    }

    console.log(`Found ${tables.length} tables in public schema.\n`);

    let enabledCount = 0;
    let alreadyEnabledCount = 0;

    for (const table of tables) {
      const tableName = table.tablename;
      const isAlreadyEnabled = table.rowsecurity;

      // Enable RLS
      await prisma.$executeRawUnsafe(`ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY;`);

      if (isAlreadyEnabled) {
        alreadyEnabledCount++;
        console.log(`  ✓ Table "${tableName}" RLS was already ACTIVE (re-confirmed)`);
      } else {
        enabledCount++;
        console.log(`  🚀 Table "${tableName}" RLS successfully ENABLED`);
      }
    }

    // 2. Fetch updated status
    const verifiedTables: { tablename: string; rowsecurity: boolean }[] = await prisma.$queryRawUnsafe(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT LIKE '_prisma%'
      ORDER BY tablename ASC;
    `);

    console.log('\n================ RLS STATUS SUMMARY ================');
    console.table(
      verifiedTables.map((t) => ({
        Table: t.tablename,
        'RLS Status': t.rowsecurity ? 'ENABLED (ON) ✅' : 'DISABLED ❌',
      }))
    );

    console.log(`\n🎉 Row Level Security configuration complete:`);
    console.log(`   - Total tables checked: ${verifiedTables.length}`);
    console.log(`   - Newly enabled: ${enabledCount}`);
    console.log(`   - Already enabled: ${alreadyEnabledCount}`);
    console.log(`   - All tables now have RLS = ON`);
  } catch (error) {
    console.error('❌ Error enabling Row Level Security:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

enableRowLevelSecurity();
