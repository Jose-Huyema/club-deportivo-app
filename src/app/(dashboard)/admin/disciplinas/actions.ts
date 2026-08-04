"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearDisciplina(name: string, description: string) {
  if (!name.trim()) return { error: "El nombre es obligatorio." };

  const supabase = createClient();
  const { error } = await supabase.from("disciplines").insert({
    name: name.trim(),
    description: description.trim() || null,
  });

  if (error) {
    return {
      error: error.code === "23505" ? "Ya existe una disciplina con ese nombre." : "No se pudo crear la disciplina.",
    };
  }

  revalidatePath("/admin/disciplinas");
  return { error: null };
}
