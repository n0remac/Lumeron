"use client";

import { useCart } from "@/lib/cart-context";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, itemCount, totalCents, updateQuantity, removeItem, isLoading } = useCart();

  const SHIPPING_COST_CENTS = 500; // $5.00
  const subtotalCents = totalCents;
  const grandTotalCents = subtotalCents + SHIPPING_COST_CENTS;

  if (items.length === 0) {
    return (
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-8">
              Add some awesome stickers to your cart!
            </p>
            <Link href="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.finish}`}
                className="card bg-base-100 shadow-xl"
              >
                <div className="card-body">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <Link
                        href={`/product/${item.slug}`}
                        className="card-title hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-gray-500">
                        Size: {item.size}" | Finish: {item.finish}
                      </p>
                      <p className="text-lg font-bold text-primary">
                        ${(item.priceCents / 100).toFixed(2)} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.productId, item.size, item.finish)}
                        className="btn btn-ghost btn-sm btn-circle"
                        disabled={isLoading}
                      >
                        ✕
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.finish,
                              item.quantity - 1
                            )
                          }
                          className="btn btn-sm btn-circle"
                          disabled={isLoading || item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.finish,
                              item.quantity + 1
                            )
                          }
                          className="btn btn-sm btn-circle"
                          disabled={isLoading || item.quantity >= 99}
                        >
                          +
                        </button>
                      </div>

                      <p className="text-lg font-bold">
                        ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-4">
              <div className="card-body">
                <h2 className="card-title">Order Summary</h2>

                <div className="divider"></div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>${(subtotalCents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${(SHIPPING_COST_CENTS / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ${(grandTotalCents / 100).toFixed(2)}
                  </span>
                </div>

                <Link href="/checkout" className="btn btn-primary btn-block mt-4">
                  Proceed to Checkout
                </Link>

                <Link href="/" className="btn btn-ghost btn-block">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
