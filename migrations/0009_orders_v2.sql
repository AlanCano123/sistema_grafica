-- Rehace `orders` para el flujo nuevo (cotizador -> pedido). Los datos
-- actuales son todos de prueba, así que se dropea y se recrea (no hay
-- rebuild de 12 pasos ni copia).
--
-- Cambios vs 0003_orders.sql:
--   * SACA: order_number (ya no se usa nº de orden a mano; el número
--     visible es "#{id}"), y material_id/width_mm/length_mm/mo_minutes
--     (esos datos ahora viven POR ITEM dentro de `items`).
--   * AGREGA: items (JSON [{ description, quantity, unitPrice, priceMode,
--     materialId, widthMm, lengthMm, moMinutes, serviceType }]) y
--     paid_at (cuándo pasó a "terminado_pagado").
--   * status: nuevo 4º estado 'terminado_pagado'.
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_number TEXT,                 -- nro de expediente, a mano, opcional
  client_name TEXT NOT NULL,
  job_name TEXT NOT NULL,           -- nombre del pedido / de la placa
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'produccion', 'terminado', 'terminado_pagado')),
  delivered_on_time INTEGER CHECK (delivered_on_time IN (0, 1)), -- NULL hasta terminado
  has_deposit INTEGER NOT NULL DEFAULT 0 CHECK (has_deposit IN (0, 1)),
  deposit_amount REAL NOT NULL DEFAULT 0,
  total_amount REAL NOT NULL DEFAULT 0,   -- = suma de unitPrice*quantity de los items
  form_paid INTEGER CHECK (form_paid IN (0, 1)), -- "¿se pagó el formulario?" — NULL = sin especificar
  due_date TEXT,                    -- fecha a entregar 'YYYY-MM-DD'
  items TEXT NOT NULL DEFAULT '[]', -- JSON, ver lib/job-items.ts
  paid_at TEXT,                     -- 'YYYY-MM-DD HH:MM:SS' cuando pasó a terminado_pagado
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Número de presupuesto / pedido NO es columna: se muestra "#{id}" / "PRES-{id}".
-- Saldo tampoco: total_amount - (has_deposit ? deposit_amount : 0).
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
