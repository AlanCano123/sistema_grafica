import { getAllProducts as getCdoProducts } from "./cdo-api";
import { getMayaProducts } from "./maya-api";
import { Product } from "./types";

/**
 * Catálogo combinado: CDO Promocionales + Maya Publicidad.
 * Se piden en paralelo. CDO es obligatorio (falla rápido si falta config,
 * ver cdo-api.ts); Maya es opcional y nunca tira, así que si Maya está
 * caído o mal configurado el catálogo sigue mostrando lo de CDO.
 */
export async function getCombinedProducts(): Promise<Product[]> {
  const [cdoProducts, mayaProducts] = await Promise.all([getCdoProducts(), getMayaProducts()]);
  return [...cdoProducts, ...mayaProducts];
}
