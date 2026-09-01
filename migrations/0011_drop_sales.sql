-- Se elimina la pestaña Ventas. Finanzas y el Resumen ahora miden sobre
-- pedidos en estado 'terminado_pagado' (ver lib/orders.ts). La tabla
-- `sales` y su índice ya no se usan.
DROP INDEX IF EXISTS idx_sales_sale_date;
DROP TABLE IF EXISTS sales;
