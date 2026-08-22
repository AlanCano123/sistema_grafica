-- D1 (SQLite) — deudas (ambas direcciones) + ventas simples.
-- Reemplaza lo que antes vivía en Supabase/Postgres. D1 no expone una API
-- pública tipo PostgREST (solo se accede vía binding desde el Worker), así
-- que no hace falta RLS acá.

CREATE TABLE IF NOT EXISTS debts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  direction TEXT NOT NULL CHECK (direction IN ('receivable', 'payable')),
  -- receivable = te deben a vos (cliente) | payable = vos debés (proveedor/tercero)
  counterparty_name TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  due_date TEXT, -- 'YYYY-MM-DD', o NULL
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  sale_date TEXT NOT NULL, -- 'YYYY-MM-DD'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Datos de ejemplo ficticios (prototipo, no son reales) — los mismos que
-- ya veníamos usando.
INSERT INTO debts (direction, counterparty_name, amount, description, due_date, status) VALUES
  ('receivable', 'Kiosco Don Mario', 45000, 'Impresión 500 volantes A5', '2026-08-20', 'pending'),
  ('receivable', 'Estudio Jurídico Pérez & Asoc.', 128000, 'Tarjetas personales x1000', '2026-08-15', 'pending'),
  ('receivable', 'Panadería La Espiga', 18500, 'Cartelería vidriera', '2026-07-30', 'pending'),
  ('receivable', 'Gimnasio Fuerza Total', 62000, 'Banners lona 2x1m', NULL, 'paid'),
  ('receivable', 'Farmacia Central', 9800, 'Etiquetas adhesivas', '2026-08-25', 'pending'),
  ('payable', 'Papelera San Martín', 210000, 'Resmas + insumos de impresión', '2026-08-18', 'pending'),
  ('payable', 'Tintas & Toners SRL', 87500, 'Cartuchos láser color', '2026-08-22', 'pending'),
  ('payable', 'Electricista Gómez', 15000, 'Arreglo tablero eléctrico', NULL, 'paid'),
  ('payable', 'Distribuidora Vinilos Norte', 54200, 'Rollos vinilo adhesivo', '2026-09-01', 'pending');

INSERT INTO sales (description, amount, sale_date) VALUES
  ('Impresión 500 volantes A5 - Kiosco Don Mario', 45000, '2026-08-10'),
  ('Tarjetas personales x1000 - Estudio Jurídico', 128000, '2026-08-09'),
  ('Banners lona 2x1m - Gimnasio Fuerza Total', 62000, '2026-08-05'),
  ('Cartelería vidriera - Panadería La Espiga', 18500, '2026-08-03'),
  ('Etiquetas adhesivas - Farmacia Central', 9800, '2026-08-01'),
  ('Folletería tríptico x200 - Cliente varios', 22000, '2026-07-28'),
  ('Stickers troquelados x300', 15400, '2026-07-25'),
  ('Impresión planos A1 x10', 31000, '2026-07-20');
