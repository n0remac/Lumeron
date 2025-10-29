## Frontend Phase Plan (Web MVP)

**Phase 1 – Cart System**
- Install `@stripe/stripe-js` and `@stripe/react-stripe-js` packages
- Create `lib/cart-context.tsx` - React Context for cart state management
  - Store sessionId in localStorage
  - Add, remove, update item quantities
  - Sync with backend API
  - Calculate totals
- Create `components/CartButton.tsx` - Header cart icon with item count badge
- Create `components/CartDrawer.tsx` - Slide-out cart preview (DaisyUI drawer)
- Add cart button to `components/Navbar.tsx`

**Phase 2 – Product Page Updates**
- Update `components/ProductCard.tsx`:
  - Add "Add to Cart" button
  - Remove external marketplace links

- Update `app/(site)/product/[slug]/page.tsx`:
  - Add size selector dropdown
  - Add finish selector (glossy/matte)
  - Add quantity selector
  - Add "Add to Cart" button with loading state
  - Remove Etsy/Amazon buttons

**Phase 3 – Cart & Checkout Pages**
- Create `app/(site)/cart/page.tsx` - Full cart page
  - Display all cart items with images, size, finish
  - Quantity controls (+/- buttons)
  - Remove item buttons
  - Subtotal and shipping cost display
  - "Proceed to Checkout" button
  - Empty cart state

- Create `app/(site)/checkout/page.tsx` - Checkout form
  - Email input field
  - Name input field
  - Shipping address form (street, city, state, zip, country)
  - Order summary sidebar
  - Stripe Elements card input
  - "Pay Now" button
  - Loading and error states

- Create `app/(site)/checkout/success/page.tsx` - Order confirmation
  - Display order number
  - Show order summary
  - Email confirmation message
  - Link back to home

**Phase 4 – Admin Orders Tab**
- Create `components/AdminOrdersTab.tsx` - Orders management interface
  - Orders table with columns: Order #, Date, Customer, Total, Status
  - Filter by status dropdown (all/pending/paid/fulfilled/cancelled)
  - Search by order number or email
  - Click to view order details modal
  - Status update dropdown

- Add "Orders" tab to `components/AdminTabs.tsx`
- Wire up in `app/(admin)/admin/page.tsx`

**Phase 5 – Validation Schemas**
- Add to `lib/schema.ts`:
  - `AddToCartSchema` - Validate productId, size, finish, quantity
  - `CheckoutSchema` - Validate email, name, address fields
  - `UpdateCartItemSchema` - Validate quantity updates
