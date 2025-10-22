import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Amazon SP-API sends notifications via SNS
    // TODO: Verify SNS signature

    const { Type, Message } = body;

    if (Type === "SubscriptionConfirmation") {
      // Handle SNS subscription confirmation
      console.log("SNS subscription confirmation");
      return NextResponse.json({ received: true });
    }

    if (Type === "Notification" && Message) {
      const message = typeof Message === "string" ? JSON.parse(Message) : Message;
      const { notificationType, payload } = message;

      switch (notificationType) {
        case "ORDER_CHANGE":
          console.log("Amazon order change:", payload);
          // Handle order creation/update
          break;

        case "FEED_PROCESSING_FINISHED":
          console.log("Amazon feed processing finished:", payload);
          // Update listing status based on feed results
          break;

        case "PRODUCT_TYPE_DEFINITIONS_CHANGE":
          console.log("Amazon product type definitions change:", payload);
          break;

        default:
          console.log("Unknown Amazon notification type:", notificationType);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Amazon webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
