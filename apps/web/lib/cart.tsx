"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "cafeatlas-web-cart";

export type WebCartItem = {
  coffeeId: number;
  slug: string;
  name: string;
  priceCents: number;
  currencyCode: string;
  inventoryUnits: number;
  imageUrl?: string | null;
  quantity: number;
};

type CartContextValue = {
  items: WebCartItem[];
  hydrated: boolean;
  itemCount: number;
  addItem: (item: Omit<WebCartItem, "quantity">) => void;
  updateQuantity: (coffeeId: number, quantity: number) => void;
  removeItem: (coffeeId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function WebCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WebCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? (JSON.parse(stored) as WebCartItem[]) : [];
      setItems(Array.isArray(parsed) ? parsed.filter((item) => item && item.coffeeId && item.quantity > 0) : []);
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  function addItem(item: Omit<WebCartItem, "quantity">) {
    setItems((current) => {
      const existing = current.find((candidate) => candidate.coffeeId === item.coffeeId);
      if (existing) {
        return current.map((candidate) => candidate.coffeeId === item.coffeeId ? { ...candidate, quantity: Math.min(candidate.quantity + 1, 99) } : candidate);
      }
      return [...current, { ...item, quantity: 1 }];
    });
  }

  function updateQuantity(coffeeId: number, quantity: number) {
    if (quantity <= 0) {
      removeItem(coffeeId);
      return;
    }
    setItems((current) => current.map((item) => item.coffeeId === coffeeId ? { ...item, quantity: Math.min(quantity, 99) } : item));
  }

  function removeItem(coffeeId: number) {
    setItems((current) => current.filter((item) => item.coffeeId !== coffeeId));
  }

  const value = {
    items,
    hydrated,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    addItem,
    updateQuantity,
    removeItem,
    clear: () => setItems([]),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useWebCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useWebCart must be used within WebCartProvider");
  return context;
}
