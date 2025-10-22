# Etsy — Open API v3 (Listings, Images, Orders)

## 1) Create an Etsy developer app

1. Go to the Etsy Open API portal and create an app. ([Etsy Developers][1])
2. Note your **Client ID** (a.k.a. “keystring”).
3. In your app settings, add your **OAuth redirect URI** (you can use a local URL during dev).
4. You’ll use Etsy’s standard OAuth 2.0 flow; token scopes are required per endpoint. For **creating listings** you need the **`listings_w`** scope. ([Etsy Developer][2])

**Helpful:** Etsy’s Quick Start shows the full OAuth flow with Node.js. ([Etsy Developers][3])

## 2) Scopes you’ll likely need (minimum)

* **`listings_w`** – create/update listings. ([Etsy Developer][2])
* **`shops_r`** – read shop info (useful for sanity checks). ([Etsy Developers][4])
* **`transactions_r`** – read orders if you want to ingest order data directly. (Community notes and many examples reference this for order access.) ([GitHub][5])

## 3) OAuth in your Next.js app (high level)

* Add a route (e.g., `/api/etsy/oauth/start`) that redirects users to Etsy’s authorize URL with your **client_id**, **redirect_uri**, **scopes**, and **state**.
* Etsy redirects back to your **redirect_uri** with a **code**. Exchange it server-side for **access** (and optionally **refresh**) tokens. Etsy uses `https://api.etsy.com/v3/` (or `https://openapi.etsy.com/v3/`) as the base. ([Etsy Developers][6])

## 4) First endpoints to wire

* **Create a draft listing:** `POST /v3/application/shops/{shop_id}/listings` (often called “createDraftListing” in the tutorial). ([Etsy Developer][7])
* **Add images to a listing** (required before publishing): upload at least one listing image. ([Etsy Developer][7])
* **Activate/update listing** (price, quantity, SKU variants). (All listed in the v3 reference.) ([Etsy Developers][4])

## 5) Webhooks / Orders

For a simple MVP you can poll orders; later you can add a webhook intake route (e.g., `/api/webhooks/etsy`) and store sales in your `Sale` table. (Etsy’s v3 reference shows order and shop endpoints; you can also use a polling job.) ([Etsy Developers][4])

## 6) Project wiring (env + config)

Add to `.env.local`:

```
ETSY_CLIENT_ID=...
ETSY_CLIENT_SECRET=...
ETSY_REDIRECT_URI=https://yourdomain.com/api/etsy/oauth/callback
ETSY_SCOPES=listings_w shops_r transactions_r
```

**Where to use in your code**

* `lib/etsy.ts`: `getAuthorizeUrl()`, `exchangeCodeForTokens()`, `createDraftListing()`, `uploadListingImage()`, `updateListingPriceInventory()`.
* `app/api/etsy/oauth/*`: start + callback handlers.
* `app/api/admin/publish/etsy/route.ts`: takes a `productId`, pulls assets, creates listing, uploads images, sets price, and returns the `listing_id`.

**References**

* Open API v3 home & reference. ([Etsy Developers][1])
* Listings tutorial (flow and required image before publish). ([Etsy Developer][7])
* Authentication + scopes (note `listings_w`). ([Etsy Developer][2])
* Request standards (API base URLs). ([Etsy Developers][6])

---

# Amazon — Selling Partner API (SP-API) for Listings

Amazon is more steps than Etsy. The shortest path for new listings is:

* Register as **SP-API developer**
* Create app in **Seller Central**
* Set up **LWA** (Login With Amazon) OAuth credentials
* Set up **IAM role** (role ARN) for SP-API access
* Use **Product Type Definitions API** to fetch the schema for your category
* Submit a **JSON_LISTINGS_FEED** with your product data to create/update the listing

## 1) Register & create your app

1. **Register as an SP-API developer** in Seller Central (Partner Network → *Develop Apps* → complete Developer Profile). ([Amazon Developer Docs][8])
2. If you’re building an app only for your own seller account, you can register as a private (self-authorized) app; public apps require Appstore listing and per-seller OAuth. ([Amazon Developer Docs][9])
3. Follow the **Onboarding overview** to complete developer/app registration. ([Amazon Developer Docs][10])

## 2) Auth building blocks you need

* **LWA (Login with Amazon) client** (Client ID/Secret) for OAuth to obtain seller-authorized access tokens. ([Amazon Developer Docs][10])
* **IAM Role ARN** that your SP-API app assumes to call the APIs. (Typical pattern in AWS quick starts.) ([AWS Quick Start][11])

You’ll store:

```
AMAZON_LWA_CLIENT_ID=...
AMAZON_LWA_CLIENT_SECRET=...
SPAPI_REFRESH_TOKEN=...        # after authorizing the app for your seller
SPAPI_ROLE_ARN=...             # IAM role for SP-API
SPAPI_REGION=na                 # or eu / fe depending on your marketplace
```

## 3) Choose your marketplace & product type

Before you can send a product:

* Query **Product Type Definitions API** to find the **productType** and fetch the JSON schema for the chosen marketplace. You’ll use this schema to build valid JSON for the listings feed. ([Amazon Developer Docs][12])

## 4) Create a listing (2025-current recommended path)

* Build a **`JSON_LISTINGS_FEED`** document that conforms to the product type schema you retrieved.
* Submit it via the **Feeds API**; monitor processing until it completes; capture the created **ASIN/SKU** and any warnings/errors. (Amazon calls out specific rate limits and the fact you should use the product type schema to assemble payloads.) ([Amazon Developer Docs][13])

## 5) Minimal endpoint flow you’ll call

* **LWA token**: exchange refresh token → access token (per request). ([Amazon Developer Docs][10])
* **Product Type Definitions API**: `searchDefinitionsProductTypes`, `getDefinitionsProductType`. Use the returned JSON schema to validate your product payload. ([Amazon Developer Docs][12])
* **Feeds API**: `createFeed` (with `JSON_LISTINGS_FEED`), `getFeed`, `getFeedDocument`, `getFeedProcessingReport`. (The “Listings Feed Type Values” doc covers this feed type and notes rate limits.) ([Amazon Developer Docs][13])

## 6) Orders & fulfillment later

Once live, you can use Orders API (or just rely on Printify + marketplace updates) and periodically reconcile. (Amazon’s onboarding and overview docs outline the API families for orders, pricing, inventory, etc.) ([Amazon Developer Docs][10])

## 7) Project wiring (env + modules)

* `lib/amazon.ts`:

  * `getAccessTokenFromLWA(refreshToken)`
  * `getProductTypeSchema(productType, marketplace)`
  * `submitJsonListingsFeed(payload, marketplace)`
  * `pollFeed(feedId)` → returns processing report (capturing SKU/ASIN)
* `app/api/admin/publish/amazon/route.ts`:

  * Input: `productId`, `priceCents`, `marketplaceId`
  * Build product payload from DB + Printify data
  * Validate against product type schema (zod from the JSON schema)
  * Submit feed + poll; persist `externalId` (ASIN) to `Listing`

**References**

* Register as public developer (context on app types and OAuth). ([Amazon Developer Docs][9])
* Onboarding overview (flow of auth and API families). ([Amazon Developer Docs][10])
* Product Type Definitions API (get JSON schema). ([Amazon Developer Docs][12])
* Managing product listings guide (references to PTD & listings). ([Amazon Developer Docs][14])
* Listings feed type values (JSON_LISTINGS_FEED, rate-limit note). Updated recently. ([Amazon Developer Docs][13])
* “Develop Apps” path in Seller Central (click path). ([Amazon Developer Docs][8])

---

## Suggested checklist to keep this lean

**Etsy (day 1–2)**

* [ ] Create developer app; add redirect URL
* [ ] Implement `/api/etsy/oauth/start` + `/api/etsy/oauth/callback`
* [ ] Store tokens; request `listings_w shops_r` scopes
* [ ] Implement `createDraftListing` → `uploadListingImage` → `activate/update`
* [ ] Add `/api/webhooks/etsy` (or a polling job) to record sales

**Amazon (after Etsy is live)**

* [ ] Complete Developer Profile → create app in Seller Central
* [ ] Set up LWA + IAM Role ARN; get self-authorization (private app)
* [ ] Implement PTD lookup → build product JSON by schema
* [ ] Submit `JSON_LISTINGS_FEED` → poll → persist ASIN/Feed report
* [ ] Add basic order sync or rely on Printify + manual reconciliation initially

If you want, I can draft **minimal TypeScript skeletons** for:

* an Etsy OAuth callback route + `lib/etsy.ts` client, and
* an Amazon `lib/amazon.ts` that: fetches a product type schema, validates a payload, and submits a `JSON_LISTINGS_FEED`.
