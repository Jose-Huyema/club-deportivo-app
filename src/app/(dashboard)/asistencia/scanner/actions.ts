"use server";

import { createClient } from "@/lib/supabase/server";
import { assertEditorAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

async function buscarAlumnoPorCodigo(codigo: string) {
  const supabase = createClient();

  const matchQr = codigo.match(/^STUDENT:(.+)$/);
  if (matchQr) {
    const { data } = await supabase
      .from("students")
      .select("id, full_name, is_active")
      .eq("id", matchQr[1])
      .maybeSingle();
    return data;
  }

  // Si no viene con el formato del QR del carnet, probamos como si fuera
  // un DNI (por si el lector escanea el código de barras del documento).
  const { data } = await supabase
    .from("students")
    .select("id, full_name, is_active")
    .eq("dni", codigo.trim())
    .maybeSingle();
  return data;
}

export async function registrarIngreso(codigo: string) {
  const check = await assertEditorAction();
  if ("error" in check) return { error: check.error, studentName: null };

  const student = await buscarAlumnoPorCodigo(codigo);

  if (!student) return { error: "No se encontró ningún alumno con ese código.", studentName: null };
  if (!student.is_active) return { error: `${student.full_name} figura como inactivo.`, studentName: null };

  const supabase = createClient();
  const { error: insertError } = await supabase.from("checkins").insert({
    student_id: student.id,
    recorded_by: check.userId,
  });

  if (insertError) return { error: "No se pudo registrar el ingreso. Probá de nuevo.", studentName: null };

  revalidatePath("/asistencia/scanner");
  return { error: null, studentName: student.full_name };
}
