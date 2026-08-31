# Prayog India Backend API Documentation (Phases B1–B12)

Complete reference for production customer-facing APIs of Prayog India.

---

## Standard API Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Optional success summary",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human-readable user message",
  "code": "ERROR_CODE"
}
```

---

## 1. Authentication & Session APIs (B2)

### `POST /api/auth/register`
- **Auth**: Public
- **Rate Limit**: 5 requests / min
- **Request Body**:
  ```json
  {
    "name": "Om Prakash",
    "email": "customer@prayogindia.com",
    "phone": "+91 9876543210",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `200 OK` (Sets `prayog_customer_session` HttpOnly cookie)

### `POST /api/auth/login`
- **Auth**: Public
- **Rate Limit**: 5 requests / min
- **Request Body**:
  ```json
  {
    "email": "customer@prayogindia.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `200 OK` (Account enumeration protected: returns generic `"Invalid email address or password."` on failure).

### `POST /api/auth/logout`
- **Auth**: Authenticated
- **Response**: `200 OK` (Clears session cookie)

### `GET /api/auth/me`
- **Auth**: Authenticated
- **Response**: Authenticated customer profile JSON.

---

## 2. Product Discovery & Catalog APIs (B3, B10)

### `GET /api/products`
- **Auth**: Public
- **Query Parameters**:
  - `q`: Search query (Name, SKU, Description, Brand)
  - `category`: Category ID or slug
  - `minPrice`: Minimum price bound (Number >= 0)
  - `maxPrice`: Maximum price bound (Number >= minPrice)
  - `inStock`: `true` | `false`
  - `sort`: `newest` | `price-asc` | `price-desc` | `name`
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 12, max: 50)

### `GET /api/products/suggestions?q=drone`
- **Auth**: Public
- **Response**: Top 5-8 matching product cards (`id`, `name`, `slug`, `price`, `image`).

### `GET /api/products/filters`
- **Auth**: Public
- **Response**: Global categories list, price range bounds, and in-stock count.

### `GET /api/products/[slug]/related`
- **Auth**: Public
- **Response**: Products in the same category excluding the target product.

---

## 3. Cart & Wishlist APIs (B4)

### `GET /api/cart`
- **Auth**: Authenticated
- **Response**: Customer's active cart with server-recalculated line totals.

### `POST /api/cart/items`
- **Auth**: Authenticated
- **Request Body**: `{ "productId": "...", "variantId": "...", "quantity": 1 }`

### `GET /api/wishlist` & `POST /api/wishlist/items`
- **Auth**: Authenticated
- **Features**: Customer-isolated wishlist management.

---

## 4. Orders & Order Tracking APIs (B5)

### `POST /api/orders`
- **Auth**: Authenticated
- **Request Body**: `{ "addressId": "..." }` or `{ "shippingAddress": "..." }`
- **Features**: Trusted server-side pricing recalculation, stock check, atomic Prisma `$transaction`, cart cleanup, and `PRG-2026-XXXX` order number generation.

### `GET /api/orders` & `GET /api/orders/[id]`
- **Auth**: Authenticated (Customer Isolated)

### `GET /api/orders/[id]/tracking`
- **Auth**: Authenticated (Customer Isolated)

---

## 5. Services, Learning Hub & Offers APIs (B6)

### `GET /api/services` & `GET /api/services/[slug]`
- **Auth**: Public service catalog & detail.

### `POST /api/service-enquiries`
- **Auth**: Public / Authenticated (Rate limited: max 5 / min).

### `GET /api/learning` & `GET /api/learning/[slug]`
- **Auth**: Public Learning Hub resource search & detail.

### `GET /api/offers` & `GET /api/offers/[slug]`
- **Auth**: Public active promotional campaigns.

---

## 6. Support Tickets & Customer Conversations (B7)

### `POST /api/support/tickets`
- **Auth**: Authenticated
- **Request Body**: `{ "subject": "...", "category": "TECHNICAL_SUPPORT", "message": "..." }`

### `POST /api/support/tickets/[id]/messages`
- **Auth**: Authenticated (Customer Isolated)

---

## 7. Storage & Pre-signed Upload Authorization (B8)

### `POST /api/uploads/request`
- **Auth**: Authenticated (Customer context restricted to `SUPPORT_ATTACHMENT`)
- **Validation**: Whitelists `JPEG`, `PNG`, `WEBP`, `PDF` up to 10MB.
- **Response**: Returns presigned upload authorization token & safe storage key.

### `GET /api/uploads/[id]`
- **Auth**: Authenticated for private attachments; Customer Isolated.

---

## 8. Notifications & Email System (B9)

### `GET /api/notifications` & `GET /api/notifications/unread-count`
- **Auth**: Authenticated (Customer Isolated)

### `PATCH /api/notifications/[id]/read` & `PATCH /api/notifications/read-all`
- **Auth**: Authenticated

---

## 9. Security, Monitoring & Health (B11)

### `GET /api/health`
- **Auth**: Public
- **Response**: `{ "status": "ok", "service": "prayog-india-backend", "database": "ok" }`
