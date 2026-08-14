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

  revalidatePath("/usuarios");
  return { error: null };
}

export async function cambiarRol(userId: string, role: "admin" | "profe" | "operador" | "portero") {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { error: "No se pudo cambiar el rol." };

  revalidatePath("/usuarios");
  return { error: null };
}

export async function actualizarVistas(userId: string, views: string[]) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ allowed_views: views }).eq("id", userId);
  if (error) return { error: "No se pudieron guardar las vistas." };

  revalidatePath("/usuarios");
  return { error: null };
}

export async function actualizarGenero(userId: string, genero: "M" | "F" | null) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ genero }).eq("id", userId);
  if (error) return { error: "No se pudo guardar el género." };

  revalidatePath("/usuarios");
  return { error: null };
}

export async function alternarHabilitado(userId: string, habilitar: boolean) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  if (userId === check.userId && !habilitar) {
    return { error: "No podés deshabilitarte a vos mismo." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: habilitar ? "none" : "876000h",
  });

  if (error) return { error: "No se pudo actualizar el estado del usuario." };

  revalidatePath("/usuarios");
  return { error: null };
}

/** Cambia el email de login del usuario (en auth.users) y lo sincroniza en profiles. */
export async function actualizarEmail(userId: string, nuevoEmail: string) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const email = nuevoEmail.trim().toLowerCase();
  if (!email || !email.includes("@")) return { error: "Ingresá un email válido." };

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    email,
    email_confirm: true,
  });
  if (authError) {
    const yaExiste = authError.message?.toLowerCase().includes("already");
    return { error: yaExiste ? "Ese email ya está en uso por otro usuario." : "No se pudo cambiar el email." };
  }

  const supabase = createClient();
  const { error: profileError } = await supabase.from("profiles").update({ email }).eq("id", userId);
  if (profileError) return { error: "El email se cambió para iniciar sesión, pero no se pudo actualizar en el perfil." };

  revalidatePath("/usuarios");
  return { error: null };
}

/** Reenvía el mail de invitación (solo tiene efecto si la persona todavía no confirmó su cuenta). */
export async function reenviarInvitacion(email: string) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return { error: "Falta configurar NEXT_PUBLIC_SITE_URL en Vercel." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/actualizar-password`,
  });

  if (error) {
    const yaConfirmado = error.message?.toLowerCase().includes("already");
    return {
      error: yaConfirmado
        ? "Este usuario ya confirmó su cuenta, no hace falta reenviar la invitación."
        : "No se pudo reenviar la invitación.",
    };
  }

  return { error: null };
}

/** Borra al usuario definitivamente (auth.users y, en cascada, su perfil). Irreversible. */
export async function eliminarUsuario(userId: string) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  if (userId === check.userId) return { error: "No podés eliminarte a vos mismo." };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: "No se pudo eliminar el usuario." };

  revalidatePath("/usuarios");
  return { error: null };
}

/**
 * Autoriza un email de Gmail a entrar con Google: apenas esa persona
 * inicie sesión con esa cuenta, el trigger de la base le crea el perfil
 * ya con este rol/vistas. No se manda ningún mail desde acá — el "aviso"
 * se lo das vos por fuera (WhatsApp, en persona, etc.), decile que entre
 * a la app y toque "Continuar con Google".
 */
export async function autorizarGoogle(
  email: string,
  role: "admin" | "profe" | "operador" | "portero",
  genero: "M" | "F" | ""
) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const emailLimpio = email.trim().toLowerCase();
  if (!emailLimpio || !emailLimpio.includes("@")) return { error: "Ingresá un email válido." };

  const allowedViews =
    role === "admin" ? ["asistencia", "alumnos", "inventario", "documentos", "reportes"]
    : role === "operador" ? ["alumnos", "documentos", "reportes"]
    : role === "portero" ? ["ingreso"]
    : ["asistencia", "alumnos", "inventario"];

  const supabase = createClient();
  const { error } = await supabase.from("invited_emails").upsert({
    email: emailLimpio,
    role,
    genero: genero || null,
    allowed_views: allowedViews,
    invited_by: check.userId,
  });

  if (error) return { error: "No se pudo autorizar el email." };

  revalidatePath("/usuarios");
  return { error: null };
}

export async function cancelarAutorizacionPendiente(email: string) {
  const check = await assertAdminAction();
  if ("error" in check) return check;

  const supabase = createClient();
  const { error } = await supabase.from("invited_emails").delete().eq("email", email);
  if (error) return { error: "No se pudo cancelar." };

  revalidatePath("/usuarios");
  return { error: null };
}

/**
 * Invita a un usuario nuevo por email usando la Admin API de Supabase.
 * role y genero viajan como metadata: el trigger handle_new_user los usa
 * para crear el perfil ya con el rol, las vistas por defecto y el género.
 */
export async function invitarUsuario(
  email: string,
  fullName: string,
  role: "admin" | "profe" | "operador" | "portero",
  genero: "M" | "F" | ""
) {
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
    data: { full_name: fullName.trim(), role, genero: genero || undefined },
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

  revalidatePath("/usuarios");
  return { error: null };
}
