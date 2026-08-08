
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type Disciplina = { id: string; name: string; description: string | null };

export async function getDisciplinas(): Promise<Disciplina[]> {
  const supabase = createClient();
  const { data } = await supabase.from("disciplines").select("id, name, description").order("name");
  return data ?? [];
}

export type Categoria = { id: string; name: string; schedule: string | null; discipline_id: string; discipline_name: string };

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, schedule, discipline_id, disciplines(name)")
    .order("name");

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    schedule: c.schedule,
    discipline_id: c.discipline_id,
    discipline_name: c.disciplines?.name ?? "—",
  }));
}

export type ProfesorConCategorias = {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "profe" | "operador";
  allowed_views: string[];
  categoria_ids: string[];
  habilitado: boolean;
};

export async function getProfesores(): Promise<ProfesorConCategorias[]> {
  const supabase = createClient();
  const { data: perfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, allowed_views")
    .order("full_name");

  const { data: asignaciones } = await supabase
    .from("professor_categories")
    .select("professor_id, category_id");

  const mapa = new Map<string, string[]>();
  (asignaciones ?? []).forEach((a) => {
    const arr = mapa.get(a.professor_id) ?? [];
    arr.push(a.category_id);
    mapa.set(a.professor_id, arr);
  });

  // Estado habilitado/deshabilitado vive en auth.users (banned_until),
  // no en la tabla profiles, así que necesita la Admin API.
  let baneados = new Set<string>();
  try {
    const admin = createAdminClient();
    const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    baneados = new Set(
      (usersData?.users ?? [])
        .filter((u) => u.banned_until && new Date(u.banned_until) > new Date())
        .map((u) => u.id)
    );
  } catch {
    // Si falla, asumimos que todos están habilitados en vez de romper la pantalla.
  }

  return (perfiles ?? []).map((p) => ({
    ...p,
    allowed_views: p.allowed_views ?? [],
    categoria_ids: mapa.get(p.id) ?? [],
    habilitado: !baneados.has(p.id),
  }));
}
