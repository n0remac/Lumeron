import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { CheckoutForm } from "@/lib/schema";
import { validateCartItems, calculateCartTotal } from "@/lib/cart";
import { generateOrderNumber } from "@/lib/orders";
import type { CartItem } from "@/lib/cart";

// Fixed shipping cost for MVP (in cents)
const SHIPPING_COST_CENTS = 500; // $5.00

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = CheckoutForm.parse(body);

    // Get cart
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
      return NextResponse.json(
        { error: "Invalid cart data" },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Validate cart items against current product data
    const validatedItems = await validateCartItems(items);

    // Calculate totals
    const subtotalCents = calculateCartTotal(validatedItems);
    const shippingCents = SHIPPING_COST_CENTS;
    const totalCents = subtotalCents + shippingCents;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create draft order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        email: validated.email,
        name: validated.name,
        shippingAddressJson: JSON.stringify(validated.address),
        subtotalCents,
        shippingCents,
        totalCents,
        status: "pending",
      },
    });

    // Create order items
    for (const item of validatedItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          title: item.title,
          size: item.size,
          finish: item.finish,
          quantity: item.quantity,
          priceCents: item.priceCents,
        },
      });
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with PaymentIntent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);

    if (error instanceof Error) {
      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Invalid request data" },
          { status: 400 }
        );
      }
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
