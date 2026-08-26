// Login básico del panel — estamos en fase de prueba, usuario/contraseña
// hardcodeados a propósito. ANTES de manejar datos reales de clientes en
// serio hay que reemplazar esto por usuarios de verdad (tabla en D1,
// contraseñas hasheadas) — esto es una traba de acceso simple, no
// seguridad real.
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

export const SESSION_COOKIE = "panel_session";
// Valor fijo (no el usuario/contraseña) — así la cookie en sí no revela
// la credencial si alguien la mira.
export const SESSION_VALUE = "laserkind-panel-ok";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8hs (una jornada)

export function checkCredentials(user: string, pass: string): boolean {
  return user === ADMIN_USER && pass === ADMIN_PASS;
}
