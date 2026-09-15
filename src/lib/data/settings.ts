import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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
