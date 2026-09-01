// Datos de roles SIN nada server-only (sin next/headers ni
// getCloudflareContext) — a propósito, para poder importarse desde
// componentes cliente como Sidebar.tsx sin arrastrar lib/panel-auth.ts
// (que si se importa desde un "use client" rompe el build).
export type Role = "admin" | "usuario";

// Rutas del panel que solo puede ver "admin" — exponen costos/márgenes o
// plata (Proveedores: precios mayoristas crudos de CDO/Maya; Finanzas y
// Movimientos: plata directamente; "/panel" el Resumen muestra cobros/pagos
// pendientes y ventas totales). Configuración ya no está en el Sidebar (se
// entra desde Finanzas), pero sigue siendo admin-only por si se linkea.
// "usuario" ve: Cotizador, Pedidos, Cuentas corrientes, Materiales, Presupuestos.
// Un solo lugar para ajustar esto después, sin tocar lógica.
export const ADMIN_ONLY_PATHS = [
  "/panel",
  "/panel/proveedores",
  "/panel/configuracion",
  "/panel/finanzas",
  "/panel/deudas",
  "/panel/sitio",
];

// A dónde va "usuario" al entrar al panel (no ve el Resumen). requireAdmin()
// también manda acá a cualquier no-admin que intente una ruta admin-only.
export const USER_HOME_PATH = "/panel/pedidos";
