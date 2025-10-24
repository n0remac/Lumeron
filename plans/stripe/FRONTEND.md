## Frontend Phase Plan

**Phase 1 – Cart Experience**
- Introduce a cart state provider (React context or Zustand) that persists selections across pages.
- Build cart UI components (drawer/modal) and integrate them into `components/Navbar.tsx` for quick access.
- Ensure cart entries sync with server-derived pricing to prevent stale amounts.

**Phase 2 – Product & Checkout Flow**
- Update `app/(site)/product/[slug]/page.tsx` with quantity selectors and “Add to cart” / “Buy now” actions.
- Wire the checkout button to POST the cart payload to the Payment Sheet bootstrap endpoint and hydrate client-side state with the returned PaymentIntent client secret, customer ID, and ephemeral key.
- Handle loading/error states gracefully and surface Stripe errors to the user when Payment Sheet initialization fails.

**Phase 3 – Payment Sheet Integration**
- Add a React Native (or Expo) module using `@stripe/stripe-react-native` to present the Payment Sheet; configure `initPaymentSheet` with `.automatic` layout and desired address collection options.
- Customize the Payment Sheet appearance (colors, fonts) to match the storefront using the Appearance API and verify both `.automatic` and `.vertical` layouts on different devices.
- Enable dynamic payment methods, express wallets (Apple Pay, Link), and saved payment methods; ensure customer consent and card brand filtering are configured per business rules.

**Phase 4 – Post-Checkout UX**
- Add success and cancel routes under `app/(site)/checkout/` (or equivalent mobile screens) that read the Payment Sheet result and show order confirmation messaging.
- Give customers next steps (download receipts, contact support) and prompt them to share feedback.
- Include guard rails so reloading or reentering the page does not duplicate orders.

**Phase 5 – Admin UI Enhancements**
- Extend the admin dashboard with an Orders tab displaying status, payment info, and fulfillment controls.
- Provide filters/search to locate orders quickly and show deep links to Stripe or Printify where helpful.
- Surface analytics widgets that leverage the new Stripe-backed revenue data.

**Phase 6 – Frontend QA**
- Write unit/integration tests for cart context and Payment Sheet bootstrap flows (React Testing Library or Playwright for web, Jest/Detox for native).
- Conduct manual Stripe test-mode runs across iOS, Android, and web to validate Payment Sheet layout (`.automatic`, `.vertical`) and accessibility.
- Verify error scenarios (cancelled payment, webhook failure) display actionable messaging and allow retry inside Payment Sheet.
