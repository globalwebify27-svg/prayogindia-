import { db, isDatabaseAvailable } from "@/lib/db";
import { isReviewForProduct } from "@/lib/reviewUtils";

export { isReviewForProduct };

export interface ReviewData {
  id: string;
  author: string;
  role?: string;
  email?: string;
  userId?: string;
  rating: number;
  date: string;
  title?: string;
  comment: string;
  verified: boolean;
  productId: string;
  productName: string;
  productSku?: string;
  productSlug?: string;
  productImage?: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  isFeatured?: boolean;
  isReported?: boolean;
  reportReason?: string;
  reportedAt?: string;
  helpfulCount?: number;
  images?: string[];
  videoUrl?: string;
  createdAt?: string;
}

export const SEED_REVIEWS: ReviewData[] = [
  {
    id: "rev-101",
    author: "Rohan Verma",
    role: "Robotics Engineer",
    userId: "usr-101",
    rating: 5,
    date: "18 Nov 2026",
    title: "Outstanding Board Quality & Quick Delivery",
    comment:
      "Original ATmega328P chip with authentic bootloader. Tested all analog pins and I2C lines, noise floor is exceptionally clean. Packaged in proper antistatic sleeve with express 24h delivery from Ranchi hub.",
    verified: true,
    productId: "p-uno-r3",
    productName: "Arduino UNO R3 Official Rev3 Board (ATmega328P)",
    productSku: "PRG-ARD-001",
    productSlug: "arduino-uno-r3",
    productImage: "/images/products/arduino-uno-r3.png",
    status: "APPROVED",
    isFeatured: true,
    isReported: false,
    helpfulCount: 24,
    images: [
      "/images/products/arduino-uno-r3.png",
      "/images/products/esp32-devkit-v1.png",
    ],
  },
  {
    id: "rev-102",
    author: "Ananya Sharma",
    role: "STEM Educator",
    userId: "usr-102",
    rating: 4,
    date: "14 Nov 2026",
    title: "Great for School Robotics Labs",
    comment:
      "Equipped our school robotics club with 15 units. Solid solder pads, pin markings are crystal clear. One motor cable was slightly bent during shipping but easily straightened.",
    verified: true,
    productId: "p-robot-chassis",
    productName: "4WD Smart Robot Chassis Kit with Dual DC Motors",
    productSku: "PRG-ROB-004",
    productSlug: "4wd-smart-robot-chassis-kit",
    productImage: "/images/products/4wd-robot-chassis-kit.jpg",
    status: "APPROVED",
    isFeatured: false,
    isReported: false,
    helpfulCount: 9,
    images: ["/images/products/4wd-robot-chassis-kit.jpg"],
  },
  {
    id: "rev-103",
    author: "Vikram Malhotra",
    role: "IoT Hobbyist",
    userId: "usr-103",
    rating: 1,
    date: "12 Nov 2026",
    title: "Check this external site for cheap alternatives www.fake-links.com",
    comment:
      "Buy from other suppliers instead at http://discount-spam.com/cheap for 50% discount and direct telegram link @spambot.",
    verified: false,
    productId: "p-esp32-v1",
    productName: "ESP32 Wi-Fi & Bluetooth IoT Development Board",
    productSku: "PRG-ESP-002",
    productSlug: "esp32-devkit-v1",
    productImage: "/images/products/esp32-devkit-v1.png",
    status: "PENDING",
    isFeatured: false,
    isReported: true,
    reportReason: "Spam, advertising, or promotional content",
    reportedAt: "2026-11-13T10:15:00Z",
    helpfulCount: 0,
    images: [],
  },
  {
    id: "rev-104",
    author: "Pooja Patel",
    role: "Electronics Student",
    userId: "usr-104",
    rating: 5,
    date: "08 Nov 2026",
    title: "Flawless Performance on 3.3V Logic",
    comment:
      "Used with Raspberry Pi 5 without any level shifter issues. Fast trigger response and consistent range calibration up to 4 meters.",
    verified: true,
    productId: "p-sensor-us",
    productName: "Ultrasonic Distance Sensor Module HC-SR04",
    productSku: "PRG-SEN-005",
    productSlug: "ultrasonic-distance-sensor-hc-sr04",
    productImage: "/images/products/ultrasonic-sensor-hcsr04.png",
    status: "APPROVED",
    isFeatured: true,
    isReported: false,
    helpfulCount: 16,
    images: ["/images/products/ultrasonic-sensor-hcsr04.png"],
  },
  {
    id: "rev-105",
    author: "Amit Mehra",
    role: "Maker",
    userId: "usr-105",
    rating: 2,
    date: "04 Nov 2026",
    title: "Heatsink gets warm under 2A load",
    comment:
      "Driver IC works fine for small DC motors, but please include thermal paste for continuous 2 Amp loads.",
    verified: true,
    productId: "p-l298n",
    productName: "L298N Dual H-Bridge DC Stepper Motor Driver Board",
    productSku: "PRG-MOT-003",
    productSlug: "l298n-dual-h-bridge-motor-driver",
    productImage: "/images/products/l298n-motor-driver.jpg",
    status: "PENDING",
    isFeatured: false,
    isReported: false,
    helpfulCount: 3,
    images: [],
  },
  // Sample approved customer reviews for 'test' product matching admin screenshots
  {
    id: "rev-test-4",
    author: "Om Kumar",
    role: "Verified Buyer",
    userId: "usr-om-kumar",
    rating: 5,
    date: "24 Nov 2026",
    title: "Verified Hardware Purchase",
    comment: "test review",
    verified: true,
    productId: "4",
    productName: "test [4]",
    productSku: "4",
    productSlug: "test",
    productImage: "/images/products/arduino-uno-r3.png",
    status: "APPROVED",
    isFeatured: true,
    isReported: false,
    helpfulCount: 5,
    images: ["/images/products/arduino-uno-r3.png"],
  },
  {
    id: "rev-test-10",
    author: "Om Kumar",
    role: "Verified Buyer",
    userId: "usr-om-kumar",
    rating: 5,
    date: "24 Nov 2026",
    title: "Verified Hardware Purchase",
    comment: "test review",
    verified: true,
    productId: "10",
    productName: "test [10]",
    productSku: "10",
    productSlug: "test",
    productImage: "/images/products/arduino-uno-r3.png",
    status: "APPROVED",
    isFeatured: true,
    isReported: false,
    helpfulCount: 2,
    images: ["/images/products/arduino-uno-r3.png"],
  },
];

export const INITIAL_ADMIN_REVIEWS = SEED_REVIEWS;

declare global {
  var __prayog_reviews_store: ReviewData[] | undefined;
}

function getMemoryStore(): ReviewData[] {
  if (!globalThis.__prayog_reviews_store) {
    globalThis.__prayog_reviews_store = [...SEED_REVIEWS];
  }
  return globalThis.__prayog_reviews_store;
}

/**
 * Get all reviews for admin moderation desk
 */
export async function getAllReviews(options?: {
  status?: string;
  search?: string;
}): Promise<ReviewData[]> {
  const store = getMemoryStore();
  let list = [...store];

  // Try to enrich with database reviews if available
  if (isDatabaseAvailable()) {
    try {
      const dbReviews = await db.review.findMany({
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { id: true, name: true, sku: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      if (dbReviews && dbReviews.length > 0) {
        const existingIds = new Set(list.map((r) => r.id));
        const fromDb = dbReviews
          .filter((d) => !existingIds.has(d.id))
          .map((r) => ({
            id: r.id,
            author: r.user?.name || "Customer",
            email: r.user?.email,
            userId: r.userId,
            rating: r.rating,
            date: new Date(r.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            title: r.title || "Customer Review",
            comment: r.body,
            verified: r.isVerified,
            productId: r.productId,
            productName: r.product?.name || "Hardware Component",
            productSku: r.product?.sku || "PRG-SKU",
            productSlug: r.product?.slug,
            status: "APPROVED" as const,
            isFeatured: r.rating >= 4,
            isReported: false,
            helpfulCount: 0,
            images: [],
          }));
        list = [...fromDb, ...list];
      }
    } catch (err) {
      console.warn("[ReviewsStore DB Fetch Error]:", err);
    }
  }

  if (options?.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.author.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        (r.productSku && r.productSku.toLowerCase().includes(q)) ||
        r.comment.toLowerCase().includes(q) ||
        (r.title && r.title.toLowerCase().includes(q))
    );
  }

  if (options?.status && options.status !== "ALL") {
    if (options.status === "PENDING") {
      list = list.filter((r) => r.status === "PENDING" && !r.isReported);
    } else if (options.status === "APPROVED") {
      list = list.filter((r) => r.status === "APPROVED");
    } else if (options.status === "REJECTED") {
      list = list.filter((r) => r.status === "REJECTED");
    } else if (options.status === "REPORTED") {
      list = list.filter((r) => r.isReported === true);
    } else if (options.status === "FEATURED") {
      list = list.filter((r) => r.isFeatured === true);
    }
  }

  return list;
}

/**
 * Get approved reviews for a specific product
 */
export async function getApprovedReviewsForProduct(target: {
  id?: string;
  name?: string;
  slug?: string;
  sku?: string;
}): Promise<ReviewData[]> {
  const allReviews = await getAllReviews({ status: "APPROVED" });
  return allReviews.filter((rev) => isReviewForProduct(rev, target));
}

/**
 * Approve a review
 */
export async function approveReview(id: string): Promise<ReviewData | null> {
  const store = getMemoryStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx >= 0) {
    store[idx] = {
      ...store[idx],
      status: "APPROVED",
      isReported: false,
    };
    return store[idx];
  }
  return null;
}

/**
 * Reject a review
 */
export async function rejectReview(id: string): Promise<ReviewData | null> {
  const store = getMemoryStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx >= 0) {
    store[idx] = {
      ...store[idx],
      status: "REJECTED",
      isFeatured: false,
    };
    return store[idx];
  }
  return null;
}

/**
 * Update review content (moderation)
 */
export async function moderateReview(
  id: string,
  payload: { title?: string; body?: string }
): Promise<ReviewData | null> {
  const store = getMemoryStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx >= 0) {
    store[idx] = {
      ...store[idx],
      title: payload.title !== undefined ? payload.title : store[idx].title,
      comment: payload.body !== undefined ? payload.body : store[idx].comment,
      status: "APPROVED",
      isReported: false,
    };
    return store[idx];
  }
  return null;
}

/**
 * Toggle featured flag
 */
export async function toggleFeaturedReview(
  id: string,
  isFeatured: boolean
): Promise<ReviewData | null> {
  const store = getMemoryStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx >= 0) {
    store[idx] = {
      ...store[idx],
      isFeatured,
    };
    return store[idx];
  }
  return null;
}

/**
 * Delete a review
 */
export async function deleteReview(id: string): Promise<boolean> {
  const store = getMemoryStore();
  const idx = store.findIndex((r) => r.id === id);
  if (idx >= 0) {
    store.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Add or update review from customer or API
 */
export async function addOrUpdateReview(review: ReviewData): Promise<ReviewData> {
  const store = getMemoryStore();
  const idx = store.findIndex((r) => r.id === review.id);
  if (idx >= 0) {
    store[idx] = { ...store[idx], ...review };
    return store[idx];
  }
  store.unshift(review);
  return review;
}
