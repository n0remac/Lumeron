import { randomBytes } from "crypto";
import { prisma } from "./db";

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  size: string;
  finish: string;
  quantity: number;
  priceCents: number;
  imageUrl?: string;
};

/**
 * Generate a unique session ID for guest carts
 */
export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Calculate total price for all items in cart
 */
export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + item.priceCents * item.quantity;
  }, 0);
}

/**
 * Validate cart items against current product data
 * Returns validated items with current prices, or throws if products don't exist
 */
export async function validateCartItems(
  items: CartItem[]
): Promise<CartItem[]> {
  const validatedItems: CartItem[] = [];

  for (const item of items) {
    // Fetch product to verify it exists
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: {
        design: {
          include: {
            assets: {
              where: { kind: "mockup" },
              take: 1,
            },
          },
        },
      },
    });

    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    // Parse variants to get current price
    let variantsData: { variants?: Array<{ size: string; finish: string; priceCents: number }> };
    try {
      variantsData = JSON.parse(product.variantsJson);
    } catch {
      variantsData = {};
    }

    // Find matching variant
    const variant = variantsData.variants?.find(
      (v) => v.size === item.size && v.finish === item.finish
    );

    if (!variant) {
      throw new Error(
        `Variant ${item.size}/${item.finish} not found for product ${item.productId}`
      );
    }

    // Get image URL
    const imageUrl =
      product.design.assets[0]?.url || item.imageUrl || "/placeholder.png";

    validatedItems.push({
      productId: item.productId,
      slug: product.slug,
      title: product.title,
      size: item.size,
      finish: item.finish,
      quantity: item.quantity,
      priceCents: variant.priceCents, // Use current price from database
      imageUrl,
    });
  }

  return validatedItems;
}
