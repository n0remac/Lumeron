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

export const AddToCart = z.object({
  sessionId: z.string().min(1),
  productId: z.string().min(1),
  size: z.string().min(1),
  finish: z.enum(["glossy", "matte"]),
  quantity: z.number().int().min(1).max(99),
});

export const UpdateCartItem = z.object({
  sessionId: z.string().min(1),
  productId: z.string().min(1),
  size: z.string().min(1),
  finish: z.string().min(1),
  quantity: z.number().int().min(0).max(99), // 0 to remove
});

export const RemoveFromCart = z.object({
  sessionId: z.string().min(1),
  productId: z.string().min(1),
  size: z.string().min(1),
  finish: z.string().min(1),
});

export const CheckoutForm = z.object({
  sessionId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(2),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(2),
    zip: z.string().min(3),
    country: z.string().min(2),
  }),
});

export const UpdateOrderStatus = z.object({
  status: z.enum(["pending", "paid", "fulfilled", "cancelled"]),
});

export type UploadStickerInput = z.infer<typeof UploadSticker>;
export type GenerateStickerInput = z.infer<typeof GenerateSticker>;
export type PublishEtsyInput = z.infer<typeof PublishEtsy>;
export type PublishAmazonInput = z.infer<typeof PublishAmazon>;
export type AddToCartInput = z.infer<typeof AddToCart>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItem>;
export type RemoveFromCartInput = z.infer<typeof RemoveFromCart>;
export type CheckoutFormInput = z.infer<typeof CheckoutForm>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatus>;
