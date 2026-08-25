-- Índices para las queries filtradas por fecha (getOrders/getSales/getDebts
-- con `sinceDate`) — sin esto, el filtro por fecha igual escanea la tabla
-- entera y no ahorra nada de lecturas contra D1 a medida que crecen.
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_debts_created_at ON debts(created_at);
