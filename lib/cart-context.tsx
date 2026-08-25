"use client";

// Carrito del catálogo público — a nivel producto (no por variante/color,
// alcanza para "un listado de productos" que pidió Fernando). Vive en
// localStorage, no en el servidor: es solo para armar el mensaje de
// WhatsApp, no hay stock/checkout real detrás.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "lk-cart";

export interface CartItem {
  key: string; // `${provider}:${code}`
  name: string;
  code: string;
  image: string;
  priceMin: number | null; // estimado en pesos, ya calculado al agregar — null si "Precio a consultar"
  priceMax: number | null;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Se hidrata DESPUÉS del mount a propósito — leer localStorage durante
  // el render de SSR no es posible (no existe en el server) y daría un
  // mismatch entre el HTML del servidor y el del cliente.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (err) {
      console.error("[cart] Error leyendo carrito de localStorage:", err);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // no pisar lo guardado con el [] inicial antes de leerlo
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("[cart] Error guardando carrito en localStorage:", err);
    }
  }, [items, hydrated]);

  function add(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.key === item.key);
      if (existing) {
        return prev.map((i) => (i.key === item.key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function setQty(key: string, quantity: number) {
    if (quantity < 1) return remove(key);
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  }

  function clear() {
    setItems([]);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return <CartContext.Provider value={{ items, count, add, remove, setQty, clear }}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart() tiene que usarse dentro de <CartProvider>");
  return ctx;
}
