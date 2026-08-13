import { supabase } from "./supabase";

export interface Debt {
  id: string;
  direction: "receivable" | "payable"; // receivable = te deben | payable = vos debés
  counterparty_name: string;
  amount: number;
  description: string | null;
  due_date: string | null;
  status: "pending" | "paid";
  created_at: string;
}

export interface Sale {
  id: string;
  description: string;
  amount: number;
  sale_date: string;
  created_at: string;
}

export async function getDebts(): Promise<Debt[]> {
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[business] Error trayendo deudas:", error);
    return [];
  }
  return data ?? [];
}

export async function getSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("sale_date", { ascending: false });

  if (error) {
    console.error("[business] Error trayendo ventas:", error);
    return [];
  }
  return data ?? [];
}
