import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Role = "admin" | "profe" | "operador";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  allowed_views: string[];
};

export function puedeEditar(role: Role) {
  return role === "admin" || role === "operador";
}

/**
 * Obtiene el perfil del usuario logueado. Si no hay sesión, redirige a /login.
 */
export async function requireProfile(): Promise<Profile> {
  const supabase = createClient();

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, allowed_views")
    .eq("id", data.user.id)
    .single();

  if (error || !profile) redirect("/login");

  return profile as Profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/asistencia");
  return profile;
}

export async function requireEditor(): Promise<Profile> {
  const profile = await requireProfile();
  if (!puedeEditar(profile.role)) redirect("/asistencia");
  return profile;
}

/**
 * Chequeo de rol pensado para usarse DENTRO de Server Actions (no redirige,
 * devuelve un resultado de error para que la action lo propague al formulario).
 */
export async function assertRoleAction(
  allowedRoles: Role[]
): Promise<{ userId: string; role: Role } | { error: string }> {
  const supabase = createClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) return { error: "Sesión expirada. Volvé a iniciar sesión." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role as Role)) {
    return { error: "No tenés permisos para esta acción." };
  }

  return { userId: data.user.id, role: profile.role as Role };
}

export async function assertAdminAction() {
  return assertRoleAction(["admin"]);
}

export async function assertEditorAction() {
  return assertRoleAction(["admin", "operador"]);
}
