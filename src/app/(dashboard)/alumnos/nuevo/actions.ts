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
  dni?: string;
  address?: string;
  heightCm?: string;
  weightKg?: string;
  clothingSize?: string;
  categoryIds: string[];
}): Promise<{ error: string; studentId?: undefined } | { error: null; studentId: string }> {
  const check = await assertAdminAction();
  if ("error" in check) return { error: check.error, studentId: undefined };

  if (!data.fullName.trim()) return { error: "El nombre es obligatorio.", studentId: undefined };
  if (!data.emergencyPhone.trim())
    return { error: "El teléfono de emergencia es obligatorio.", studentId: undefined };

  const supabase = createClient();

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      full_name: data.fullName.trim(),
      emergency_phone: data.emergencyPhone.trim(),
      birth_date: data.birthDate || null,
      tutor_name: data.tutorName?.trim() || null,
      medical_notes: data.medicalNotes?.trim() || null,
      dni: data.dni?.trim() || null,
      address: data.address?.trim() || null,
      height_cm: data.heightCm ? Number(data.heightCm) : null,
      weight_kg: data.weightKg ? Number(data.weightKg) : null,
      clothing_size: data.clothingSize?.trim() || null,
    })
    .select("id")
    .single();

  if (error || !student) return { error: "No se pudo crear el alumno.", studentId: undefined };

  if (data.categoryIds.length > 0) {
    const rows = data.categoryIds.map((categoryId) => ({
      student_id: student.id,
      category_id: categoryId,
    }));
    const { error: enrollError } = await supabase.from("enrollments").insert(rows);
    if (enrollError) {
      return {
        error: "El alumno se creó pero no se pudo inscribirlo en las categorías elegidas.",
        studentId: undefined,
      };
    }
  }

  revalidatePath("/alumnos");
  return { error: null, studentId: student.id };
}
