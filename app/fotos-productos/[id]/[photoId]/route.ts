import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ownPhotoKvKey } from "@/lib/own-products";

// Sirve las fotos de productos propios desde KV (misma-origen, CSP sin
// cambios). Clave: ownproduct:<productId>:<photoId>.
export const dynamic = "force-dynamic";

const IMAGE_TYPES = new Set(["image/webp", "image/jpeg", "image/png"]);

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  const { id, photoId } = await params;
  const numId = Number(id);
  const numPhoto = Number(photoId);
  if (!Number.isInteger(numId) || numId < 1 || !Number.isInteger(numPhoto) || numPhoto < 1) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const { env } = await getCloudflareContext({ async: true });
    const { value, metadata } = await env.KV.getWithMetadata<{ contentType?: string }>(
      ownPhotoKvKey(numId, numPhoto),
      "arrayBuffer"
    );
    if (!value) return new Response("Not found", { status: 404 });

    const contentType = metadata?.contentType && IMAGE_TYPES.has(metadata.contentType) ? metadata.contentType : "image/webp";
    return new Response(value, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[fotos-productos] Error sirviendo foto:", err);
    return new Response("Error", { status: 500 });
  }
}
