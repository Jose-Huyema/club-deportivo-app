"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type EstadoAlumno = { student_id: string; status: "presente" | "ausente" | "justificado" };

/**
 * Guarda la asistencia del día para una categoría: crea (o reutiliza) el
 * registro de `attendances` y hace upsert de cada `attendance_details`.
 * Todo en un server action para que el cliente no necesite lógica de negocio.
 */
export async function guardarAsistencia(categoryId: string, alumnos: EstadoAlumno[]) {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesión expirada. Volvé a iniciar sesión." };

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendances")
    .upsert(
      { category_id: categoryId, date: today, professor_id: user.id },
      { onConflict: "category_id,date", ignoreDuplicates: false }
    )
    .select("id")
    .single();

  if (attendanceError || !attendance) {
    return { error: "No se pudo crear el registro de asistencia. Probá de nuevo." };
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
  return { error: null };
}
