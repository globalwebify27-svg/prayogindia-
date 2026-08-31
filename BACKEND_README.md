# Prayog India — Backend Architecture & Database Documentation

## 1. Overview
This backend foundation powers the Prayog India Customer Website using **Next.js App Router**, **Prisma ORM**, and a relational **PostgreSQL** schema.

---

## 2. Relational Database Schema (`prisma/schema.prisma`)

The database consists of 19 normalized tables with referential integrity, indexes, and unique constraints:

1. **`User`**: Customer profile, hashed credentials, and role.
2. **`Address`**: Saved customer delivery addresses (`Home`, `Office`, `Lab / College`).
3. **`Category`**: Hierarchical product taxonomy with unique slugs.
4. **`Product`**: Hardware catalogue (Arduino, Raspberry Pi, flight controllers, actuators, sensors).
5. **`ProductVariant`**: SKU variants (e.g., `5200mAh / 60C`).
6. **`ProductImage`**: High-resolution hardware photos and alt tags.
7. **`Cart` & `CartItem`**: Persistent customer shopping carts.
8. **`Wishlist` & `WishlistItem`**: Customer saved items.
9. **`Order` & `OrderItem`**: Historical order records with purchase-time price snapshots (`Order Placed` $\rightarrow$ `Delivered`).
10. **`Shipment`**: Courier partner AWB tracking information (`Bluedart`, `Delhivery`).
11. **`Service` & `ServiceEnquiry`**: 5 PDF services (`STEM Lab Setup`, `Robotics Lab Setup`, `Drone Lab Setup`, `Industrial Projects`, `Consultancy`).
12. **`LearningContent`**: Tutorials, pinout diagrams, and curriculum manuals.
13. **`Offer` & `OfferProduct`**: Promotional campaigns and voucher codes.
14. **`SupportTicket` & `SupportMessage`**: Customer helpdesk tickets and thread replies.

---

## 3. Environment Variables Configuration (`.env.example`)

```env
# Relational Database Connection (PostgreSQL)
DATABASE_URL="postgresql://prayog_user:secure_password@localhost:5432/prayog_db?schema=public"

# Public API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_USE_MOCK_DATA="true"
```

---

## 4. Setup & Migration Commands

Generate Prisma Client:
```bash
npx prisma generate
```

Run Database Migration:
```bash
npx prisma migrate dev --name init_prayog_schema
```

Seed Database:
```bash
npx prisma db seed
```
