## Database Phase Plan

**Phase 1 – Model Design**
- Audit existing Prisma models to confirm how `Product`, `Listing`, and `Sale` relate to orders and saved payment methods.
- Draft new Prisma models (`Order`, `OrderItem`, `Payment`, optional `CustomerProfile`) with fields for Stripe Payment Sheet flows: `stripePaymentIntentId`, `stripeCustomerId`, `customerSessionId`, fulfillment status, totals, and address snapshots.
- Define supporting enums (e.g., payment status, fulfillment state, payment method type) and establish relations to the existing entities.

**Phase 2 – Migration Preparation**
- Update `prisma/schema.prisma` with the new models and relations, keeping cascade rules consistent with current delete behavior.
- Add required indexes on identifiers like `stripePaymentIntentId`, `stripeCustomerId`, and `orderStatus` to support Payment Sheet idempotency, saved method lookups, and admin queries.
- Run `npm run db:generate` locally to validate the schema updates before creating migrations.

**Phase 3 – Migration Execution**
- Create a Prisma migration capturing the new tables and relations; review SQL to ensure compatibility with SQLite in development and future Postgres use.
- Apply the migration in development and verify the new tables are created as expected.
- Seed sample orders/payments (optional) to support local testing of checkout flows.

**Phase 4 – Data Integrity & Observability**
- Implement database helpers for transactional writes when creating PaymentIntents so orders, order items, and customer records stay consistent.
- Add auditing fields (timestamps, webhook verification flags, last-known Payment Sheet status) to help reconcile Stripe with internal records.
- Document rollback plan for removing the new tables if deployment must be halted.
