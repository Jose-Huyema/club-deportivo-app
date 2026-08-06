import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const FALLBACK_ORDER = ["asistencia", "alumnos", "inventario", "documentos", "reportes"];

export default async function HomePage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, allowed_views")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "admin") redirect("/asistencia");

  const primeraVista = FALLBACK_ORDER.find((v) => (profile?.allowed_views ?? []).includes(v));
  redirect(primeraVista ? `/${primeraVista}` : "/login");
}
