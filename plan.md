# Prayog India — Complete Technical & Functional Architecture Plan (plan.md)

> **Document Version**: 2.0 (Full Functional & Technical Master Blueprint)  
> **Prepared For**: Prayog India Platform Development  
> **Project Scope**: Next.js Web Application + Admin Panel + Walk-in POS + Multi-Location Inventory & Business Management System  

---

## 1. Executive Summary & Core Inventory Architecture

Prayog India operates as a centralized omnichannel commerce and business-management platform. It powers online customer purchases (B2C & B2B), physical store walk-in transactions, quotation-based institutional sales, multi-store inventory allocation, procurement, logistics rules, and executive incentive management.

### Centralized vs. Location-Specific Inventory Model
- **Centralized Catalogue**: All products, variants, titles, descriptions, technical specifications, datasheets, brands, categories, and master base prices are managed in a single central catalogue.
- **Location-Specific Stock**:
  - **Ranchi Main Branch**: Acts as the **Central Stock Hub** for Website orders, Mobile App orders, and Ranchi physical store sales.
  - **Branch Stores (Patna, Delhi, Mumbai, etc.)**: Each additional physical branch maintains its own independent stock pool.
  - *Rules*:
    - An Online / Mobile App order automatically reserves and deducts stock from **Ranchi Main Branch Central Inventory**.
    - A Ranchi Walk-In POS order deducts stock from **Ranchi Main Branch Central Inventory**.
    - A Patna / Delhi Walk-In POS order deducts stock ONLY from **Patna / Delhi Local Branch Inventory**.

```
                           ┌─────────────────────────┐
                           │ PRAYOG INDIA CATALOGUE  │
                           │  (Centralized Master)   │
                           └────────────┬────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌───────────────────────────────┐                       ┌─────────────────────────┐
│      RANCHI MAIN BRANCH       │                       │    PHYSICAL BRANCHES    │
│      (Central Inventory)      │                       │ (Independent Inventory) │
├───────────────────────────────┤                       ├─────────────────────────┤
│ • Website Sales               │                       │ • Patna Store Stock     │
│ • Mobile App Sales            │                       │ • Delhi Store Stock     │
│ • Ranchi Walk-in POS Sales    │                       │ • Future Stores Stock   │
└───────────────────────────────┘                       └─────────────────────────┘
```

---

## 2. Platform Sales Channels & Customer Classification

### 2.1 Supported Sales Channels
1. **Website E-Commerce**: Public consumer shopping portal with responsive mobile view.
2. **Mobile App Channel**: Flutter Android/iOS application API integration.
3. **Physical Store Walk-in (POS)**: Tablet/device-based point-of-sale system locked to authorized store hardware.
4. **B2B / Institutional Sales**: Direct procurement workflow for schools, universities, and labs with GST proforma invoicing.
5. **Sales Executive Assisted Sales**: Orders generated or managed by internal sales executives with commission/incentive tracking.
6. **Quotation & Tender Sales**: Multi-step document pipeline (`Quotation` -> `Proforma Invoice` -> `Tax Invoice`).

### 2.2 Customer Types & Rule Attribution
- **B2C Customer**: Standard consumer account or guest buyer. Eligible for public promo codes and standard retail pricing.
- **B2B Customer**: Corporate or educational institute with GSTIN, company details, bulk quantity pricing, and proforma options.
- **Walk-in Customer**: In-store buyer checked out via authorized POS device with optional B2B invoice data and community opt-in.
- **Registered Customer**: Verified account holder with saved addresses, reward points, and order history.
- **Guest Customer**: Instant buyer with automatic account provisioning at checkout.

---

## 3. Navigation Structure & Information Architecture

### Website Primary Header Navigation
- **Home**
- **About Us** (Company info, Vision, Mission, Why Choose Us, Brand Story, Team)
- **Categories** (Mega Dropdown with multi-level subcategories: Robotics, Drone Tech, Arduino & IoT, STEM Kits, Dev Boards, Sensors, Components)
- **Products / Shop**
  - Featured Products
  - New Arrivals
  - Best Sellers
  - Deals & Offers
  - Learning / Project Products
- **Services**
  - STEM Lab Setup
  - Robotics Lab Setup
  - Drone Lab Setup
  - Industrial Projects
  - Consultancy
- **Learning Hub** (Workshops, Certification Programs, Student Resources)
- **Offers & Deals** (Limited-time flash sales, B2B volume pricing)
- **Careers** (Job listings, online application & resume submission)
- **Contact Us** (Inquiry form, store locator, phone, email, WhatsApp desk)
- **Account / POS Access**
  - My Account (Profile, Orders, Wishlist, Saved Addresses, Support Tickets, Rewards)
  - Mobile Phone OTP Sign-In / Register
  - Store / Walk-in Shopping (Device-authenticated store tablet mode)

---

## 4. E-Commerce Website & Mobile UX Features

### 4.1 Homepage & Content Sections
- **Top Announcement Bar Slider**: Admin-controlled ticker for urgent notices (e.g. *"Ranchi 24-Hour Express Delivery Available"*, *"Festival Sale Live"*).
- **Hero Video & Banner Carousel**: Immersive tech showcase with primary CTAs.
- **Shop by Category & Quick Attribute Filters**: Instant navigation to Arduino, Drones, Sensors, and STEM Kits.
- **Curated Product Grids**: Trending Products, New Arrivals, Best Sellers, Recommended Hardware.
- **Brand Partners & Customer Reviews**: Verified buyer ratings with photo/video uploads.
- **Knowledge Center / Blog & Community Opt-in**: Newsletter subscription and WhatsApp updates.

### 4.2 Advanced Product Search & Dynamic Filtering
- **Instant Typo-Tolerant Search**: Real-time card dropdown showing matching items by SKU, name, category, or brand.
- **Dynamic Category Filters**:
  - Category / Subcategory
  - Price Range Slider
  - Brand & Availability (In Stock / Out of Stock)
  - Technical Specs: Voltage (5V, 12V), Current, Size, RPM, Compatibility, Material.

### 4.3 Out-of-Stock & WhatsApp Availability Integration
- When stock is **Available** (> 0): Displays **Add to Cart** and **Buy Now**.
- When stock is **Zero** (= 0):
  - Displays **Out of Stock** badge.
  - Renders **[ Ask Availability on WhatsApp ]** button with pre-filled message:
    > *"Hi Prayog India, I am interested in [Product Name] (SKU: [SKU_CODE]). Please let me know the availability and latest price."*

---

## 5. Shipping, Freight Rules & Battery Restriction Engine

To prevent illegal air cargo transit of lithium batteries and heavy items, the system enforces automated shipping restriction validation during cart review and checkout.

### 5.1 Freight Modes & Shipping Tags
Each product in the database is configured with:
- **Weight (grams)** & **Dimensions (L x W x H in cm)**.
- **Shipping Tag**: `Standard`, `Battery Item`, `Fragile`, `Heavy/Oversized`, `Hazardous`.
- **Allowed Freight Modes**: `Air Freight Allowed` (True/False), `Surface Freight Allowed` (True/False).

### 5.2 Mixed Cart Shipping Rule Validation
- **Rule 1 (Battery Restriction)**: If ANY item in the shopping cart has `Air Freight Allowed = False` (e.g. LiPo Battery), **Air Freight is immediately disabled for the entire cart**.
- **Customer UI Notification**:
  > ⚠️ **Shipping Restriction Notice**: Your cart contains Battery / Hazardous products (e.g., LiPo Battery). Air Freight is disabled. Your order will be delivered via **Surface Freight**.
- **Rule 2 (Ranchi Express Delivery)**: Orders within Ranchi City limits qualify for **24-Hour Local Express Delivery**.
- **Rule 3 (Free Shipping Threshold)**: Free standard surface delivery applies on orders above **₹2,000**.

---

## 6. Physical Store Walk-in POS & Split Payment System

### 6.1 Authorized Tablet Security Mode
- Walk-in shopping is locked to physical store devices (authenticated via device token/cookie). Unauthenticated public devices cannot access POS checkout.
- Automatically tags every order with `Order Source: WALK-IN` and `Store ID: Ranchi / Patna / Delhi`.

### 6.2 Walk-in Checkout & Split Payment Engine
- Collects Customer Name, Mobile Number, and **B2B Invoice Option** (Company Name, GSTIN, Address).
- Supports **Split Payment** across multiple modes for a single order/invoice:
  ```
  Total Order Amount: ₹2,000
  ├── Cash Payment:   ₹1,000
  ├── UPI Payment:    ₹500
  └── Card Payment:   ₹500
  ```
- Instant Invoice Actions: Thermal Print Invoice, Send PDF via WhatsApp, Email Invoice.
- **PRAYOG INDIA Community Opt-In**: Post-purchase consent checkbox for workshops, internships, and drone training updates.

---

## 7. B2B, Institutional Quotation & Sales Document Pipeline

For schools, universities, STEM labs, and tender procurement, the system provides an end-to-end editable sales document workflow:

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  QUOTATION   │ ──> │ PROFORMA INVOICE │ ──> │ PAYMENT RECEIVED │ ──> │ TAX INVOICE │
│ (Draft/Edit) │     │ (Payment Notice) │     │  (Verification)  │     │ (Final GST) │
└──────────────┘     └──────────────────┘     └──────────────────┘     └─────────────┘
```

- **Quotation Fields**: Quote No, Expiry Date, Institution Name, GSTIN, Itemized Pricing, Discount, GST %, Terms & Conditions.
- **Sales Document Editor**: Admin/Sales Executive can edit prices, add custom notes, and export official PDFs.

---

## 8. Admin Panel, Inventory & Business Analytics

### 8.1 Complete Admin Navigation
- **Dashboard**: Revenue, Orders, Walk-in vs Online sales, GST Collected, Gross & Net Profit.
- **Product & Category Management**: Multi-level categories, variants, datasheets, bulk price/GST/SKU updates.
- **Multi-Location Inventory**: Stock levels, stock reservation, low-stock alerts, damaged stock adjustments, store-to-store stock transfers.
- **Purchases & Supplier Desk**: Record supplier purchases, purchase history, cost price tracking, cost-margin analysis.
- **Sales Documents**: Quotations, Proforma Invoices, GST Tax Invoices.
- **Executive & Incentive Desk**: Sales attribution, target dashboards, slab/profit-based commissions.
- **Customer CRM**: Orders, B2B profiles, support tickets, WhatsApp logs, community opt-ins.
- **CMS & Announcements**: Manage banners, notification slider, services, learning hub, careers.

### 8.2 Sales Executive Performance & Profit-Based Incentive Engine
- **Sales Attribution**: Every online, walk-in, or B2B sale is assigned to an executive.
- **Incentive Calculation Formulas**:
  - **Slab-based**: e.g., ₹0–₹50k = 2%, ₹50k–₹1L = 3%, >₹1L = 5%.
  - **Category-wise**: e.g., Drone Tech = 5%, Arduino = 3%, STEM Kits = 2%.
  - **Profit-based Commission**:
    $$\text{Net Profit} = \text{Selling Price} - \text{Purchase Cost} - \text{Shipping Cost} - \text{Additional Expenses}$$
    $$\text{Commission} = \text{Configured } \% \times \text{Net Profit}$$

---

## 9. Technology Stack & Database Infrastructure

| Component | Technology / Service |
| :--- | :--- |
| **Frontend Web** | Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons |
| **Mobile App** | Flutter (Android & iOS) |
| **Backend API** | Next.js Server Routings & Node.js REST API Services |
| **Database & ORM** | PostgreSQL + Prisma ORM |
| **Caching & Search** | Redis Caching + Typo-tolerant Product Search |
| **Authentication** | Mobile Phone OTP + JWT Sessions + Role-Based Access Control |
| **Logistics & WhatsApp** | Shiprocket / Courier APIs + WhatsApp Business API |
| **Storage & Hosting** | AWS S3 Compatible Object Storage (Datasheets, Images) + Vercel / AWS VPS |

---

## 10. Verification & Quality Assurance Plan

### 10.1 Automated Verification Tests
- **Database Build & Prisma Validation**: Verify schema sync and running migration checks.
- **Production Build Compilation**: Run `npm run build` to confirm zero TypeScript compile errors across all 74+ application routes.

### 10.2 Manual QA Checklist
1. **Responsive Viewports**: Test on 360px (mobile), 768px (tablet), and 1280px (desktop).
2. **Cart & Shipping Restriction Rules**: Add LiPo Battery to cart -> verify Air Freight is automatically disabled and Surface Freight is enforced.
3. **Walk-in POS Flow**: Process split payment transaction -> verify receipt generation and stock deduction.
4. **Mobile OTP Login**: Verify phone number entry -> 6-digit OTP verification -> new user registration fallback.
