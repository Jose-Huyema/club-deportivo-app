"use server";

import { createClient } from "@/lib/supabase/server";
import { assertEditorAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

export async function actualizarAlumno(
  studentId: string,
  data: {
    fullName: string;
    emergencyPhone: string;
    phone?: string;
    birthDate?: string;
    tutorName?: string;
    medicalNotes?: string;
    dni?: string;
    address?: string;
    heightCm?: string;
    weightKg?: string;
    clothingSize?: string;
  }
) {
  const check = await assertEditorAction();
  if ("error" in check) return check;

  if (!data.fullName.trim()) return { error: "El nombre es obligatorio." };
  if (!data.emergencyPhone.trim()) return { error: "El teléfono de emergencia es obligatorio." };

  const supabase = createClient();
  const { error } = await supabase
    .from("students")
    .update({
      full_name: data.fullName.trim(),
      emergency_phone: data.emergencyPhone.trim(),
      phone: data.phone?.trim() || null,
      birth_date: data.birthDate || null,
      tutor_name: data.tutorName?.trim() || null,
      medical_notes: data.medicalNotes?.trim() || null,
      dni: data.dni?.trim() || null,
      address: data.address?.trim() || null,
      height_cm: data.heightCm ? Number(data.heightCm) : null,
      weight_kg: data.weightKg ? Number(data.weightKg) : null,
      clothing_size: data.clothingSize?.trim() || null,
    })
    .eq("id", studentId);

  if (error) return { error: "No se pudieron guardar los cambios." };

  revalidatePath(`/alumnos/${studentId}`);
  revalidatePath("/alumnos");
  return { error: null };
}
