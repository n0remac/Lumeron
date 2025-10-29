import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { RemoveFromCart } from "@/lib/schema";
import type { CartItem } from "@/lib/cart";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const validated = RemoveFromCart.parse(body);

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

    // Filter out the item
    items = items.filter(
      (item) =>
        !(
          item.productId === validated.productId &&
          item.size === validated.size &&
          item.finish === validated.finish
        )
    );

    // Save updated cart
    await prisma.cart.update({
      where: { sessionId: validated.sessionId },
      data: { itemsJson: JSON.stringify(items) },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Remove from cart error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
