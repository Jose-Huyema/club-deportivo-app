"use server";

import { createClient } from "@/lib/supabase/server";
import { assertAdminAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

export async function crearAlumno(data: {
  fullName: string;
  emergencyPhone: string;
  birthDate?: string;
  tutorName?: string;
  medicalNotes?: string;
  categoryIds: string[];
}) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  if (!data.fullName.trim()) return { error: "El nombre es obligatorio." };
  if (!data.emergencyPhone.trim()) return { error: "El teléfono de emergencia es obligatorio." };

  const supabase = createClient();

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      full_name: data.fullName.trim(),
      emergency_phone: data.emergencyPhone.trim(),
      birth_date: data.birthDate || null,
      tutor_name: data.tutorName?.trim() || null,
      medical_notes: data.medicalNotes?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !student) return { error: "No se pudo crear el alumno." };

  if (data.categoryIds.length > 0) {
    const rows = data.categoryIds.map((categoryId) => ({
      student_id: student.id,
      category_id: categoryId,
    }));
    const { error: enrollError } = await supabase.from("enrollments").insert(rows);
    if (enrollError) {
      return { error: "El alumno se creó pero no se pudo inscribirlo en las categorías elegidas." };
    }
  }

  revalidatePath("/alumnos");
  return { error: null, studentId: student.id };
}
