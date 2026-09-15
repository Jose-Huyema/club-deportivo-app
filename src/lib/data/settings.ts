import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AppSettings = {
  club_name: string;
  club_subtitle: string;
};

const DEFAULTS: AppSettings = {
  club_name: "Club Deportivo",
  club_subtitle: "Asistencia e inventario",
};

async function fetchAppSettings(): Promise<AppSettings> {
  const supabase = createClient();
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
 * base en cada navegación (login, cada página del dashboard, cada carnet),
 * se guarda en caché por 5 minutos. Cuando el admin lo edita en
 * Configuración, se invalida al instante con revalidateTag("app-settings").
 */
export const getAppSettings = unstable_cache(fetchAppSettings, ["app-settings"], {
  tags: ["app-settings"],
  revalidate: 300,
});
