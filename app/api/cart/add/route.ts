import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AddToCart } from "@/lib/schema";
import type { CartItem } from "@/lib/cart";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = AddToCart.parse(body);

    // Fetch product details
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
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
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Parse variants to get price
    let variantsData: { variants?: Array<{ size: string; finish: string; priceCents: number }> };
    try {
      variantsData = JSON.parse(product.variantsJson);
    } catch {
      return NextResponse.json(
        { error: "Product variants not configured" },
        { status: 400 }
      );
    }

    const variant = variantsData.variants?.find(
      (v) => v.size === validated.size && v.finish === validated.finish
    );

    if (!variant) {
      return NextResponse.json(
        { error: "Variant not available" },
        { status: 400 }
      );
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { sessionId: validated.sessionId },
    });

    let items: CartItem[] = [];
    if (cart) {
      try {
        items = JSON.parse(cart.itemsJson);
      } catch {
        items = [];
      }
    }

    // Check if item already exists in cart
    const existingItemIndex = items.findIndex(
      (item) =>
        item.productId === validated.productId &&
        item.size === validated.size &&
        item.finish === validated.finish
    );

    const imageUrl = product.design.assets[0]?.url || "/placeholder.png";

    if (existingItemIndex >= 0) {
      // Update quantity
      items[existingItemIndex].quantity += validated.quantity;
      items[existingItemIndex].priceCents = variant.priceCents; // Update to current price
    } else {
      // Add new item
      items.push({
        productId: validated.productId,
        slug: product.slug,
        title: product.title,
        size: validated.size,
        finish: validated.finish,
        quantity: validated.quantity,
        priceCents: variant.priceCents,
        imageUrl,
      });
    }

    // Save cart
    if (cart) {
      cart = await prisma.cart.update({
        where: { sessionId: validated.sessionId },
        data: { itemsJson: JSON.stringify(items) },
      });
    } else {
      cart = await prisma.cart.create({
        data: {
          sessionId: validated.sessionId,
          itemsJson: JSON.stringify(items),
        },
      });
    }

    return NextResponse.json({ cart, items });
  } catch (error) {
    console.error("Add to cart error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
