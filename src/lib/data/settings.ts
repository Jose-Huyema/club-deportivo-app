import { createClient } from "@/lib/supabase/server";

export type AppSettings = {
  club_name: string;
  club_subtitle: string;
};

const DEFAULTS: AppSettings = {
  club_name: "Club Deportivo",
  club_subtitle: "Asistencia e inventario",
};

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("club_name, club_subtitle")
    .eq("id", 1)
    .single();

  if (error || !data) return DEFAULTS;
  return data;
}
