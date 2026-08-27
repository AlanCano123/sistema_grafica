import Script from "next/script";
import { loginAction } from "./actions";

const TURNSTILE_SITE_KEY = "0x4AAAAAAEdzvzkCmglDmlrB";

const ERROR_MESSAGES: Record<string, string> = {
  "1": "Usuario o contraseña incorrectos.",
  rate_limit: "Demasiados intentos fallidos. Esperá unos minutos y probá de nuevo.",
  bot: "No se pudo verificar que sos una persona. Volvé a intentar.",
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function PanelLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES["1"]) : null;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "linear-gradient(180deg, #4e73df 10%, #224abe 100%)" }}
    >
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" async defer />

      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-1 text-center text-lg font-bold text-gray-800">Sistema Gráfica</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Ingresá para entrar al panel</p>

        {errorMessage && (
          <p className="mb-4 rounded border border-[#e74a3b]/20 bg-[#e74a3b]/10 px-3 py-2 text-center text-sm text-[#e74a3b]">
            {errorMessage}
          </p>
        )}

        <form action={loginAction} className="flex flex-col gap-4">
          {/* Honeypot: invisible para una persona, un bot que completa
              todos los inputs sí lo llena. Fuera de la vista sin
              display:none (algunos bots lo detectan e ignoran el campo). */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label>
              No completar este campo
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <label className="text-xs text-gray-500">
            Usuario
            <input
              name="user"
              autoComplete="username"
              required
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none"
            />
          </label>
          <label className="text-xs text-gray-500">
            Contraseña
            <input
              name="pass"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-[#4e73df] focus:outline-none"
            />
          </label>

          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-action="login" />

          <button
            type="submit"
            className="mt-2 rounded bg-[#4e73df] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d5cc4]"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}
