-- Ventas: tipo de servicio
ALTER TABLE sales ADD COLUMN service_type TEXT;
-- 'corte_laser' | 'grabado_laser' | 'impresion_uv' | 'impresion_dtf' |
-- 'impresion_textil' | 'corte_polifan' | 'carteleria_corporea' | 'diseno_personalizado'
-- Sin CHECK (mismo criterio que payment_method) — NULL en ventas viejas o
-- en las que se auto-crean desde un pedido (los pedidos no tienen este
-- concepto), se puede completar editando la venta.

-- Pedidos: datos de costo, opcionales — mismos que usa el Cotizador
ALTER TABLE orders ADD COLUMN material_id INTEGER REFERENCES materials(id);
ALTER TABLE orders ADD COLUMN width_mm REAL;
ALTER TABLE orders ADD COLUMN length_mm REAL;
ALTER TABLE orders ADD COLUMN mo_minutes REAL;
