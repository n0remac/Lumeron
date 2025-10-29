"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { CartItem } from "./cart";

type CartContextType = {
  sessionId: string;
  items: CartItem[];
  itemCount: number;
  totalCents: number;
  isLoading: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => Promise<void>;
  updateQuantity: (productId: string, size: string, finish: string, quantity: number) => Promise<void>;
  removeItem: (productId: string, size: string, finish: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string>("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize session ID
  useEffect(() => {
    let id = localStorage.getItem("cartSessionId");
    if (!id) {
      id = generateSessionId();
      localStorage.setItem("cartSessionId", id);
    }
    setSessionId(id);
  }, []);

  // Fetch cart when session ID is available
  useEffect(() => {
    if (sessionId) {
      refreshCart();
    }
  }, [sessionId]);

  const refreshCart = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const addItem = async (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productId: item.productId,
          size: item.size,
          finish: item.finish,
          quantity: item.quantity || 1,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add item");
      }

      const data = await response.json();
      setItems(data.items);
    } catch (error) {
      console.error("Add to cart error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, size: string, finish: string, quantity: number) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productId,
          size,
          finish,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const data = await response.json();
      setItems(data.items);
    } catch (error) {
      console.error("Update quantity error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: string, size: string, finish: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          productId,
          size,
          finish,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      const data = await response.json();
      setItems(data.items);
    } catch (error) {
      console.error("Remove item error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart/clear?sessionId=${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      setItems([]);
    } catch (error) {
      console.error("Clear cart error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalCents = items.reduce((total, item) => total + item.priceCents * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        sessionId,
        items,
        itemCount,
        totalCents,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

function generateSessionId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
