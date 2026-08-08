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

export async function cambiarRol(userId: string, role: "admin" | "profe" | "operador") {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: "No se pudo cambiar el rol." };

  revalidatePath("/admin/usuarios");
  return { error: null };
}

/**
 * Actualiza qué secciones puede ver un usuario (lo que arma "perfiles con
 * vistas seleccionadas"). Recibe la lista completa de vistas permitidas.
 */
export async function actualizarVistas(userId: string, views: string[]) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ allowed_views: views }).eq("id", userId);
  if (error) return { error: "No se pudieron guardar las vistas." };

  revalidatePath("/admin/usuarios");
  return { error: null };
}

/**
 * Habilita o deshabilita el acceso de un usuario (no borra nada, solo le
 * impide iniciar sesión). Usa la Admin API porque este estado vive en
 * auth.users, no en una tabla que podamos tocar con el cliente normal.
 */
export async function alternarHabilitado(userId: string, habilitar: boolean) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  if (userId === check.userId && !habilitar) {
    return { error: "No podés deshabilitarte a vos mismo." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: habilitar ? "none" : "876000h", // ~100 años = deshabilitado indefinidamente
  });

  if (error) return { error: "No se pudo actualizar el estado del usuario." };

  revalidatePath("/admin/usuarios");
  return { error: null };
}

/**
 * Invita a un usuario nuevo por email usando la Admin API de Supabase.
 * redirectTo le dice a Supabase adónde mandar a la persona DESPUÉS de que
 * el link del mail valide su token — a nuestra ruta /auth/callback, que a
 * su vez la manda a /actualizar-password para que elija su contraseña.
 */
export async function invitarUsuario(email: string, fullName: string, role: "admin" | "profe" | "operador") {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  if (!email.trim()) return { error: "El email es obligatorio." };
  if (!fullName.trim()) return { error: "El nombre es obligatorio." };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return {
      error:
        "Falta configurar NEXT_PUBLIC_SITE_URL en las variables de entorno de Vercel (con la URL de tu app) antes de poder invitar usuarios.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email.trim(), {
    data: { full_name: fullName.trim(), role },
    redirectTo: `${siteUrl}/auth/callback?next=/actualizar-password`,
  });

  if (error) {
    console.error("Error al invitar usuario:", { message: error.message, raw: error });
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
