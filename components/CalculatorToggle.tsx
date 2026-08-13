"use client";

import { useState } from "react";
import { Calculator, ChevronDown } from "lucide-react";
import PriceCalculator from "./PriceCalculator";

// La calculadora vive en la misma página que el catálogo (no en una ruta
// aparte) — colapsada por default para no tapar el grid de productos.
export default function CalculatorToggle() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 rounded-[20px] border border-black/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span className="flex items-center gap-2 text-base font-bold text-black">
          <Calculator size={18} />
          Calculadora de precios
        </span>
        <ChevronDown size={18} className={`text-black/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-black/10 px-5 py-5">
          <PriceCalculator />
        </div>
      )}
    </div>
  );
}
