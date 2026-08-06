"use server";

import { createClient } from "@/lib/supabase/server";
import { assertEditorAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

export async function registrarMovimiento(formData: {
  itemId: string;
  type: "ingreso" | "egreso" | "baja_desgaste";
  quantity: number;
  notes?: string;
}) {
  const check = await assertEditorAction();
  if ("error" in check) return check;

  if (formData.quantity <= 0) return { error: "La cantidad debe ser mayor a 0." };

  const supabase = createClient();
  const { error } = await supabase.from("inventory_movements").insert({
    item_id: formData.itemId,
    user_id: check.userId,
    type: formData.type,
    quantity: formData.quantity,
    notes: formData.notes || null,
  });

  if (error) return { error: "No se pudo registrar el movimiento. Probá de nuevo." };

  revalidatePath("/inventario");
  revalidatePath("/inventario/movimientos");
  return { error: null };
}
