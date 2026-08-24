-- Pedidos reales. Reemplaza el array hardcodeado de lib/orders.ts.
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL,       -- nro de orden, lo carga Fernando a mano
  file_number TEXT,                 -- nro de expediente, a mano, opcional
  client_name TEXT NOT NULL,
  job_name TEXT NOT NULL,           -- nombre del pedido / de la placa
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'produccion', 'terminado')),
  delivered_on_time INTEGER CHECK (delivered_on_time IN (0, 1)), -- NULL hasta que se marca terminado
  has_deposit INTEGER NOT NULL DEFAULT 0 CHECK (has_deposit IN (0, 1)), -- si deja seña
  deposit_amount REAL NOT NULL DEFAULT 0, -- de cuánto es la seña
  total_amount REAL NOT NULL DEFAULT 0,   -- total del pedido
  form_paid INTEGER CHECK (form_paid IN (0, 1)), -- "¿se pagó el formulario?" — opcional, NULL = sin especificar
  due_date TEXT,                    -- fecha a entregar 'YYYY-MM-DD'
  created_at TEXT NOT NULL DEFAULT (datetime('now')) -- fecha de creación del pedido
);

-- Número de presupuesto NO es columna: se muestra como "PRES-{id}" (el id
-- autoincremental de D1 ya es correlativo único). Saldo pendiente tampoco
-- es columna: se calcula siempre total_amount - (has_deposit ? deposit_amount : 0).
