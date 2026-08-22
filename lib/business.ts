import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface Debt {
  id: number;
  direction: "receivable" | "payable"; // receivable = te deben | payable = vos debés
  counterparty_name: string;
  amount: number;
  description: string | null;
  due_date: string | null;
  status: "pending" | "paid";
  created_at: string;
}

export interface Sale {
  id: number;
  description: string;
  amount: number;
  sale_date: string;
  created_at: string;
}

export async function getDebts(): Promise<Debt[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    // "due_date IS NULL" da 0/1: los que tienen fecha (0) van primero,
    // ordenados ascendente; los NULL quedan al final.
    const { results } = await env.DB.prepare(
      "SELECT * FROM debts ORDER BY due_date IS NULL, due_date ASC"
    ).all<Debt>();
    return results;
  } catch (err) {
    console.error("[business] Error trayendo deudas:", err);
    return [];
  }
}

export async function getSales(): Promise<Sale[]> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const { results } = await env.DB.prepare("SELECT * FROM sales ORDER BY sale_date DESC").all<Sale>();
    return results;
  } catch (err) {
    console.error("[business] Error trayendo ventas:", err);
    return [];
  }
}
