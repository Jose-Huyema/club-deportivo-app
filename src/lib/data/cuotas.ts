import { createClient } from "@/lib/supabase/server";

export type PlanMembresia = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  billing_period: string;
  is_free: boolean;
  is_active: boolean;
};

export type EstadoFinanciero = {
  plan: PlanMembresia | null;
  membershipId: string | null;
  membershipStatus: string | null;
  balance: number;
  pendingCharges: number;
  recentCharges: Array<{
    id: string;
    period_month: string;
    due_date: string;
    description: string;
    amount: number;
    paid_amount: number;
    balance: number;
    status: string;
  }>;
};

function mapPlan(row: any): PlanMembresia {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description ?? null,
    amount: Number(row.amount ?? 0),
    currency: row.currency ?? "ARS",
    billing_period: row.billing_period ?? "monthly",
    is_free: Boolean(row.is_free),
    is_active: Boolean(row.is_active),
  };
}

export async function getPlanes(): Promise<PlanMembresia[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("membership_plans")
    .select("id, code, name, description, amount, currency, billing_period, is_free, is_active")
    .order("is_active", { ascending: false })
    .order("name");

  if (error || !data) return [];
  return data.map(mapPlan);
}

export async function getFinanzasResumen() {
  const supabase = createClient();
  const [{ count: planesActivos }, { count: sociosConPlan }, { count: cuotasPendientes }, { data: vencidas }] = await Promise.all([
    supabase.from("membership_plans").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("student_memberships").select("student_id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("charges").select("id", { count: "exact", head: true }).in("status", ["pending", "overdue"]),
    supabase.from("charges").select("amount, paid_amount").in("status", ["pending", "overdue"]),
  ]);

  const deuda = (vencidas ?? []).reduce((acc: number, item: any) => acc + Math.max(0, Number(item.amount ?? 0) - Number(item.paid_amount ?? 0)), 0);

  return {
    planesActivos: planesActivos ?? 0,
    sociosConPlan: sociosConPlan ?? 0,
    cuotasPendientes: cuotasPendientes ?? 0,
    deudaPendiente: deuda,
  };
}

export async function buscarAlumnosFinanzas(query: string) {
  const q = query.trim();
  if (q.length < 2) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, dni, is_active")
    .or(`full_name.ilike.%${q}%,dni.ilike.%${q.replace(/[^0-9]/g, "").slice(0, 20)}%`)
    .order("full_name")
    .limit(12);

  if (error || !data) return [];
  return data;
}

export async function getEstadoFinancieroAlumno(studentId: string): Promise<EstadoFinanciero | null> {
  const supabase = createClient();
  const { data: student } = await supabase.from("students").select("id").eq("id", studentId).maybeSingle();
  if (!student) return null;

  const [{ data: membership }, { data: charges }] = await Promise.all([
    supabase
      .from("student_memberships")
      .select("id, status, membership_plans(id, code, name, description, amount, currency, billing_period, is_free, is_active)")
      .eq("student_id", studentId)
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("charges")
      .select("id, period_month, due_date, description, amount, paid_amount, status")
      .eq("student_id", studentId)
      .not("status", "eq", "cancelled")
      .order("due_date", { ascending: false })
      .limit(12),
  ]);

  const plan = membership?.membership_plans ? mapPlan(membership.membership_plans) : null;
  const recentCharges = (charges ?? []).map((charge: any) => ({
    id: charge.id,
    period_month: charge.period_month,
    due_date: charge.due_date,
    description: charge.description,
    amount: Number(charge.amount ?? 0),
    paid_amount: Number(charge.paid_amount ?? 0),
    balance: Math.max(0, Number(charge.amount ?? 0) - Number(charge.paid_amount ?? 0)),
    status: charge.status,
  }));

  return {
    plan,
    membershipId: membership?.id ?? null,
    membershipStatus: membership?.status ?? null,
    balance: recentCharges.reduce((acc, charge) => acc + charge.balance, 0),
    pendingCharges: recentCharges.filter((charge) => ["pending", "overdue"].includes(charge.status) && charge.balance > 0).length,
    recentCharges,
  };
}
