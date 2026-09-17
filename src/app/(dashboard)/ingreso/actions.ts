"use server";

import { createClient } from "@/lib/supabase/server";
import { assertRoleAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";
import { registrarIngreso, type IngresoConfirmacion } from "../asistencia/scanner/actions";

export type IngresoAlumno = {
  id: string;
  full_name: string;
  dni: string | null;
  is_active: boolean;
};

export async function buscarAlumnosIngreso(term: string): Promise<{
  data: IngresoAlumno[];
  error: string | null;
}> {
  const check = await assertRoleAction(["admin", "operador", "portero"]);
  if ("error" in check) return { data: [], error: check.error };

  const q = term.trim();
  if (q.length < 2) return { data: [], error: null };

  const supabase = createClient();
  const normalizedDni = q.replace(/\D/g, "");
  const numeric = normalizedDni.length >= 3;
  const query = supabase
    .from("students")
    .select("id, full_name, dni, is_active")
    .eq("is_active", true)
    .order("full_name")
    .limit(8);

  const { data, error } = numeric
    ? await query.ilike("dni", `${normalizedDni}%`)
    : await query.ilike("full_name", `%${q}%`);

  if (error) return { data: [], error: "No se pudo realizar la búsqueda." };
  return { data: (data ?? []) as IngresoAlumno[], error: null };
}

export async function registrarIngresoRapido(studentId: string): Promise<{
  error: string | null;
  student: IngresoConfirmacion | null;
}> {
  const result = await registrarIngreso(`STUDENT:${studentId}`, "manual");
  revalidatePath("/ingreso");
  return result;
}

export async function registrarIngresoPorCodigo(codigo: string): Promise<{
  error: string | null;
  student: IngresoConfirmacion | null;
}> {
  const trimmed = codigo.trim();
  const method = trimmed.startsWith("STUDENT:") ? "qr" : "dni";
  const result = await registrarIngreso(trimmed, method);
  revalidatePath("/ingreso");
  return result;
}
