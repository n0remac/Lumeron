// lib/etsy.ts
const ETSY_CLIENT_ID = process.env.ETSY_CLIENT_ID || "";
const ETSY_CLIENT_SECRET = process.env.ETSY_CLIENT_SECRET || "";
const ETSY_BASE_URL = "https://openapi.etsy.com/v3";

type EtsyListing = {
  listing_id: number;
  title: string;
  description: string;
  price: string;
  state: string;
};

export async function getOAuthToken(): Promise<string> {
  // TODO: Implement OAuth token retrieval/refresh
  // For now, return from env or empty string
  return process.env.ETSY_ACCESS_TOKEN || "";
}

export async function createListing(params: {
  title: string;
  description: string;
  priceCents: number;
  quantity: number;
  tags: string[];
}): Promise<EtsyListing> {
  // TODO: Implement actual Etsy API call
  console.log("Creating Etsy listing:", params);

  return {
    listing_id: Math.floor(Math.random() * 1000000),
    title: params.title,
    description: params.description,
    price: (params.priceCents / 100).toFixed(2),
    state: "draft",
  };
}

export async function uploadImage(
  listingId: number,
  imageUrl: string
): Promise<void> {
  // TODO: Implement actual Etsy image upload
  console.log("Uploading image to Etsy listing:", listingId, imageUrl);
}

export async function setPrice(
  listingId: number,
  priceCents: number
): Promise<void> {
  // TODO: Implement actual Etsy price update
  console.log("Setting Etsy listing price:", listingId, priceCents);
}

export async function publishListing(listingId: number): Promise<void> {
  // TODO: Implement actual Etsy listing publish
  console.log("Publishing Etsy listing:", listingId);
}

export async function getListing(listingId: number): Promise<EtsyListing | null> {
  // TODO: Implement actual Etsy API call
  console.log("Getting Etsy listing:", listingId);
  return null;
}
