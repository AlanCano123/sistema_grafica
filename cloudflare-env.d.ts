// `CloudflareEnv` es la interfaz ambient que usa getCloudflareContext() de
// @opennextjs/cloudflare (declare global, pensada para extenderse acá).
// `Env` es la que genera `npx wrangler types` a partir de wrangler.jsonc
// (worker-configuration.d.ts, se regenera solo — por eso este merge vive
// en un archivo aparte y no ahí adentro).
declare global {
  interface CloudflareEnv extends Env {}
}

export {};
