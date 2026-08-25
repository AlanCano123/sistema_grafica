// Envuelve el fetch handler que genera OpenNext para agregarle un
// scheduled() (Cloudflare Cron Trigger) — @opennextjs/cloudflare no trae
// esto de fábrica. Patrón oficial:
// https://opennext.js.org/cloudflare/howtos/custom-worker
//
// wrangler.jsonc apunta "main" acá en vez de directo a
// ".open-next/worker.js" (que se regenera solo en cada build, por eso no
// se edita a mano).
// @ts-expect-error ".open-next/worker.js" se genera recién en el build
import { default as handler } from "./.open-next/worker.js";
import { refreshDolarOficialCache } from "./lib/dolar";

export default {
  fetch: handler.fetch,
  async scheduled() {
    await refreshDolarOficialCache();
  },
} satisfies ExportedHandler<CloudflareEnv>;
