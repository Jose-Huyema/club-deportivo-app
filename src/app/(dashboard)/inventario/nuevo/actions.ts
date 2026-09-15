"use server";

import { createClient } from "@/lib/supabase/server";
import { assertEditorAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

export async function crearArticulo(data: {
  name: string;
  disciplineId: string;
  totalQuantity: string;
  minWarningQuantity: string;
  description?: string;
}) {
  const check = await assertEditorAction();
  if ("error" in check) return check;

  if (!data.name.trim()) return { error: "El nombre es obligatorio." };

  const supabase = createClient();
  const { error } = await supabase.from("inventory_items").insert({
    name: data.name.trim(),
    discipline_id: data.disciplineId || null,
    total_quantity: Number(data.totalQuantity) || 0,
    min_warning_quantity: Number(data.minWarningQuantity) || 5,
    description: data.description?.trim() || null,
  });

  if (error) return { error: "No se pudo crear el artículo." };

  revalidatePath("/inventario");
  return { error: null };
}
