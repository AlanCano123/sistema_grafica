import { getAllProducts as getCdoProducts } from "./cdo-api";
import { getMayaProducts } from "./maya-api";
import { Product } from "./types";

/**
 * Catálogo combinado: CDO Promocionales + Maya Publicidad.
 * Se piden en paralelo. Ninguno de los dos puede tirar abajo la página
 * entera: si uno falla (red, credenciales, la API caída), se loguea el
 * error real y se muestra el catálogo con lo que sí funcionó, en vez de
 * un error genérico de Next sin poder ver la causa (ver lib/cdo-api.ts,
 * antes esto sí rompía todo si CDO fallaba).
 */
export async function getCombinedProducts(): Promise<Product[]> {
  const [cdoResult, mayaResult] = await Promise.allSettled([getCdoProducts(), getMayaProducts()]);

  if (cdoResult.status === "rejected") {
    console.error("[catalog] Error trayendo productos de CDO:", describeError(cdoResult.reason));
  }
  if (mayaResult.status === "rejected") {
    console.error("[catalog] Error trayendo productos de Maya:", describeError(mayaResult.reason));
  }

  const cdoProducts = cdoResult.status === "fulfilled" ? cdoResult.value : [];
  const mayaProducts = mayaResult.status === "fulfilled" ? mayaResult.value : [];
  return [...cdoProducts, ...mayaProducts];
}

function describeError(err: unknown): string {
  return err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
}
