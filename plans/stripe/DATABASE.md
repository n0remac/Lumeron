## Database Phase Plan (Web MVP)

**Phase 1 – Add Cart Model**
- Add `Cart` model to store guest shopping carts
  - `id` (cuid)
  - `sessionId` (string, unique) - Browser session identifier
  - `itemsJson` (string) - JSON array of cart items
  - `createdAt`, `updatedAt` (DateTime)

**Phase 2 – Add Order Models**
- Add `Order` model for completed purchases
  - `id` (cuid)
  - `orderNumber` (string, unique) - Human-readable ID (e.g., "LUM-20241028-001")
  - `email` (string) - Customer email
  - `name` (string) - Customer name
  - `shippingAddressJson` (string) - JSON object with address
  - `subtotalCents` (int) - Items subtotal
  - `shippingCents` (int) - Shipping cost
  - `totalCents` (int) - Final total
  - `status` (string) - "pending" | "paid" | "fulfilled" | "cancelled"
  - `stripePaymentIntentId` (string, unique, optional)
  - `createdAt`, `updatedAt` (DateTime)

- Add `OrderItem` model for line items
  - `id` (cuid)
  - `orderId` (string) - Relation to Order
  - `productId` (string) - Relation to Product
  - `title` (string) - Product title snapshot
  - `size` (string) - Selected size
  - `finish` (string) - Selected finish
  - `quantity` (int)
  - `priceCents` (int) - Price per unit at time of purchase

**Phase 3 – Update Existing Models**
- Update `Listing` to support `channel: "site"` for direct sales
- Add `variantsJson` field to `Product` to store size/finish/price combinations

**Phase 4 – Apply Schema**
- Update `prisma/schema.prisma` with all changes
- Run `npm run db:push` to apply to SQLite database
- Run `npm run db:generate` to regenerate Prisma client
