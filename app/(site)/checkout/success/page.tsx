"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sessionId, refreshCart } = useCart();
  const [orderNumber, setOrderNumber] = useState("");
  const [isConfirming, setIsConfirming] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const paymentIntent = searchParams.get("payment_intent");

    if (!paymentIntent) {
      router.push("/");
      return;
    }

    const confirmPayment = async () => {
      try {
        const response = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to confirm payment");
        }

        const data = await response.json();
        setOrderNumber(data.orderNumber);

        // Refresh cart to clear it
        await refreshCart();
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setError("There was an issue confirming your order. Please contact support.");
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [searchParams, sessionId, router, refreshCart]);

  if (isConfirming) {
    return (
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4 text-xl">Confirming your order...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="alert alert-error max-w-md mx-auto">
              <span>{error}</span>
            </div>
            <Link href="/" className="btn btn-primary mt-8">
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>

          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title justify-center">Order Number</h2>
              <p className="text-3xl font-mono font-bold text-primary">
                {orderNumber}
              </p>
            </div>
          </div>

          <p className="text-lg mb-2">
            Thank you for your purchase! We've received your order and will begin processing it shortly.
          </p>
          <p className="text-gray-500 mb-8">
            You will receive an email confirmation shortly with your order details.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}
