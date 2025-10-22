Awesome—here’s a **lean, single-app Next.js** structure that keeps files to a minimum while covering:

* Public storefront
* Private admin (upload + AI generate)
* Backend jobs to post to Etsy & Amazon
* Sales analytics in admin

Uses **Next.js (App Router) + Tailwind + DaisyUI**, **SQLite via Prisma** (one file schema), and tiny typed clients for integrations.

---

# Project layout (minimal, practical)

```
rave-shop/
├─ app/
│  ├─ (site)/
│  │  ├─ page.tsx                    # Home (collections + featured)
│  │  └─ product/[slug]/page.tsx     # Product detail (SSR/ISR)
│  ├─ (admin)/
│  │  └─ admin/
│  │     ├─ page.tsx                 # Admin dashboard (tabs: Upload, Generate, Listings, Analytics)
│  │     ├─ upload.tsx               # (Optional split) Keeps admin/page.tsx small
│  │     ├─ generate.tsx             # (Optional split) AI generation UI
│  │     └─ analytics.tsx            # (Optional split) Charts + tables
│  ├─ api/
│  │  ├─ admin/
│  │  │  ├─ upload/route.ts          # POST: sticker PNG -> store & make Product
│  │  │  ├─ generate/route.ts        # POST: AI generate art -> save Assets
│  │  │  ├─ publish/
│  │  │  │  ├─ etsy/route.ts         # POST: create/update Etsy listing
│  │  │  │  └─ amazon/route.ts       # POST: create/update Amazon listing
│  │  │  └─ analytics/route.ts       # GET: sales metrics (by channel, product)
│  │  └─ webhooks/
│  │     ├─ printify/route.ts        # order events, fulfillment, tracking
│  │     ├─ etsy/route.ts            # order created/paid, status updates
│  │     └─ amazon/route.ts          # order / feed processing callbacks
│  └─ layout.tsx                      # Site shell (Navbar, DaisyUI theme)
│
├─ components/
│  ├─ Navbar.tsx
│  ├─ ProductCard.tsx
│  ├─ AdminTabs.tsx                   # Simple tab switcher (DaisyUI)
│  ├─ UploadForm.tsx                  # File input + submit
│  ├─ GenerateForm.tsx                # Prompt input + size/finish options
│  └─ AnalyticsChart.tsx              # Lightweight chart (client-only)
│
├─ lib/
│  ├─ db.ts                           # Prisma client (singleton)
│  ├─ schema.ts                       # Zod types for requests (upload/generate/publish)
│  ├─ auth.ts                         # Tiny admin gate (basic password or token)
│  ├─ storage.ts                      # Save images (local / S3-compatible)
│  ├─ printify.ts                     # Minimal typed calls used today
│  ├─ etsy.ts                         # OAuth + create listing + upload images
│  ├─ amazon.ts                       # LWA/SP-API auth + submit product feed
│  └─ analytics.ts                    # Simple metrics (SQL queries)
│
├─ prisma/
│  └─ schema.prisma                   # ONE file: Design, Asset, Product, Listing, Sale
│
├─ public/                            # Static assets (logo, placeholder mockups)
├─ styles/
│  └─ globals.css                     # Tailwind base + DaisyUI
├─ middleware.ts                      # Protect /admin & /api/admin with env password
├─ tailwind.config.ts
├─ postcss.config.js
├─ next.config.js
├─ package.json
├─ .env.example
└─ README.md
```

> If you want **even fewer files**, keep all admin tabs in `app/(admin)/admin/page.tsx` and move small forms into inline components.

---

## Data model (single `schema.prisma`)

Minimal tables to power storefront, listings, and analytics:

```prisma
// prisma/schema.prisma
datasource db { provider = "sqlite"; url = "file:./dev.db" }
generator client { provider = "prisma-client-js" }

model Design {
  id        String   @id @default(cuid())
  prompt    String
  tags      String[] @default([])
  status    String   @default("draft") // draft|rendered|mocked|published
  assets    Asset[]
  products  Product[]
  createdAt DateTime @default(now())
}

model Asset {
  id        String   @id @default(cuid())
  designId  String
  design    Design   @relation(fields: [designId], references: [id])
  kind      String   // source|print|mockup
  url       String
  width     Int
  height    Int
  dpi       Int?
  createdAt DateTime @default(now())
}

model Product {
  id               String   @id @default(cuid())
  designId         String
  design           Design   @relation(fields: [designId], references: [id])
  slug             String   @unique
  title            String
  description      String
  printifyId       String?  // product id on Printify
  optionsJson      String   // sizes/finishes JSON
  listings         Listing[]
  createdAt        DateTime @default(now())
}

model Listing {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  channel     String   // site|etsy|amazon
  externalId  String?  // Etsy listing id, Amazon ASIN/Feed id
  status      String   @default("pending")
  priceCents  Int
  seoTitle    String
  keywords    String[] @default([])
  createdAt   DateTime @default(now())
}

model Sale {
  id          String   @id @default(cuid())
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id])
  channel     String   // site|etsy|amazon
  qty         Int
  totalCents  Int
  utmSource   String?  // tracking for your site
  createdAt   DateTime @default(now())
}
```

---

## Admin auth (super simple)

* **`middleware.ts`** protects `/admin` and `/api/admin/**`.
* Use an **env password** (e.g., `ADMIN_PASSWORD`); set cookie `admin=1` on login.

This avoids NextAuth complexity for MVP and keeps files light.

---

## API contracts (1 zod file)

**`lib/schema.ts`** defines all input shapes the API uses:

```ts
// lib/schema.ts
import { z } from "zod";

export const UploadSticker = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  tags: z.array(z.string()).max(10),
  fileName: z.string(),          // uploaded PNG name
  sizeInches: z.enum(["2","3","4"]),
  finish: z.enum(["glossy","matte"]),
});

export const GenerateSticker = z.object({
  prompt: z.string().min(10),
  theme: z.string().optional(),
  count: z.number().min(1).max(8).default(1),
});

export const PublishEtsy = z.object({
  productId: z.string(),
  priceCents: z.number().int().positive(),
});

export const PublishAmazon = z.object({
  productId: z.string(),
  priceCents: z.number().int().positive(),
});
```

---

## Minimal integrations (one file each)

* **`lib/printify.ts`**: create product, upload print file, get mockups
* **`lib/etsy.ts`**: OAuth token store, `createListing()`, `uploadImage()`, `setPrice()`
* **`lib/amazon.ts`**: LWA auth, submit product feed (defer details, keep a single helper)

Each file only exports **the 3–5 calls you need now**, typed with zod parse on responses.

---

## Pages & UI (DaisyUI keeps markup tiny)

* **Storefront** (Home + Product):

  * Grid of `ProductCard` (image, title, price, “Buy on Etsy” or “Add to Cart” later)
* **Admin** (one page with tabs):

  * **Upload**: PNG picker → POST `/api/admin/upload`
  * **Generate**: prompt → POST `/api/admin/generate`
  * **Listings**: table of products with “Publish to Etsy” / “Publish to Amazon”
  * **Analytics**: charts from `/api/admin/analytics`

---

## Sales analytics (single endpoint + tiny chart)

* `/api/admin/analytics` aggregates:

  * Revenue by channel (site / Etsy / Amazon)
  * Top products by sales
  * Source breakdown (UTM for your site)
* **`lib/analytics.ts`**: one module with SQL queries.
* **`components/AnalyticsChart.tsx`**: simple client component (DaisyUI cards + a minimal chart lib or plain table for MVP).

---

## Environment variables (`.env.example`)

```
DATABASE_URL="file:./prisma/dev.db"
ADMIN_PASSWORD="supersecret"

# Storage (local by default; S3 later)
FILE_STORAGE_DIR="./uploads"

# Printify
PRINTIFY_API_KEY=""

# Etsy
ETSY_CLIENT_ID=""
ETSY_CLIENT_SECRET=""
ETSY_REDIRECT_URI="https://yourdomain.com/api/webhooks/etsy"  # or separate /oauth

# Amazon SP-API (defer until Phase 3)
AMAZON_CLIENT_ID=""
AMAZON_CLIENT_SECRET=""
SPAPI_REFRESH_TOKEN=""
SPAPI_ROLE_ARN=""
```

---

## Build order (you can ship this fast)

1. **Scaffold** Next + Tailwind + DaisyUI; add Prisma (SQLite) and `lib/db.ts`.
2. **Public pages**: `/(site)/page.tsx` (grid) + `/product/[slug]`.
3. **Admin gate**: `middleware.ts` with password env + a tiny login form on `/admin`.
4. **Upload flow**: `UploadForm` → `/api/admin/upload` → store file (`lib/storage.ts`) → create `Design`, `Asset`, `Product`.
5. **Printify publish**: in `/api/admin/upload` (or a separate button) call `lib/printify.ts` to create product & fetch mockups, then update `Product.printifyId`.
6. **Etsy listing**: `/api/admin/publish/etsy` calls `lib/etsy.ts` with mockups, price, and SEO title; store `Listing`.
7. **Webhooks**: `app/api/webhooks/printify` + `etsy` create `Sale` rows and update tracking.
8. **Analytics**: `/api/admin/analytics` → `components/AnalyticsChart` renders summaries.

---

## Notes on “few files” promise

* You can **inline** small admin tabs inside `admin/page.tsx` and delete `upload.tsx`, `generate.tsx`, and `analytics.tsx`.
* Keep integration wrappers **tiny**; one file per service keeps mental load low.
* Only **one Prisma schema** file; everything else is derived.

---

If you want, I can next provide:

* a **starter `schema.prisma`** file (copy-paste ready),
* the **`middleware.ts`** admin gate,
* and **skeleton route handlers** (`/api/admin/upload`, `/api/admin/publish/etsy`, `/api/admin/analytics`)
  — all kept extremely small and TypeScript-strict.
