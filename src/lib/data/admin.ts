import { createClient } from "@/lib/supabase/server";

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
  role: "admin" | "profe";
  categoria_ids: string[];
};

export async function getProfesores(): Promise<ProfesorConCategorias[]> {
  const supabase = createClient();
  const { data: perfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
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

  return (perfiles ?? []).map((p) => ({
    ...p,
    categoria_ids: mapa.get(p.id) ?? [],
  }));
}
