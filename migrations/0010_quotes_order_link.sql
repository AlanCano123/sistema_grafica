-- Link presupuesto -> pedido: cuando un presupuesto "aceptado" se convierte
-- en pedido (ver convertQuoteToOrder en lib/quotes.ts), se guarda acá el id
-- del pedido creado, así en Presupuestos se muestra "Pedido #N" y no se
-- puede convertir dos veces.
--
-- Los items del presupuesto siguen siendo JSON en `quotes.items`; el shape
-- se extiende en código a JobItem (campos extra opcionales, retrocompat con
-- los presupuestos viejos de shape { description, quantity, unitPrice }).
ALTER TABLE quotes ADD COLUMN order_id INTEGER;
