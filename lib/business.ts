import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface Debt {
  id: number;
  direction: "receivable" | "payable"; // receivable = te deben | payable = vos debés
  counterparty_name: string;
  amount: number;
  paid_amount: number; // pago parcial — saldo = amount - paid_amount
  description: string | null;
  due_date: string | null;
  status: "pending" | "paid";
  created_at: string;
}

/** Saldo pendiente de una deuda — no se guarda, se deriva siempre del
 * monto y lo pagado actuales (mismo criterio que el saldo de Pedidos).
 * Si está marcada "Pagado" el saldo es $0 aunque `paid_amount` no se haya
 * cargado con precisión — el estado manual manda por sobre el parcial. */
export function getDebtBalance(debt: Debt): number {
  if (debt.status === "paid") return 0;
  return debt.amount - debt.paid_amount;
}

/** Sin `sinceDate`: trae todo. Con `sinceDate`, trae las recientes MÁS las
 * pendientes (sin importar la fecha) — solo deja afuera deudas viejas ya
 * pagadas. Mismo criterio que `getOrders`. */
export async function getDebts(sinceDate?: string): Promise<Debt[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (sinceDate) {
      const { results } = await env.DB.prepare(
        `SELECT * FROM debts
         WHERE created_at >= ? OR status != 'paid'
         ORDER BY due_date IS NULL, due_date ASC`
      )
        .bind(sinceDate)
        .all<Debt>();
      return results;
    }
    const { results } = await env.DB.prepare(
      "SELECT * FROM debts ORDER BY due_date IS NULL, due_date ASC"
    ).all<Debt>();
    return results;
  } catch (err) {
    console.error("[business] Error trayendo deudas:", err);
    return [];
  }
}

export type DebtInput = {
  direction: "receivable" | "payable";
  counterparty_name: string;
  amount: number;
  paid_amount: number;
  description: string | null;
  due_date: string | null;
  status: "pending" | "paid";
};

export async function createDebt(data: DebtInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    "INSERT INTO debts (direction, counterparty_name, amount, paid_amount, description, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(data.direction, data.counterparty_name, data.amount, data.paid_amount, data.description, data.due_date, data.status)
    .run();
}

export async function updateDebt(id: number, data: DebtInput): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare(
    "UPDATE debts SET direction = ?, counterparty_name = ?, amount = ?, paid_amount = ?, description = ?, due_date = ?, status = ? WHERE id = ?"
  )
    .bind(data.direction, data.counterparty_name, data.amount, data.paid_amount, data.description, data.due_date, data.status, id)
    .run();
}

export async function deleteDebt(id: number): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.DB.prepare("DELETE FROM debts WHERE id = ?").bind(id).run();
}
