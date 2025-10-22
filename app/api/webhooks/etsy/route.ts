import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Verify webhook signature
    // const signature = request.headers.get("X-Etsy-Signature");

    const { event_type, data } = body;

    switch (event_type) {
      case "listing_created":
        console.log("Etsy listing created:", data);
        break;

      case "receipt_created":
        console.log("Etsy order created:", data);
        // Create sale record
        if (data.listing_id) {
          const listing = await prisma.listing.findFirst({
            where: {
              channel: "etsy",
              externalId: data.listing_id.toString(),
            },
          });

          if (listing) {
            await prisma.sale.create({
              data: {
                listingId: listing.id,
                channel: "etsy",
                qty: data.quantity || 1,
                totalCents: Math.round((data.price?.amount || 0) * 100),
              },
            });
          }
        }
        break;

      case "receipt_paid":
        console.log("Etsy order paid:", data);
        break;

      default:
        console.log("Unknown Etsy webhook type:", event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Etsy webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
