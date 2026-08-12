import { createClient } from "@supabase/supabase-js";

// Server-only: SUPABASE_SECRET_KEY nunca lleva prefijo NEXT_PUBLIC_, así que
// este cliente no puede importarse desde Client Components ni llegar al
// navegador. Mismo criterio que CDO_API_TOKEN / MAYA_API_PASSWORD.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error(
    "Faltan las variables de entorno SUPABASE_URL / SUPABASE_SECRET_KEY. Revisá tu archivo .env.local"
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    // Esto es un cliente server-to-server con la secret key: no necesita
    // manejar sesiones de usuario ni persistir tokens de auth.
    persistSession: false,
    autoRefreshToken: false,
  },
});
