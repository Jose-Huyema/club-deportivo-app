"use server";

import { createClient } from "@/lib/supabase/server";
import { assertRoleAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

async function assertCuotasAction() {
  const check = await assertRoleAction(["admin", "operador"]);
  if ("error" in check) return check;
  const supabase = createClient();
  if (check.role !== "admin") {
    const { data: profile } = await supabase.from("profiles").select("allowed_views").eq("id", check.userId).single();
    if (!profile?.allowed_views?.includes("cuotas")) return { error: "No tenés permiso para gestionar cuotas." };
  }
  return check;
}

export async function crearPlan(input: {
  name: string;
  code: string;
  description: string;
  amount: number;
  billingPeriod: "monthly" | "one_time" | "other";
  isFree: boolean;
}) {
  const check = await assertRoleAction(["admin"]);
  if ("error" in check) return check;

  const name = input.name.trim();
  const code = input.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const amount = Number(input.amount);
  const finalAmount = input.isFree ? 0 : amount;

  if (!name) return { error: "El nombre del plan es obligatorio." };
  if (!code) return { error: "El código del plan es obligatorio." };
  if (!Number.isFinite(finalAmount) || finalAmount < 0) return { error: "El monto no es válido." };

  const supabase = createClient();
  const { error } = await supabase.from("membership_plans").insert({
    name,
    code,
    description: input.description.trim() || null,
    amount: finalAmount,
    currency: "ARS",
    billing_period: input.billingPeriod,
    is_free: input.isFree || finalAmount === 0,
    is_active: true,
  });

  if (error) return { error: error.code === "23505" ? "Ya existe un plan con ese código." : "No se pudo crear el plan." };
  revalidatePath("/cuotas");
  return { error: null };
}

export async function cambiarEstadoPlan(planId: string, active: boolean) {
  const check = await assertRoleAction(["admin"]);
  if ("error" in check) return check;
  const supabase = createClient();
  const { error } = await supabase.from("membership_plans").update({ is_active: active }).eq("id", planId);
  if (error) return { error: "No se pudo actualizar el plan." };
  revalidatePath("/cuotas");
  return { error: null };
}

export async function buscarAlumnos(query: string) {
  const check = await assertCuotasAction();
  if ("error" in check) return { error: check.error, data: [] };

  const q = query.trim();
  if (q.length < 2) return { error: null, data: [] };
  const supabase = createClient();
  const digits = q.replace(/[^0-9]/g, "");
  const filters = digits ? `full_name.ilike.%${q}%,dni.ilike.%${digits}%` : `full_name.ilike.%${q}%`;
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, dni, is_active")
    .or(filters)
    .order("full_name")
    .limit(10);
  if (error) return { error: "No se pudo buscar alumnos.", data: [] };
  return { error: null, data: data ?? [] };
}

export async function getEstadoAlumno(studentId: string) {
  const check = await assertCuotasAction();
  if ("error" in check) return check;

  const supabase = createClient();
  const [{ data: membership }, { data: charges }] = await Promise.all([
    supabase
      .from("student_memberships")
      .select("id, plan_id, status, started_at, notes, membership_plans(id, code, name, description, amount, currency, billing_period, is_free, is_active)")
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

  return {
    error: null,
    membership: membership ?? null,
    charges: (charges ?? []).map((c: any) => ({
      ...c,
      balance: Math.max(0, Number(c.amount ?? 0) - Number(c.paid_amount ?? 0)),
    })),
  };
}

export async function asignarPlan(studentId: string, planId: string, notes: string) {
  const check = await assertCuotasAction();
  if ("error" in check) return check;
  const supabase = createClient();
  const { data, error } = await supabase.rpc("asignar_plan_alumno", {
    p_student_id: studentId,
    p_plan_id: planId,
    p_notes: notes.trim() || null,
  });
  if (error) return { error: error.message?.includes("PLAN_NO_DISPONIBLE") ? "El plan ya no está disponible." : "No se pudo asignar el plan." };
  revalidatePath("/cuotas");
  revalidatePath(`/alumnos/${studentId}`);
  return { error: null, membershipId: data };
}

export async function generarCuota(input: { studentId: string; membershipId: string; periodMonth: string; dueDate: string }) {
  const check = await assertCuotasAction();
  if ("error" in check) return check;
  const supabase = createClient();

  const { data: membership, error: membershipError } = await supabase
    .from("student_memberships")
    .select("id, student_id, plan_id, membership_plans(name, amount, is_free)")
    .eq("id", input.membershipId)
    .eq("student_id", input.studentId)
    .maybeSingle();

  if (membershipError || !membership) return { error: "No se encontró la asignación de plan." };

  const plan: any = membership.membership_plans;
  const amount = Number(plan?.amount ?? 0);
  const isFree = Boolean(plan?.is_free) || amount === 0;
  const period = `${input.periodMonth.slice(0, 7)}-01`;
  const description = `Cuota ${input.periodMonth.slice(0, 7)}`;

  const { error } = await supabase.from("charges").insert({
    student_id: input.studentId,
    membership_id: input.membershipId,
    period_month: period,
    due_date: input.dueDate,
    description: isFree ? `${description} · Plan sin costo` : description,
    amount,
    paid_amount: 0,
    status: isFree ? "waived" : "pending",
  });

  if (error) return { error: error.code === "23505" ? "Ya existe una cuota para ese período." : "No se pudo generar la cuota." };
  revalidatePath("/cuotas");
  revalidatePath(`/alumnos/${input.studentId}`);
  return { error: null };
}

export async function registrarPago(input: {
  chargeId: string;
  amount: number;
  method: "cash" | "transfer" | "card" | "mercadopago" | "other";
  reference: string;
  notes: string;
}) {
  const check = await assertCuotasAction();
  if ("error" in check) return check;
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "El monto debe ser mayor a cero." };

  const supabase = createClient();
  const { data, error } = await supabase.rpc("registrar_pago_cuota", {
    p_charge_id: input.chargeId,
    p_amount: amount,
    p_method: input.method,
    p_reference: input.reference.trim() || null,
    p_notes: input.notes.trim() || null,
  });

  if (error) {
    if (error.message?.includes("MONTO_SUPERA_SALDO")) return { error: "El pago supera el saldo pendiente." };
    return { error: "No se pudo registrar el pago." };
  }

  revalidatePath("/cuotas");
  revalidatePath("/alumnos", "layout");
  return { error: null, paymentId: data };
}
