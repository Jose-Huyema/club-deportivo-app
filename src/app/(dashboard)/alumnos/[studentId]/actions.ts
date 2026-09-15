"use server";

import { createClient } from "@/lib/supabase/server";
import { assertEditorAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

export async function toggleInscripcion(studentId: string, categoryId: string, inscribir: boolean) {
  const check = await assertEditorAction();
  if ("error" in check) return check;

  const supabase = createClient();

  if (inscribir) {
    const { error } = await supabase.from("enrollments").insert({ student_id: studentId, category_id: categoryId });
    if (error && error.code !== "23505") return { error: "No se pudo inscribir al alumno." };
  } else {
    const { error } = await supabase
      .from("enrollments")
      .delete()
      .eq("student_id", studentId)
      .eq("category_id", categoryId);
    if (error) return { error: "No se pudo desinscribir al alumno." };
  }

  revalidatePath(`/alumnos/${studentId}`);
  return { error: null };
}

export async function setAlumnoActivo(studentId: string, isActive: boolean) {
  const check = await assertEditorAction();
  if ("error" in check) return check;

  const supabase = createClient();
  const { error } = await supabase.from("students").update({ is_active: isActive }).eq("id", studentId);
  if (error) return { error: "No se pudo actualizar el estado del alumno." };

  revalidatePath(`/alumnos/${studentId}`);
  revalidatePath("/alumnos");
  return { error: null };
}
