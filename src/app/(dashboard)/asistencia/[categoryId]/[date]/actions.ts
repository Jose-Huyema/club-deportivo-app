"use server";

import { createClient } from "@/lib/supabase/server";
import { assertEditorAction, assertAdminAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

type EstadoAlumno = { student_id: string; status: "presente" | "ausente" | "justificado" };

/**
 * Guarda y FINALIZA la asistencia de una fecha para una categoría: crea (o
 * reutiliza) el registro de `attendances`, guarda cada `attendance_details`,
 * y marca finalized=true. A partir de ahí queda de solo lectura salvo que
 * un admin la reabra.
 */
export async function finalizarAsistencia(categoryId: string, date: string, alumnos: EstadoAlumno[]) {
  const check = await assertEditorAction();
  if ("error" in check) return { error: check.error };

  const supabase = createClient();

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendances")
    .upsert(
      { category_id: categoryId, date, professor_id: check.userId, finalized: true },
      { onConflict: "category_id,date", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (attendanceError || !attendance) {
    return { error: "No se pudo guardar el registro de asistencia. Probá de nuevo." };
  }

  const detailRows = alumnos.map((a) => ({
    attendance_id: attendance.id,
    student_id: a.student_id,
    status: a.status,
  }));

  const { error: detailsError } = await supabase
    .from("attendance_details")
    .upsert(detailRows, { onConflict: "attendance_id,student_id" });

  if (detailsError) {
    return { error: "La asistencia se creó pero no se pudieron guardar los estados." };
  }

  revalidatePath("/asistencia");
  revalidatePath(`/asistencia/${categoryId}`);
  revalidatePath(`/asistencia/${categoryId}/${date}`);
  return { error: null };
}

/** Admin-only: reabre una asistencia finalizada para poder corregirla. */
export async function reabrirAsistencia(attendanceId: string, categoryId: string, date: string) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const supabase = createClient();
  const { error } = await supabase.from("attendances").update({ finalized: false }).eq("id", attendanceId);
  if (error) return { error: "No se pudo reabrir la asistencia." };

  revalidatePath(`/asistencia/${categoryId}/${date}`);
  return { error: null };
}
