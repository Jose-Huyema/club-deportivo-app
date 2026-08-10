import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { puedeEditar, labelRol, type Role, type Genero } from "@/lib/roles";

// Re-exportados para no romper los imports existentes (@/lib/data/profile
// seguía siendo el lugar de donde varias páginas los importaban).
export { puedeEditar, labelRol };
export type { Role, Genero };

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  allowed_views: string[];
  genero: Genero;
};

/**
 * Trae el perfil UNA sola vez por request, sin importar cuántas veces se
 * llame (layout + page + componentes anidados). React.cache() memoiza el
 * resultado dentro del mismo ciclo de render.
 */
const getCachedProfile = cache(async (): Promise<Profile | null> => {
  const supabase = createClient();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, allowed_views, genero")
    .eq("id", data.user.id)
    .single();

  if (error || !profile) return null;
  return profile as Profile;
});

export async function requireProfile(): Promise<Profile> {
  const profile = await getCachedProfile();
  if (!profile) redirect("/login");
  return profile;
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
