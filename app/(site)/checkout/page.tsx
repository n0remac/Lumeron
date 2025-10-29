"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCart } from "@/lib/cart-context";
import CheckoutForm from "@/components/CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const SHIPPING_COST_CENTS = 500; // $5.00

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, totalCents, sessionId } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  const subtotalCents = totalCents;
  const grandTotalCents = subtotalCents + SHIPPING_COST_CENTS;

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name || !address.street || !address.city || !address.state || !address.zip) {
      setError("Please fill in all required fields");
      return;
    }

    setIsCreatingIntent(true);
    setError("");

    try {
      const response = await fetch("/api/checkout/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          email,
          name,
          address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment intent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsCreatingIntent(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <main>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {!showPayment ? (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title mb-4">Shipping Information</h2>

                  <form onSubmit={handleProceedToPayment} className="space-y-4">
                    {/* Email */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input input-bordered"
                        required
                      />
                    </div>

                    {/* Name */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input input-bordered"
                        required
                      />
                    </div>

                    {/* Street Address */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Street Address</span>
                      </label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className="input input-bordered"
                        required
                      />
                    </div>

                    {/* City, State, Zip */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">City</span>
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="input input-bordered"
                          required
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">State</span>
                        </label>
                        <input
                          type="text"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          className="input input-bordered"
                          maxLength={2}
                          placeholder="CA"
                          required
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">ZIP Code</span>
                        </label>
                        <input
                          type="text"
                          value={address.zip}
                          onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                          className="input input-bordered"
                          required
                        />
                      </div>
                    </div>

                    {/* Country */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Country</span>
                      </label>
                      <select
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        className="select select-bordered"
                        required
                      >
                        <option value="US">United States</option>
                      </select>
                    </div>

                    {error && (
                      <div className="alert alert-error">
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isCreatingIntent}
                      className="btn btn-primary btn-block btn-lg"
                    >
                      {isCreatingIntent ? (
                        <>
                          <span className="loading loading-spinner"></span>
                          Processing...
                        </>
                      ) : (
                        "Continue to Payment"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title mb-4">Payment Information</h2>

                  {clientSecret && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: "night",
                        },
                      }}
                    >
                      <CheckoutForm />
                    </Elements>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl sticky top-4">
              <div className="card-body">
                <h2 className="card-title">Order Summary</h2>

                <div className="divider"></div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.finish}`}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.title} ({item.size}", {item.finish}) x{item.quantity}
                      </span>
                      <span>${((item.priceCents * item.quantity) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
