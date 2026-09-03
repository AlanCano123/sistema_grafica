"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

const MAX_SIDE = 1600;
const WEBP_QUALITY = 0.82;

// Redimensiona en el navegador (canvas -> webp) antes de subir, así el
// server no procesa imágenes y KV guarda archivos chicos (~200-400 KB).
async function toResizedWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("sin canvas 2d");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob falló"))), "image/webp", WEBP_QUALITY);
  });
}

// Subida de fotos genérica (servicios / productos propios). El campo que
// identifica el destino (`idField` = "slug" o "product_id") y su valor se
// mandan en el FormData junto con los archivos (`photos`).
export default function PhotoUploader({
  idField,
  idValue,
  currentCount,
  max,
  uploadAction,
}: {
  idField: string;
  idValue: string;
  currentCount: number;
  max: number;
  uploadAction: (formData: FormData) => Promise<{ ok: boolean; added: number; error?: string } | unknown>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = Math.max(0, max - currentCount);

  async function onFiles(files: FileList) {
    setError(null);
    if (remaining === 0) {
      setError(`Máximo ${max} fotos. Borrá alguna primero.`);
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set(idField, idValue);
      let added = 0;
      for (const file of Array.from(files)) {
        if (added >= remaining) break;
        if (!file.type.startsWith("image/")) continue;
        try {
          const blob = await toResizedWebp(file);
          fd.append("photos", blob, "foto.webp");
          added++;
        } catch {
          // archivo ilegible/corrupto — se saltea
        }
      }
      if (added === 0) {
        setError("No se pudo procesar ninguna imagen.");
        return;
      }
      const res = (await uploadAction(fd)) as { ok?: boolean; error?: string } | undefined;
      if (res && res.ok === false) {
        setError(res.error ?? "El servidor rechazó la subida.");
        return;
      }
      router.refresh();
    } catch (err) {
      console.error("[PhotoUploader] subida falló:", err);
      setError("Error al subir. Probá de nuevo o avisá si sigue fallando.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && e.target.files.length > 0 && onFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={busy || remaining === 0}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 rounded bg-[#4e73df] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3d5cc4] disabled:opacity-60"
      >
        <Upload size={14} />
        {busy ? "Subiendo…" : `Subir fotos (${remaining} libre${remaining === 1 ? "" : "s"})`}
      </button>
      {error && <p className="mt-1 text-xs font-semibold text-[#e74a3b]">{error}</p>}
    </div>
  );
}
