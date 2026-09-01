"use client";

import { useState, type InputHTMLAttributes } from "react";

// Input numérico controlado que NO tiene el bug del "0 pegado": guarda el
// texto crudo en estado local (permite vacío, "-", "1.", etc.) y solo
// emite el número al padre. Sin esto, un `value={0}` + `Number(x) || 0`
// vuelve a poner el 0 apenas se borra y el cursor queda atrás del cero.

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number | null;
  onValueChange: (value: number | null) => void;
};

function toText(value: number | null): string {
  return value === null || Number.isNaN(value) ? "" : String(value);
}

export default function NumberInput({ value, onValueChange, ...rest }: Props) {
  const [text, setText] = useState<string>(toText(value));
  const [lastValue, setLastValue] = useState<number | null>(value);

  // Patrón "ajustar estado al cambiar una prop" (sin useEffect): si el padre
  // cambió `value` por fuera (ej. botón "usar mayorista"), re-sincroniza el
  // texto — pero NO cuando el nuevo valor es solo el "eco" de lo que ya
  // representa el texto actual (vacío ⇄ 0, o el mismo número), así borrar el
  // campo no lo hace saltar a "0".
  if (value !== lastValue) {
    setLastValue(value);
    const shown = text.trim() === "" ? 0 : Number(text);
    if (!Number.isNaN(shown) && (value ?? 0) !== shown) setText(toText(value));
  }

  return (
    <input
      {...rest}
      type="number"
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw.trim() === "") {
          onValueChange(null);
          return;
        }
        const n = Number(raw);
        if (Number.isFinite(n)) onValueChange(n);
      }}
    />
  );
}
