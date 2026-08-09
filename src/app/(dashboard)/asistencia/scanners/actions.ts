"use server";

import { createClient } from "@/lib/supabase/server";
import { assertEditorAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

export async function registrarIngreso(qrTexto: string) {
  const check = await assertEditorAction();
  if ("error" in check) return { error: check.error, studentName: null };

  const match = qrTexto.match(/^STUDENT:(.+)$/);
  if (!match) return { error: "Ese código QR no corresponde a un carnet de alumno.", studentName: null };

  const studentId = match[1];
  const supabase = createClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, full_name, is_active")
    .eq("id", studentId)
    .single();

  if (studentError || !student) return { error: "No se encontró ningún alumno con ese código.", studentName: null };
  if (!student.is_active) return { error: `${student.full_name} figura como inactivo.`, studentName: null };

  const { error: insertError } = await supabase.from("checkins").insert({
    student_id: student.id,
    recorded_by: check.userId,
  });

  if (insertError) return { error: "No se pudo registrar el ingreso. Probá de nuevo.", studentName: null };

  revalidatePath("/asistencia/scanner");
  return { error: null, studentName: student.full_name };
}
