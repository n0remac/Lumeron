import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentCanceled(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    console.error(`Order not found for PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  // Update order status to paid
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid" },
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

    await prisma.sale.create({
      data: {
        listingId: listing.id,
        channel: "site",
        qty: item.quantity,
        totalCents: item.priceCents * item.quantity,
      },
    });
  }

  console.log(`Payment succeeded for order: ${order.orderNumber}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!order) {
    console.error(`Order not found for PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  console.error(
    `Payment failed for order: ${order.orderNumber}`,
    paymentIntent.last_payment_error?.message
  );

  // Keep order as pending so customer can retry
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const order = await prisma.order.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!order) {
    console.error(`Order not found for PaymentIntent: ${paymentIntent.id}`);
    return;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "cancelled" },
  });

  console.log(`Payment canceled for order: ${order.orderNumber}`);
}
