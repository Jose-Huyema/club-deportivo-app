"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearCategoria(disciplineId: string, name: string, schedule: string) {
  if (!disciplineId) return { error: "Elegí una disciplina." };
  if (!name.trim()) return { error: "El nombre es obligatorio." };

  const supabase = createClient();
  const { error } = await supabase.from("categories").insert({
    discipline_id: disciplineId,
    name: name.trim(),
    schedule: schedule.trim() || null,
  });

  if (error) return { error: "No se pudo crear la categoría." };

  revalidatePath("/admin/categorias");
  revalidatePath("/asistencia");
  return { error: null };
}
