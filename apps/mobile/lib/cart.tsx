import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { CoffeeRead } from "@/lib/cafeatlas-api";

const STORAGE_KEY = "cafeatlas-cart";

export type CartItem = {
  coffeeId: number;
  slug: string;
  name: string;
  originState: string;
  imageUrl?: string | null;
  priceCents: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  hydrated: boolean;
  addItem: (coffee: CoffeeRead) => void;
  updateQuantity: (coffeeId: number, quantity: number) => void;
  removeItem: (coffeeId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function parseItems(value: string | null): CartItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<CartItem>;
      return (
        typeof candidate.coffeeId === "number" &&
        typeof candidate.slug === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.priceCents === "number" &&
        typeof candidate.quantity === "number" &&
        candidate.quantity > 0
      );
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void SecureStore.getItemAsync(STORAGE_KEY).then((stored) => {
      setItems(parseItems(stored));
      setHydrated(true);
    });
  }, []);

  function persist(nextItems: CartItem[]) {
    setItems(nextItems);
    void SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(nextItems));
  }

  function addItem(coffee: CoffeeRead) {
    const existing = items.find((item) => item.coffeeId === coffee.id);
    const nextItems = existing
      ? items.map((item) => item.coffeeId === coffee.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [
          ...items,
          {
            coffeeId: coffee.id,
            slug: coffee.slug,
            name: coffee.name,
            originState: coffee.origin_state,
            imageUrl: coffee.image_url,
            priceCents: coffee.price_cents,
            quantity: 1,
          },
        ];
    persist(nextItems);
  }

  function updateQuantity(coffeeId: number, quantity: number) {
    if (quantity < 1) {
      removeItem(coffeeId);
      return;
    }
    persist(items.map((item) => item.coffeeId === coffeeId ? { ...item, quantity } : item));
  }

  function removeItem(coffeeId: number) {
    persist(items.filter((item) => item.coffeeId !== coffeeId));
  }

  function clear() {
    persist([]);
  }

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotalCents: items.reduce((total, item) => total + item.priceCents * item.quantity, 0),
    hydrated,
    addItem,
    updateQuantity,
    removeItem,
    clear,
  }), [items, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
