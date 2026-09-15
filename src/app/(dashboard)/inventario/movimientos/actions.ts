"use server";

import { createClient } from "@/lib/supabase/server";
import { assertRoleAction } from "@/lib/data/profile";
import { getDisciplinasDelProfe } from "@/lib/data/inventario";
import { revalidatePath } from "next/cache";

export async function registrarMovimiento(formData: {
  itemId: string;
  type: "ingreso" | "egreso" | "baja_desgaste";
  quantity: number;
  notes?: string;
}) {
  const check = await assertRoleAction(["admin", "operador", "profe"]);
  if ("error" in check) return check;

  if (formData.quantity <= 0) return { error: "La cantidad debe ser mayor a 0." };

  const supabase = createClient();

  if (check.role === "profe") {
    if (formData.type === "ingreso") {
      return { error: "Como profe, solo podés registrar egresos o bajas, no ingresos." };
    }
    if (!formData.notes?.trim()) {
      return { error: "El motivo es obligatorio para registrar un egreso o baja." };
    }

    const { data: item } = await supabase
      .from("inventory_items")
      .select("discipline_id")
      .eq("id", formData.itemId)
      .single();

    const disciplinasProfe = await getDisciplinasDelProfe(check.userId);
    if (!item?.discipline_id || !disciplinasProfe.includes(item.discipline_id)) {
      return { error: "Ese artículo no pertenece a una disciplina que tengas asignada." };
    }
  }

  const { error } = await supabase.from("inventory_movements").insert({
    item_id: formData.itemId,
    user_id: check.userId,
    type: formData.type,
    quantity: formData.quantity,
    notes: formData.notes || null,
  });

  if (error) return { error: "No se pudo registrar el movimiento. Probá de nuevo. Verificá que tengas permiso sobre ese artículo." };

  revalidatePath("/inventario");
  revalidatePath("/inventario/movimientos");
  return { error: null };
}
