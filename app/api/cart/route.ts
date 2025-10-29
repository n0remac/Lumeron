import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { CartItem } from "@/lib/cart";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    let items: CartItem[] = [];
    try {
      items = JSON.parse(cart.itemsJson);
    } catch {
      items = [];
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
