"use client";

import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { buildCartMessage } from "@/lib/cart-message";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/product-helpers";

export default function CartDrawer({ onClose }: { onClose: () => void }) {
  const { items, remove, setQty, clear } = useCart();

  function handleSend() {
    const url = buildWhatsAppUrl(buildCartMessage(items));
    window.open(url, "_blank", "noopener,noreferrer");
    clear();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col border-l border-white/10 bg-neutral-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-bold text-white">Tu carrito</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-neutral-500">Todavía no agregaste productos.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-1" unoptimized />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="line-clamp-2 text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-neutral-500">
                      {item.priceMin == null
                        ? "Precio a consultar"
                        : item.priceMin === item.priceMax
                          ? formatPrice(item.priceMin)
                          : `${formatPrice(item.priceMin)} – ${formatPrice(item.priceMax!)}`}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(item.key, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-white/15 text-neutral-300 hover:text-white"
                        aria-label="Restar"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-sm text-white">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQty(item.key, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-white/15 text-neutral-300 hover:text-white"
                        aria-label="Sumar"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.key)}
                        className="ml-auto text-neutral-500 hover:text-brand-red"
                        aria-label="Sacar del carrito"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/10 px-5 py-4">
            <p className="mb-3 text-xs text-neutral-500">
              Los precios son estimados y están sujetos a modificación — no son precios finales. Te confirmamos el
              presupuesto por WhatsApp.
            </p>
            <button
              type="button"
              onClick={handleSend}
              className="w-full rounded-lg bg-brand-red px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
            >
              Enviar por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
