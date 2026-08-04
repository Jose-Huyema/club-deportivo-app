"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdminAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

export async function toggleAsignacion(professorId: string, categoryId: string, asignar: boolean) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const supabase = createClient();

  if (asignar) {
    const { error } = await supabase
      .from("professor_categories")
      .insert({ professor_id: professorId, category_id: categoryId });
    if (error && error.code !== "23505") return { error: "No se pudo asignar la categoría." };
  } else {
    const { error } = await supabase
      .from("professor_categories")
      .delete()
      .eq("professor_id", professorId)
      .eq("category_id", categoryId);
    if (error) return { error: "No se pudo quitar la categoría." };
  }

  revalidatePath("/admin/usuarios");
  return { error: null };
}

export async function cambiarRol(userId: string, role: "admin" | "profe") {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: "No se pudo cambiar el rol." };

  revalidatePath("/admin/usuarios");
  return { error: null };
}

/**
 * Invita a un usuario nuevo por email usando la Admin API de Supabase.
 * Le llega un mail con un link para que elija su propia contraseña:
 * el admin nunca ve ni maneja contraseñas ajenas.
 */
export async function invitarUsuario(email: string, fullName: string, role: "admin" | "profe") {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  if (!email.trim()) return { error: "El email es obligatorio." };
  if (!fullName.trim()) return { error: "El nombre es obligatorio." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
    data: { full_name: fullName.trim(), role },
  });

  if (error) {
    // Log completo en los logs de Vercel (Functions → Logs) para poder
    // diagnosticar la causa real, que Supabase a veces no expone bien al cliente.
    console.error("Error al invitar usuario:", {
      message: error.message,
      status: (error as any).status,
      code: (error as any).code,
      name: error.name,
      raw: error,
    });

    const yaExiste = error.message?.toLowerCase().includes("already");
    const detalle = error.message && error.message !== "{}" ? ` (${error.message})` : "";

    return {
      error: yaExiste
        ? "Ese email ya está registrado."
        : `No se pudo enviar la invitación${detalle}. Revisá los logs de Vercel para más detalle.`,
    };
  }

  revalidatePath("/admin/usuarios");
  return { error: null };
}
