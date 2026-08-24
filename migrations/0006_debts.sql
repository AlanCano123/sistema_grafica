-- Deudas: pago parcial. El resto de la tabla ya cubre lo necesario
-- (direccion, contraparte, monto, descripcion, vencimiento, estado).
ALTER TABLE debts ADD COLUMN paid_amount REAL NOT NULL DEFAULT 0;
-- Saldo pendiente = amount - paid_amount, no se guarda (se calcula), mismo
-- criterio que el saldo de Pedidos.
