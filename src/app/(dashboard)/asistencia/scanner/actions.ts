"use server";

import { createClient } from "@/lib/supabase/server";
import { assertRoleAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

type IngresoMethod = "qr" | "dni" | "manual";

export type IngresoConfirmacion = {
  id: string;
  full_name: string;
  dni: string | null;
  categorias: string[];
  checked_in_at: string;
  method: IngresoMethod;
};

async function buscarAlumnoPorCodigo(codigo: string) {
  const supabase = createClient();

  const matchQr = codigo.match(/^STUDENT:(.+)$/);
  if (matchQr) {
    const { data } = await supabase
      .from("students")
      .select("id, full_name, dni, is_active, enrollments(categories(name))")
      .eq("id", matchQr[1])
      .maybeSingle();
    return data ? { ...data, method: "qr" as const } : null;
  }

  const normalizedDni = codigo.replace(/\D/g, "");
  const { data } = await supabase
    .from("students")
    .select("id, full_name, dni, is_active, enrollments(categories(name))")
    .eq("dni", normalizedDni || codigo.trim())
    .maybeSingle();

  return data ? { ...data, method: "dni" as const } : null;
}

export async function registrarIngreso(codigo: string, preferredMethod?: IngresoMethod) {
  const check = await assertRoleAction(["admin", "operador", "portero"]);
  if ("error" in check) return { error: check.error, student: null as IngresoConfirmacion | null, studentName: null as string | null };

  const student = await buscarAlumnoPorCodigo(codigo);

  if (!student) return { error: "No se encontró ningún alumno con ese código.", student: null, studentName: null };
  if (!student.is_active) return { error: `${student.full_name} figura como inactivo.`, student: null, studentName: null };

  const method = preferredMethod ?? student.method;
  const supabase = createClient();
  const checkedAt = new Date().toISOString();
  const { error: insertError } = await supabase.from("checkins").insert({
    student_id: student.id,
    recorded_by: check.userId,
    method,
    checked_in_at: checkedAt,
  });

  if (insertError) return { error: "No se pudo registrar el ingreso. Probá de nuevo.", student: null, studentName: null };

  const confirmation: IngresoConfirmacion = {
    id: student.id,
    full_name: student.full_name,
    dni: student.dni ?? null,
    categorias: (student.enrollments ?? [])
      .map((e: any) => e.categories?.name)
      .filter(Boolean),
    checked_in_at: checkedAt,
    method,
  };

  revalidatePath("/ingreso");
  revalidatePath("/asistencia/scanner");
  return { error: null, student: confirmation, studentName: confirmation.full_name };
}
