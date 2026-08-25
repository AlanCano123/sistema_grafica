"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import CartDrawer from "./CartDrawer";

export default function CartButton() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ver carrito"
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        <ShoppingCart size={20} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      {open && <CartDrawer onClose={() => setOpen(false)} />}
    </>
  );
}
