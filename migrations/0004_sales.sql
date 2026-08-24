-- Ventas: suma cliente, medio de pago y pedido vinculado. sales ya existe
-- (migración 0001) con description/amount/sale_date/created_at.
ALTER TABLE sales ADD COLUMN client_name TEXT;
ALTER TABLE sales ADD COLUMN payment_method TEXT; -- 'efectivo' | 'transferencia' | 'tarjeta' | 'otro' (sin CHECK, por si se carga algo distinto a mano)
ALTER TABLE sales ADD COLUMN order_id INTEGER REFERENCES orders(id); -- pedido vinculado, NULL si la venta no viene de un pedido (D1 no fuerza la FK, es informativo)
