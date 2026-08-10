import { createClient } from "@/lib/supabase/server";

export type FilaReporteAlumno = {
  full_name: string;
  dni: string | null;
  birth_date: string | null;
  emergency_phone: string;
  tutor_name: string | null;
  is_active: boolean;
  categorias: string;
};

export async function getReporteAlumnos(): Promise<FilaReporteAlumno[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("students")
    .select("full_name, dni, birth_date, emergency_phone, tutor_name, is_active, enrollments(categories(name))")
    .order("full_name");

  return (data ?? []).map((s: any) => ({
    full_name: s.full_name,
    dni: s.dni,
    birth_date: s.birth_date,
    emergency_phone: s.emergency_phone,
    tutor_name: s.tutor_name,
    is_active: s.is_active,
    categorias: (s.enrollments ?? []).map((e: any) => e.categories?.name).filter(Boolean).join(", "),
  }));
}

export type FilaReporteProfesor = {
  full_name: string;
  email: string;
  role: "admin" | "profe" | "operador";
  genero: "M" | "F" | null;
  categorias: string;
};

export async function getReporteProfesores(): Promise<FilaReporteProfesor[]> {
  const supabase = createClient();
  const { data: perfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, genero")
    .order("full_name");

  const { data: asignaciones } = await supabase
    .from("professor_categories")
    .select("professor_id, categories(name)");

  const mapa = new Map<string, string[]>();
  (asignaciones ?? []).forEach((a: any) => {
    const arr = mapa.get(a.professor_id) ?? [];
    if (a.categories?.name) arr.push(a.categories.name);
    mapa.set(a.professor_id, arr);
  });

  return (perfiles ?? []).map((p) => ({
    full_name: p.full_name,
    email: p.email,
    role: p.role,
    genero: p.genero,
    categorias: (mapa.get(p.id) ?? []).join(", "),
  }));
}

export function toCsv(rows: Record<string, any>[], headers: { key: string; label: string }[]): string {
  const escape = (val: unknown) => {
    const str = val === null || val === undefined ? "" : String(val);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const headerLine = headers.map((h) => escape(h.label)).join(",");
  const lines = rows.map((row) => headers.map((h) => escape(row[h.key])).join(","));
  return [headerLine, ...lines].join("\n");
}
