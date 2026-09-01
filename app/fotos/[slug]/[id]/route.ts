import { getCloudflareContext } from "@opennextjs/cloudflare";
import { photoKvKey } from "@/lib/service-photos";

// Sirve las fotos del carrusel de servicios desde KV (misma-origen, así la
// CSP no necesita `img-src` extra). Clave: sitephoto:<slug>:<id>.
export const dynamic = "force-dynamic";

const IMAGE_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const numId = Number(id);
  if (!/^[a-z0-9-]+$/.test(slug) || !Number.isInteger(numId) || numId < 1) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const { value, metadata } = await env.KV.getWithMetadata<{ contentType?: string }>(
      photoKvKey(slug, numId),
      "arrayBuffer"
    );
    if (!value) return new Response("Not found", { status: 404 });

    const contentType = metadata?.contentType && IMAGE_TYPES.has(metadata.contentType) ? metadata.contentType : "image/webp";
    return new Response(value, {
      headers: {
        "Content-Type": contentType,
        // La clave incluye el id (correlativo, único): el contenido nunca
        // cambia para una URL dada -> cache agresivo.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[fotos] Error sirviendo foto:", err);
    return new Response("Error", { status: 500 });
  }
}
