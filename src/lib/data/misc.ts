import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Role, Genero } from "@/lib/roles";

/* ───────────────────────── Configuración general (app_settings) ───────────────────────── */

export type AppSettings = {
  club_name: string;
  club_subtitle: string;
};

const DEFAULTS: AppSettings = {
  club_name: "Club Deportivo",
  club_subtitle: "Asistencia e inventario",
};

async function fetchAppSettings(): Promise<AppSettings> {
  // OJO: esta función se envuelve en unstable_cache, que NO permite usar
  // cookies()/headers() de la request (Next.js lo prohíbe). Por eso acá
  // usamos un cliente de Supabase "pelado", sin cookies de sesión — no
  // hace falta ninguna, porque app_settings tiene lectura pública
  // (política RLS: USING (true)).
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("app_settings")
    .select("club_name, club_subtitle")
    .eq("id", 1)
    .single();

  if (error || !data) return DEFAULTS;
  return data;
}

/**
 * El nombre del club casi nunca cambia, así que en vez de consultar la
 * base en cada navegación se guarda en caché por 5 minutos. Cuando el
 * admin lo edita en Configuración, se invalida al instante con
 * revalidateTag("app-settings").
 */
export const getAppSettings = unstable_cache(fetchAppSettings, ["app-settings"], {
  tags: ["app-settings"],
  revalidate: 300,
});

/* ───────────────────────── Control de ingreso (checkins) ───────────────────────── */

export type UltimoIngreso = {
  id: string;
  student_name: string;
  checked_in_at: string;
};

export async function getUltimosIngresos(limit = 15): Promise<UltimoIngreso[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("checkins")
    .select("id, checked_in_at, students(full_name)")
    .order("checked_in_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((c: any) => ({
    id: c.id,
    student_name: c.students?.full_name ?? "Alumno",
    checked_in_at: c.checked_in_at,
  }));
}

/* ───────────────────────── Invitaciones de Google pendientes ───────────────────────── */

export type InvitacionPendiente = {
  email: string;
  role: Role;
  genero: Genero;
  created_at: string;
};

export async function getInvitacionesPendientes(): Promise<InvitacionPendiente[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("invited_emails")
    .select("email, role, genero, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}
