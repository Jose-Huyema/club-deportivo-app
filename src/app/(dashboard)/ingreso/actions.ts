"use server";

import { createClient } from "@/lib/supabase/server";
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
  const q = term.trim();
  if (q.length < 2) return { data: [], error: null };

  const supabase = createClient();
  const { data, error } = await supabase.rpc("buscar_alumnos_ingreso", {
    p_term: q,
    p_limit: 8,
  });

  if (error) return { data: [], error: "No se pudo realizar la búsqueda." };
  return { data: (data ?? []) as IngresoAlumno[], error: null };
}

export async function registrarIngresoRapido(studentId: string): Promise<{
  error: string | null;
  student: IngresoConfirmacion | null;
}> {
  const result = await registrarIngreso(`STUDENT:${studentId}`, "manual");
  revalidatePath("/ingreso");
  return { error: result.error, student: result.student };
}

export async function registrarIngresoPorCodigo(codigo: string): Promise<{
  error: string | null;
  student: IngresoConfirmacion | null;
}> {
  const trimmed = codigo.trim();
  const method = trimmed.startsWith("STUDENT:") ? "qr" : "dni";
  const result = await registrarIngreso(trimmed, method);
  revalidatePath("/ingreso");
  return { error: result.error, student: result.student };
}
