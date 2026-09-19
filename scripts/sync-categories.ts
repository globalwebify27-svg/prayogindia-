import { db } from "../src/lib/db";
import { CATEGORIES_HIERARCHY } from "../src/data/categoriesHierarchy";

async function syncCategories() {
  console.log("Starting full 16-domain category synchronization...");

  for (const parent of CATEGORIES_HIERARCHY) {
    // 1. Upsert Parent Category
    const parentSlug = parent.slug;
    const parentCategory = await db.category.upsert({
      where: { slug: parentSlug },
      update: {
        name: parent.name,
        description: parent.description,
        image: parent.bannerUrl || null,
        parentId: null,
      },
      create: {
        name: parent.name,
        slug: parentSlug,
        description: parent.description,
        image: parent.bannerUrl || null,
        parentId: null,
      },
    });

    console.log(`✓ Parent: ${parent.name} (${parentCategory.id})`);

    // 2. Upsert Children Subcategories
    if (parent.children && parent.children.length > 0) {
      for (const child of parent.children) {
        const childSlug = child.slug;
        const subCategory = await db.category.upsert({
          where: { slug: childSlug },
          update: {
            name: child.name,
            description: child.description,
            image: child.bannerUrl || null,
            parentId: parentCategory.id,
          },
          create: {
            name: child.name,
            slug: childSlug,
            description: child.description,
            image: child.bannerUrl || null,
            parentId: parentCategory.id,
          },
        });

        console.log(`  └─ Subcategory: ${child.name} (${subCategory.id})`);

        // 3. Upsert Nested Level 2 if present
        if (child.children && child.children.length > 0) {
          for (const nested of child.children) {
            const nestedSlug = nested.slug;
            await db.category.upsert({
              where: { slug: nestedSlug },
              update: {
                name: nested.name,
                description: nested.description,
                image: nested.bannerUrl || null,
                parentId: subCategory.id,
              },
              create: {
                name: nested.name,
                slug: nestedSlug,
                description: nested.description,
                image: nested.bannerUrl || null,
                parentId: subCategory.id,
              },
            });
            console.log(`     └─ Nested: ${nested.name}`);
          }
        }
      }
    }
  }

  // Count summary
  const total = await db.category.count();
  const roots = await db.category.count({ where: { parentId: null } });
  const children = await db.category.count({ where: { NOT: { parentId: null } } });
  console.log(`\nSynchronization complete!`);
  console.log(`Total Categories in DB: ${total}`);
  console.log(`Parent Domains: ${roots}`);
  console.log(`Subcategories & Nested: ${children}`);
}

syncCategories()
  .catch((err) => {
    console.error("Sync error:", err);
  })
  .finally(() => db.$disconnect());
