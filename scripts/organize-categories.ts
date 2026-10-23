import { db } from "../src/lib/db";
import { CATEGORIES_HIERARCHY } from "../src/data/categoriesHierarchy";

async function organizeCategories() {
  console.log("=================================================");
  console.log("STARTING TARGET 9-DOMAIN CATEGORY CLEANUP & AUDIT");
  console.log("=================================================");

  const initialProdCount = await db.product.count();
  const initialCatCount = await db.category.count();
  console.log(`Initial DB State: ${initialCatCount} Categories, ${initialProdCount} Products\n`);

  // 1. Step 1: Create or Update the 9 Canonical Parent Categories
  const parentIdMap = new Map<string, string>(); // slug -> id

  for (const parent of CATEGORIES_HIERARCHY) {
    const parentCategory = await db.category.upsert({
      where: { slug: parent.slug },
      update: {
        name: parent.name,
        description: parent.description,
        image: parent.bannerUrl || null,
        parentId: null,
      },
      create: {
        name: parent.name,
        slug: parent.slug,
        description: parent.description,
        image: parent.bannerUrl || null,
        parentId: null,
      },
    });

    parentIdMap.set(parent.slug, parentCategory.id);
    console.log(`✓ Parent Domain [${parent.sortOrder}/9]: ${parent.name} (slug: ${parent.slug})`);

    // 2. Step 2: Create or Update Subcategories
    if (parent.children && parent.children.length > 0) {
      for (const child of parent.children) {
        const subCategory = await db.category.upsert({
          where: { slug: child.slug },
          update: {
            name: child.name,
            description: child.description,
            image: child.bannerUrl || null,
            parentId: parentCategory.id,
          },
          create: {
            name: child.name,
            slug: child.slug,
            description: child.description,
            image: child.bannerUrl || null,
            parentId: parentCategory.id,
          },
        });
        console.log(`   └─ Subcategory: ${child.name} (slug: ${child.slug})`);
      }
    }
  }

  // Set of all allowed target category slugs
  const targetCategorySlugs = new Set<string>();
  for (const parent of CATEGORIES_HIERARCHY) {
    targetCategorySlugs.add(parent.slug);
    if (parent.children) {
      for (const child of parent.children) {
        targetCategorySlugs.add(child.slug);
      }
    }
  }

  console.log(`\nTarget structure defines ${CATEGORIES_HIERARCHY.length} parents and ${targetCategorySlugs.size - CATEGORIES_HIERARCHY.length} subcategories (Total: ${targetCategorySlugs.size}).`);

  // 3. Step 3: Reassign products attached to obsolete or legacy categories
  console.log("\nAuditing and reassigning products to target categories...");

  // Cache all target category records by slug
  const allTargetCats = await db.category.findMany({
    where: { slug: { in: Array.from(targetCategorySlugs) } },
  });
  const slugToId = new Map(allTargetCats.map((c) => [c.slug, c.id]));

  // Get all products with their current category
  const allProducts = await db.product.findMany({
    include: { category: true },
  });

  let reassignedCount = 0;

  for (const product of allProducts) {
    const curCatSlug = product.category.slug;
    const curCatName = product.category.name.toLowerCase();
    const prodName = product.name.toLowerCase();

    // If product is already attached to a valid target category slug, keep it
    if (targetCategorySlugs.has(curCatSlug)) {
      continue;
    }

    // Determine target category slug based on current legacy category or product characteristics
    let targetSlug = "electronic-components"; // fallback

    if (
      curCatSlug === "arduino-microcontrollers" ||
      curCatSlug === "arduino-boards" ||
      prodName.includes("arduino")
    ) {
      targetSlug = "arduino";
    } else if (
      curCatSlug === "raspberry-pi" ||
      prodName.includes("raspberry pi") ||
      prodName.includes("pico")
    ) {
      targetSlug = "raspberry-pi";
    } else if (
      curCatSlug === "development-boards" ||
      curCatSlug === "nvidia-jetson-boards" ||
      prodName.includes("jetson") ||
      prodName.includes("stm32") ||
      prodName.includes("beaglebone") ||
      prodName.includes("orange pi")
    ) {
      targetSlug = "other-development-boards";
    } else if (curCatSlug === "robotics-accessories" || curCatSlug === "robotics") {
      if (prodName.includes("motor") || prodName.includes("driver") || prodName.includes("servo")) {
        targetSlug = "motors-drivers";
      } else if (prodName.includes("wheel") || prodName.includes("tire")) {
        targetSlug = "wheels";
      } else if (prodName.includes("car") || prodName.includes("kit") || prodName.includes("arm") || prodName.includes("rover")) {
        targetSlug = "robot-kits";
      } else {
        targetSlug = "robotics-accessories";
      }
    } else if (curCatSlug === "drone-technology" || curCatSlug === "drones") {
      if (prodName.includes("motor")) targetSlug = "motors";
      else if (prodName.includes("esc")) targetSlug = "esc";
      else if (prodName.includes("gps")) targetSlug = "gps-modules";
      else if (prodName.includes("propeller") || prodName.includes("props")) targetSlug = "propellers";
      else if (prodName.includes("camera")) targetSlug = "cameras";
      else if (prodName.includes("battery") || prodName.includes("lipo")) targetSlug = "batteries";
      else targetSlug = "flight-controllers";
    } else if (curCatSlug === "sensors-electronic-modules" || curCatSlug === "sensors") {
      targetSlug = "sensors-modules";
    } else if (curCatSlug === "iot-wireless-modules" || curCatSlug === "iot") {
      targetSlug = "iot-products";
    } else if (curCatSlug === "stem-kits" || curCatSlug === "educational-toys") {
      targetSlug = "stem-kits";
    } else if (curCatSlug === "batteries") {
      targetSlug = "batteries";
    } else if (curCatSlug === "mechanical-products" || curCatSlug === "mechanical-components") {
      targetSlug = "mechanical-products";
    } else if (curCatSlug === "3d-printing-accessories" || curCatSlug === "3d-accessories") {
      targetSlug = "3d-accessories";
    } else if (curCatSlug === "connectors" || curCatSlug === "cables-connectors") {
      targetSlug = "connectors";
    } else if (curCatSlug === "industrial-automation") {
      targetSlug = "industrial-automation-products";
    } else if (curCatSlug === "cameras") {
      targetSlug = "cameras";
    }

    const newCategoryId = slugToId.get(targetSlug);
    if (newCategoryId && newCategoryId !== product.categoryId) {
      await db.product.update({
        where: { id: product.id },
        data: { categoryId: newCategoryId },
      });
      reassignedCount++;
      console.log(`  ↪ Reassigned "${product.name.slice(0, 40)}..." from [${curCatSlug}] to [${targetSlug}]`);
    }
  }

  console.log(`\nReassignment complete: ${reassignedCount} products remapped to target categories.`);

  // 4. Step 4: Safely remove obsolete categories that have 0 products attached
  console.log("\nChecking for obsolete categories with zero product dependencies...");
  const obsoleteCategories = await db.category.findMany({
    where: {
      slug: { notIn: Array.from(targetCategorySlugs) },
    },
    include: {
      _count: { select: { products: true, children: true } },
    },
  });

  console.log(`Found ${obsoleteCategories.length} obsolete/non-target category records.`);

  // Remove child categories first, then parents to respect FK constraint
  let deletedCount = 0;
  // Level 1: Child obsolete categories
  for (const cat of obsoleteCategories.filter((c) => c.parentId !== null)) {
    if (cat._count.products > 0) {
      console.warn(`  ⚠️ Unsafe to delete category ${cat.name} (${cat.slug}) — still has ${cat._count.products} products.`);
      continue;
    }
    await db.category.delete({ where: { id: cat.id } });
    deletedCount++;
    console.log(`  🗑 Deleted obsolete subcategory: ${cat.name} (${cat.slug})`);
  }

  // Level 2: Parent obsolete categories
  for (const cat of obsoleteCategories.filter((c) => c.parentId === null)) {
    if (cat._count.products > 0) {
      console.warn(`  ⚠️ Unsafe to delete category ${cat.name} (${cat.slug}) — still has ${cat._count.products} products.`);
      continue;
    }
    // Check if any children remain
    const remainingChildren = await db.category.count({ where: { parentId: cat.id } });
    if (remainingChildren > 0) {
      await db.category.updateMany({ where: { parentId: cat.id }, data: { parentId: null } });
    }
    await db.category.delete({ where: { id: cat.id } });
    deletedCount++;
    console.log(`  🗑 Deleted obsolete parent category: ${cat.name} (${cat.slug})`);
  }

  // 5. Final Audit & Integrity Check
  const finalProdCount = await db.product.count();
  const finalCatCount = await db.category.count();
  const finalRoots = await db.category.count({ where: { parentId: null } });
  const finalSubs = await db.category.count({ where: { NOT: { parentId: null } } });

  console.log("\n=================================================");
  console.log("FINAL AUDIT & INTEGRITY REPORT");
  console.log("=================================================");
  console.log(`Total Categories in DB: ${finalCatCount} (Roots: ${finalRoots}, Subcategories: ${finalSubs})`);
  console.log(`Total Products in DB:   ${finalProdCount} (Initial: ${initialProdCount}) - DATA PRESERVED: ${finalProdCount === initialProdCount ? "YES ✓" : "NO ✗"}`);
  console.log(`Categories Deleted:     ${deletedCount}`);

  // Product distribution per target category
  const distribution = await db.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          _count: { select: { products: true } },
        },
      },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  console.log("\nCategory Distribution Summary:");
  for (const parent of distribution) {
    const totalChildProducts = parent.children.reduce((acc, c) => acc + c._count.products, 0);
    console.log(`• ${parent.name} (Direct: ${parent._count.products}, Via Subcategories: ${totalChildProducts})`);
    for (const child of parent.children) {
      console.log(`    - ${child.name}: ${child._count.products} products`);
    }
  }

  console.log("\nSynchronization finished successfully!");
}

organizeCategories()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
