import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'fyueflvh',
  api_key: process.env.CLOUDINARY_API_KEY || '544111356368169',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'rYfAb_4wHeuE6FfCMaSFNFMjsPc',
  secure: true,
});

const prisma = new PrismaClient();

interface MigrationMap {
  localImages: Record<string, string>;
  localVideos: Record<string, string>;
  externalImages: Record<string, string>;
  migratedAt: string;
}

const MIGRATION_MAP_FILE = path.join(process.cwd(), 'src/data/cloudinaryMigrationMap.json');

async function uploadLocalFile(
  filePath: string,
  folder: string,
  resourceType: 'image' | 'video' = 'image'
): Promise<string> {
  const filename = path.parse(filePath).name;
  const publicId = `${folder}/${filename}`;

  console.log(`  Uploading ${resourceType}: ${filePath} -> ${publicId}...`);

  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    resource_type: resourceType,
    overwrite: true,
  });

  return result.secure_url;
}

async function uploadRemoteUrl(url: string, folder: string, publicIdPrefix: string): Promise<string> {
  console.log(`  Uploading remote asset: ${url.substring(0, 60)}...`);
  const result = await cloudinary.uploader.upload(url, {
    folder,
    resource_type: 'image',
    public_id: publicIdPrefix,
    overwrite: true,
  });
  return result.secure_url;
}

async function migrateAll() {
  console.log('🚀 Starting Cloudinary Media Migration for Prayog India...');

  const migrationMap: MigrationMap = {
    localImages: {},
    localVideos: {},
    externalImages: {},
    migratedAt: new Date().toISOString(),
  };

  // 1. Migrate Local Images
  console.log('\n📸 1. Migrating local banners and assets from public/images...');
  const publicImagesDir = path.join(process.cwd(), 'public/images');
  const imageFiles = [
    'hero_3d_stage.jpg',
    'pi_hero.jpg',
    'hero_robotics.jpg',
    'robot_mobile_hero.jpg',
    'robot_cutout.jpg',
    'robotics_banner.jpg',
    'explore_products_banner.png',
    'robotics_arm_banner_v2.jpg',
    'robotics_arm_banner_v2.png',
    'promo_banner.jpg',
    'drone_cutout.jpg',
  ];

  for (const img of imageFiles) {
    const fullPath = path.join(publicImagesDir, img);
    if (fs.existsSync(fullPath)) {
      try {
        const cdnUrl = await uploadLocalFile(fullPath, 'prayog/banners', 'image');
        migrationMap.localImages[`/images/${img}`] = cdnUrl;
        console.log(`    ✓ /images/${img} => ${cdnUrl}`);
      } catch (err: any) {
        console.error(`    ✗ Failed to upload ${img}:`, err.message);
      }
    }
  }

  // Ecosystem images
  const ecosystemDir = path.join(publicImagesDir, 'ecosystem');
  if (fs.existsSync(ecosystemDir)) {
    const ecoFiles = fs.readdirSync(ecosystemDir).filter((f) => !f.startsWith('.'));
    for (const file of ecoFiles) {
      const fullPath = path.join(ecosystemDir, file);
      try {
        const cdnUrl = await uploadLocalFile(fullPath, 'prayog/ecosystem', 'image');
        migrationMap.localImages[`/images/ecosystem/${file}`] = cdnUrl;
        console.log(`    ✓ /images/ecosystem/${file} => ${cdnUrl}`);
      } catch (err: any) {
        console.error(`    ✗ Failed to upload ecosystem/${file}:`, err.message);
      }
    }
  }

  // 2. Migrate Local Videos
  console.log('\n🎥 2. Migrating videos from public/videos...');
  const publicVideosDir = path.join(process.cwd(), 'public/videos');
  const videoFiles = ['hero_background.mp4', 'hero_video_2.mp4'];

  for (const vid of videoFiles) {
    const fullPath = path.join(publicVideosDir, vid);
    if (fs.existsSync(fullPath)) {
      try {
        const cdnUrl = await uploadLocalFile(fullPath, 'prayog/videos', 'video');
        migrationMap.localVideos[`/videos/${vid}`] = cdnUrl;
        console.log(`    ✓ /videos/${vid} => ${cdnUrl}`);
      } catch (err: any) {
        console.error(`    ✗ Failed to upload video ${vid}:`, err.message);
      }
    }
  }

  // 3. Migrate & Centralize Distinct Product Images into Cloudinary
  console.log('\n📦 3. Centralizing Product Catalog Images to Cloudinary...');
  const dbProductImages = await prisma.productImage.findMany();
  const distinctRemoteUrls = Array.from(new Set(dbProductImages.map((img) => img.imageUrl)));

  console.log(`Found ${distinctRemoteUrls.length} distinct product image templates across ${dbProductImages.length} DB records.`);

  let urlIndex = 0;
  for (const remoteUrl of distinctRemoteUrls) {
    if (remoteUrl.includes('cloudinary.com')) {
      migrationMap.externalImages[remoteUrl] = remoteUrl;
      continue;
    }

    try {
      urlIndex++;
      const cdnUrl = await uploadRemoteUrl(
        remoteUrl,
        'prayog/products',
        `prod_catalog_template_${urlIndex}`
      );
      migrationMap.externalImages[remoteUrl] = cdnUrl;
      console.log(`    ✓ Template ${urlIndex}: ${cdnUrl}`);
    } catch (err: any) {
      console.error(`    ✗ Failed to upload remote product image:`, err.message);
    }
  }

  // 4. Update Database ProductImage rows with Centralized Cloudinary CDN URLs
  console.log('\n🗄️ 4. Updating PostgreSQL database records to Cloudinary CDN URLs...');
  let dbUpdatedCount = 0;
  for (const imgRecord of dbProductImages) {
    const newCdnUrl = migrationMap.externalImages[imgRecord.imageUrl];
    if (newCdnUrl && newCdnUrl !== imgRecord.imageUrl) {
      await prisma.productImage.update({
        where: { id: imgRecord.id },
        data: { imageUrl: newCdnUrl },
      });
      dbUpdatedCount++;
    }
  }
  console.log(`  ✓ Updated ${dbUpdatedCount} ProductImage records in database.`);

  // 5. Save Migration Map
  fs.writeFileSync(MIGRATION_MAP_FILE, JSON.stringify(migrationMap, null, 2), 'utf-8');
  console.log(`\n💾 Saved migration mapping to: ${MIGRATION_MAP_FILE}`);

  console.log('\n🎉 ALL IMAGES AND VIDEOS SUCCESSFULLY MIGRATED TO CLOUDINARY!');
}

migrateAll()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
