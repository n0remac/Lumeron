import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Verify webhook signature
    // const signature = request.headers.get("X-Printify-Signature");

    const { type, data } = body;

    switch (type) {
      case "order.created":
        console.log("Printify order created:", data);
        // Handle order creation
        break;

      case "order.updated":
        console.log("Printify order updated:", data);
        // Handle order update (fulfillment, tracking, etc.)
        break;

      case "product.updated":
        console.log("Printify product updated:", data);
        // Update product information
        break;

      default:
        console.log("Unknown Printify webhook type:", type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Printify webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
