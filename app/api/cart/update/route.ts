import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateCartItem } from "@/lib/schema";
import type { CartItem } from "@/lib/cart";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validated = UpdateCartItem.parse(body);

    const cart = await prisma.cart.findUnique({
      where: { sessionId: validated.sessionId },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    let items: CartItem[] = [];
    try {
      items = JSON.parse(cart.itemsJson);
    } catch {
      items = [];
    }

    // Find and update the item
    const itemIndex = items.findIndex(
      (item) =>
        item.productId === validated.productId &&
        item.size === validated.size &&
        item.finish === validated.finish
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    if (validated.quantity === 0) {
      // Remove item
      items.splice(itemIndex, 1);
    } else {
      // Update quantity
      items[itemIndex].quantity = validated.quantity;
    }

    // Save updated cart
    await prisma.cart.update({
      where: { sessionId: validated.sessionId },
      data: { itemsJson: JSON.stringify(items) },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Update cart error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}
