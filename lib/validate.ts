// Validación mínima de inputs de Server Actions — sin librería externa
// (mismo estilo hand-rolled que ya usaba el `num()` local de
// materiales/actions.ts, esto lo formaliza y le suma límites/errores
// claros). Tira Error con mensaje legible; las Server Actions no
// atajan el throw a propósito — Next no reenvía el mensaje real del
// error al cliente en producción (evita filtrar detalles internos),
// y en desarrollo sirve para debuggear.
export function requiredString(formData: FormData, key: string, opts: { max?: number } = {}): string {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) throw new Error(`"${key}" es obligatorio.`);
  if (opts.max && raw.length > opts.max) throw new Error(`"${key}" no puede tener más de ${opts.max} caracteres.`);
  return raw;
}

// Como requiredString pero permite vacío/ausente -> "" (campos opcionales de texto).
export function optionalString(formData: FormData, key: string, opts: { max?: number } = {}): string {
  const raw = String(formData.get(key) ?? "").trim();
  if (opts.max && raw.length > opts.max) throw new Error(`"${key}" no puede tener más de ${opts.max} caracteres.`);
  return raw;
}

export function requiredNumber(formData: FormData, key: string, opts: { min?: number; max?: number } = {}): number {
  const value = Number(formData.get(key));
  if (!Number.isFinite(value)) throw new Error(`"${key}" tiene que ser un número.`);
  if (opts.min !== undefined && value < opts.min) throw new Error(`"${key}" no puede ser menor a ${opts.min}.`);
  if (opts.max !== undefined && value > opts.max) throw new Error(`"${key}" no puede ser mayor a ${opts.max}.`);
  return value;
}
