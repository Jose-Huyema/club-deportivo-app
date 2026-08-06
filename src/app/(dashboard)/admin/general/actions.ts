"use server";

import { createClient } from "@/lib/supabase/server";
import { assertAdminAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

export async function actualizarConfiguracion(clubName: string, clubSubtitle: string) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  if (!clubName.trim()) return { error: "El nombre del club es obligatorio." };

  const supabase = createClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ club_name: clubName.trim(), club_subtitle: clubSubtitle.trim() })
    .eq("id", 1);

  if (error) return { error: "No se pudo guardar la configuración." };

  revalidatePath("/", "layout");
  return { error: null };
}
