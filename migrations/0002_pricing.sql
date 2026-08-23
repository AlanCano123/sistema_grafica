-- D1 (SQLite) — materiales de calculadora, gastos/sueldos y configuración
-- de precios. Reemplaza los valores hardcodeados de lib/materials.ts por
-- datos reales sacados de "Planilla de Costos de Produccion 2026.xlsx".

CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  thickness_mm REAL NOT NULL,
  sheet_width_mm REAL NOT NULL,
  sheet_length_mm REAL NOT NULL,
  sheet_cost REAL NOT NULL, -- costo $ de la placa completa
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- costo por mm² NO se guarda acá: se calcula en runtime
-- (sheet_cost / (sheet_width_mm * sheet_length_mm)), así nunca queda
-- desactualizado si se edita el costo de la placa.

-- Gastos Operativos + Recursos Humanos: misma forma (nombre+monto), CRUD.
-- Ninguno de los dos alimenta un cálculo propio — son carga directa, la
-- suma de cada categoría sí entra en Valor MO x Hora (ver computeMoRates
-- en lib/materials.ts).
CREATE TABLE IF NOT EXISTS operating_costs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK (category IN ('operativo', 'rrhh')),
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Configuración global de precios, fila única (id fijo en 1).
CREATE TABLE IF NOT EXISTS pricing_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  working_days INTEGER NOT NULL,
  non_working_days INTEGER NOT NULL, -- informativo, no afecta el cálculo (igual que el Excel)
  daily_hours REAL NOT NULL,
  wholesale_margin_pct REAL NOT NULL,
  retail_margin_pct REAL NOT NULL,
  avg_mo_minutes_web REAL NOT NULL -- minutos de MO promedio usados en la calculadora pública
);

INSERT INTO pricing_settings (id, working_days, non_working_days, daily_hours, wholesale_margin_pct, retail_margin_pct, avg_mo_minutes_web)
VALUES (1, 26, 4, 8, 50, 100, 2.5);

-- Seed real, sacado de la hoja "Materia Prima". Quedan afuera "MDF COLOR 5"
-- y "GOMA": en el Excel están incompletos (sin ancho/largo de placa
-- cargado) — se pueden agregar después desde el panel.
INSERT INTO materials (name, thickness_mm, sheet_width_mm, sheet_length_mm, sheet_cost) VALUES
  ('MDF 3mm', 3, 1830, 2600, 42000),
  ('MDF 5.5mm', 5.5, 1830, 2600, 52000),
  ('MDF COLOR', 3, 1830, 2600, 54000),
  ('ACRILICO 2mm', 2, 1220, 2440, 109000),
  ('ACRILICO 3mm', 3, 1800, 800, 164000),
  ('ACRILICO 4mm', 4, 1220, 2440, 459000),
  ('ACRILICO 10mm', 10, 1220, 2440, 519000),
  ('ACRI COLOR', 3, 1220, 2440, 199000),
  ('ACRI ESPEJADO', 3, 1220, 2440, 209000),
  ('BICAPA', 1.34, 1200, 600, 44000),
  ('POLIFAN', 20, 1200, 600, 38000),
  ('VINILO', 1, 600, 50000, 109000),
  ('MILAR', 1, 600, 20000, 700000),
  ('IMPRESIÓN', 1, 600, 420, 15000),
  ('DTF', 1, 600, 50000, 350000),
  ('ALTO IMPACTO', 3, 1000, 2000, 100000);

-- Seed real, sacado de la hoja "Gastos Operativos - Sueldos".
INSERT INTO operating_costs (category, name, amount) VALUES
  ('operativo', 'TUBO', 125000),
  ('operativo', 'LUZ', 200000),
  ('operativo', 'ALQUILER', 1300000),
  ('operativo', 'TELEFONO', 30000),
  ('operativo', 'INSUMOS', 500000),
  ('operativo', 'COSTO MAQUINA', 800000),
  ('operativo', 'FLETES', 300000),
  ('operativo', 'INTERNET', 70000),
  ('operativo', 'COMBUSTIBLE', 500000),
  ('operativo', 'ALARMA', 45000),
  ('rrhh', 'Empleado 1', 1000000),
  ('rrhh', 'Empleado 2', 1000000),
  ('rrhh', 'Empleado 3', 1000000);
