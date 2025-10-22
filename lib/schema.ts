// lib/schema.ts
import { z } from "zod";

export const UploadSticker = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  tags: z.array(z.string()).max(10),
  fileName: z.string(), // uploaded PNG name
  sizeInches: z.enum(["2", "3", "4"]),
  finish: z.enum(["glossy", "matte"]),
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

export type UploadStickerInput = z.infer<typeof UploadSticker>;
export type GenerateStickerInput = z.infer<typeof GenerateSticker>;
export type PublishEtsyInput = z.infer<typeof PublishEtsy>;
export type PublishAmazonInput = z.infer<typeof PublishAmazon>;
