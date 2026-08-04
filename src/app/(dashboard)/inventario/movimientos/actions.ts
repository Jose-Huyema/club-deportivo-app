"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function registrarMovimiento(formData: {
  itemId: string;
  type: "ingreso" | "egreso" | "baja_desgaste";
  quantity: number;
  notes?: string;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesión expirada. Volvé a iniciar sesión." };
  if (formData.quantity <= 0) return { error: "La cantidad debe ser mayor a 0." };

  const { error } = await supabase.from("inventory_movements").insert({
    item_id: formData.itemId,
    user_id: user.id,
    type: formData.type,
    quantity: formData.quantity,
    notes: formData.notes || null,
  });

  if (error) return { error: "No se pudo registrar el movimiento. Probá de nuevo." };

  revalidatePath("/inventario");
  revalidatePath("/inventario/movimientos");
  return { error: null };
}
