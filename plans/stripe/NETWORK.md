## Setup & Configuration Plan (Web MVP)

**Phase 1 – Stripe Account Setup**
- Create Stripe account at stripe.com (or use existing)
- Get test mode API keys from Dashboard
- Add to `.env`:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- Update `.env.example` with these keys (as placeholders)

**Phase 2 – Local Development Webhooks**
- Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (or download binary)
- Authenticate: `stripe login`
- Forward webhooks to local server: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Copy webhook signing secret to `.env`

**Phase 3 – Initial Product Setup**
- Create "site" Listings for existing products:
  - Set `channel: "site"`
  - Set pricing in `priceCents`
  - Set status to "active"
- Configure product variants in `variantsJson`:
  ```json
  {
    "variants": [
      { "size": "2", "finish": "glossy", "priceCents": 500 },
      { "size": "2", "finish": "matte", "priceCents": 500 },
      { "size": "3", "finish": "glossy", "priceCents": 700 },
      // etc...
    ]
  }
  ```

**Phase 4 – Testing Checklist**
- Test with Stripe test cards:
  - Success: 4242 4242 4242 4242
  - Decline: 4000 0000 0000 0002
  - 3D Secure: 4000 0025 0000 3155
- Verify webhook events are received
- Verify orders are created correctly
- Verify admin can view and manage orders
