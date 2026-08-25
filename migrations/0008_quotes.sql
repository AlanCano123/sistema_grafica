-- Presupuestos guardados: se guarda cliente + items cuando se descarga un
-- Presupuesto (no cuando se descarga un Remito suelto, ese sigue efímero).
-- Con esto, cuando el cliente acepta, se puede convertir a remito sin
-- volver a cargar todo — misma data, un click.
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_nombre TEXT NOT NULL,
  client_domicilio TEXT,
  client_localidad TEXT,
  client_cuit TEXT,
  client_telefono TEXT,
  client_cp TEXT,
  client_provincia TEXT,
  client_otros_datos TEXT,
  items TEXT NOT NULL, -- JSON: [{ description, quantity, unitPrice }]
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aceptado', 'rechazado')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Número mostrado: "PRES-{id}" derivado del id, igual criterio que
-- budgetNumber() en Pedidos — no hace falta un contador aparte.
