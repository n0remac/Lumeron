"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

type Variant = {
  size: string;
  finish: string;
  priceCents: number;
};

type AddToCartFormProps = {
  productId: string;
  slug: string;
  title: string;
  imageUrl: string;
  variants: Variant[];
};

export default function AddToCartForm({
  productId,
  slug,
  title,
  imageUrl,
  variants,
}: AddToCartFormProps) {
  const router = useRouter();
  const { addItem, isLoading } = useCart();
  const [selectedSize, setSelectedSize] = useState(variants[0]?.size || "");
  const [selectedFinish, setSelectedFinish] = useState(variants[0]?.finish || "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const availableSizes = [...new Set(variants.map((v) => v.size))];
  const availableFinishes = [...new Set(variants.map((v) => v.finish))];

  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.finish === selectedFinish
  );

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setError("Please select size and finish");
      return;
    }

    setError("");
    setSuccess(false);

    try {
      await addItem({
        productId,
        slug,
        title,
        size: selectedSize,
        finish: selectedFinish,
        priceCents: selectedVariant.priceCents,
        imageUrl,
        quantity,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError("Failed to add to cart. Please try again.");
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      setError("Please select size and finish");
      return;
    }

    setError("");

    try {
      await addItem({
        productId,
        slug,
        title,
        size: selectedSize,
        finish: selectedFinish,
        priceCents: selectedVariant.priceCents,
        imageUrl,
        quantity,
      });

      router.push("/cart");
    } catch (err) {
      setError("Failed to add to cart. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      <div>
        <h3 className="font-semibold mb-2">Size</h3>
        <div className="flex gap-2">
          {availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`btn ${
                selectedSize === size ? "btn-primary" : "btn-outline"
              }`}
            >
              {size}"
            </button>
          ))}
        </div>
      </div>

      {/* Finish Selector */}
      <div>
        <h3 className="font-semibold mb-2">Finish</h3>
        <div className="flex gap-2">
          {availableFinishes.map((finish) => (
            <button
              key={finish}
              onClick={() => setSelectedFinish(finish)}
              className={`btn ${
                selectedFinish === finish ? "btn-primary" : "btn-outline"
              } capitalize`}
            >
              {finish}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <h3 className="font-semibold mb-2">Quantity</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="btn btn-sm btn-circle"
            disabled={quantity <= 1}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="input input-bordered w-20 text-center"
            min="1"
            max="99"
          />
          <button
            onClick={() => setQuantity(Math.min(99, quantity + 1))}
            className="btn btn-sm btn-circle"
            disabled={quantity >= 99}
          >
            +
          </button>
        </div>
      </div>

      {/* Price */}
      {selectedVariant && (
        <div className="text-3xl font-bold text-primary">
          ${((selectedVariant.priceCents * quantity) / 100).toFixed(2)}
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>Added to cart!</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleAddToCart}
          disabled={isLoading || !selectedVariant}
          className="btn btn-primary btn-block"
        >
          {isLoading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isLoading || !selectedVariant}
          className="btn btn-outline btn-block"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
