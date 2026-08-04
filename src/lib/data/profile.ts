import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "profe";
};

/**
 * Obtiene el perfil del usuario logueado. Si no hay sesión, redirige a /login.
 * Centraliza esta lógica para no repetirla en cada página protegida.
 */
export async function requireProfile(): Promise<Profile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) redirect("/login");

  return profile as Profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/asistencia");
  return profile;
}

/**
 * Chequeo de admin pensado para usarse DENTRO de Server Actions (no redirige,
 * devuelve un resultado de error para que la action lo propague al formulario).
 */
export async function assertAdminAction(): Promise<{ userId: string } | { error: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sesión expirada. Volvé a iniciar sesión." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "No tenés permisos para esta acción." };

  return { userId: user.id };
}
