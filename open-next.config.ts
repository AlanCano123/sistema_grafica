import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Config mínima — sin override de incremental cache (R2) todavía. Si más
// adelante el ISR/revalidate necesita persistir entre despliegues, acá
// se agrega un bucket R2 (ver https://opennext.js.org/cloudflare/caching).
export default defineCloudflareConfig();
