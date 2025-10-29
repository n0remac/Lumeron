## Backend Phase Plan (Web MVP)

**Phase 1 – Dependencies & Utilities**
- Install `stripe` package for Node.js SDK
- Create `lib/stripe.ts` with Stripe client initialization
- Create `lib/cart.ts` with cart helper functions:
  - `generateSessionId()` - Create unique session IDs
  - `calculateCartTotal()` - Sum cart items
  - `validateCartItems()` - Verify products exist and prices match
- Create `lib/orders.ts` with order helpers:
  - `generateOrderNumber()` - Create order IDs like "LUM-20241028-001"

**Phase 2 – Cart API Routes**
- `POST /api/cart/add` - Add item to cart (create/update cart by sessionId)
- `GET /api/cart?sessionId=xxx` - Fetch cart contents
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove` - Remove specific item
- `DELETE /api/cart/clear` - Empty entire cart

**Phase 3 – Checkout API Routes**
- `POST /api/checkout/create-intent`
  - Validate cart items with Zod
  - Calculate totals (subtotal + shipping)
  - Create Stripe PaymentIntent
  - Create draft Order with status "pending"
  - Return clientSecret for Stripe Elements

- `POST /api/checkout/confirm`
  - Verify PaymentIntent with Stripe API
  - Update Order status to "paid"
  - Create Sale record
  - Clear cart
  - Return order details

**Phase 4 – Stripe Webhook**
- `POST /api/webhooks/stripe`
  - Verify webhook signature
  - Handle `payment_intent.succeeded` - Update order to "paid"
  - Handle `payment_intent.payment_failed` - Log failure
  - Handle `payment_intent.canceled` - Update order to "cancelled"

**Phase 5 – Admin API Routes**
- `GET /api/admin/orders` - List all orders with filters (status, date range)
- `GET /api/admin/orders/[id]` - Get single order details
- `PUT /api/admin/orders/[id]/status` - Update order status (for manual review)
