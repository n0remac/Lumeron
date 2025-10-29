import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const ConfirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1),
  sessionId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ConfirmPaymentSchema.parse(body);

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      validated.paymentIntentId
    );

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Find order by PaymentIntent ID
    const order = await prisma.order.findUnique({
      where: { stripePaymentIntentId: validated.paymentIntentId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update order status to paid
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Create Sale records for analytics
    for (const item of order.items) {
      // Find or create a "site" listing for this product
      let listing = await prisma.listing.findFirst({
        where: {
          productId: item.productId,
          channel: "site",
        },
      });

      if (!listing) {
        // Create a site listing if it doesn't exist
        listing = await prisma.listing.create({
          data: {
            productId: item.productId,
            channel: "site",
            status: "active",
            priceCents: item.priceCents,
            seoTitle: item.product.title,
          },
        });
      }

      // Create sale record
      await prisma.sale.create({
        data: {
          listingId: listing.id,
          channel: "site",
          qty: item.quantity,
          totalCents: item.priceCents * item.quantity,
        },
      });
    }

    // Clear the cart
    try {
      await prisma.cart.delete({
        where: { sessionId: validated.sessionId },
      });
    } catch {
      // Cart might not exist, ignore
    }

    return NextResponse.json({
      order: updatedOrder,
      orderNumber: updatedOrder.orderNumber,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}
