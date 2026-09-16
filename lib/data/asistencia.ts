import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/roles";

export type CategoriaConEstado = {
  id: string;
  name: string;
  schedule: string | null;
  discipline_name: string;
  ya_registrada_hoy: boolean;
};

/**
 * Categorías visibles para el usuario actual:
 * - admin: todas
 * - profe: solo las que tiene asignadas en professor_categories
 * Incluye si ya se tomó asistencia hoy, para mostrarlo en la lista.
 */
export async function getCategoriasParaAsistencia(
  userId: string,
  role: Role
): Promise<CategoriaConEstado[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  let categoryIds: string[] | null = null;

  if (role === "profe") {
    const { data: asignadas } = await supabase
      .from("professor_categories")
      .select("category_id")
      .eq("professor_id", userId);
    categoryIds = (asignadas ?? []).map((a) => a.category_id);
    if (categoryIds.length === 0) return [];
  }

  let query = supabase
    .from("categories")
    .select("id, name, schedule, disciplines(name)")
    .order("name");

  if (categoryIds) query = query.in("id", categoryIds);

  const { data: categorias, error } = await query;
  if (error || !categorias) return [];

  const { data: yaTomadas } = await supabase
    .from("attendances")
    .select("category_id")
    .eq("date", today)
    .eq("finalized", true);

  const tomadasSet = new Set((yaTomadas ?? []).map((a) => a.category_id));

  return categorias.map((c: any) => ({
    id: c.id,
    name: c.name,
    schedule: c.schedule,
    discipline_name: c.disciplines?.name ?? "Sin disciplina",
    ya_registrada_hoy: tomadasSet.has(c.id),
  }));
}

export type AlumnoParaAsistencia = {
  student_id: string;
  full_name: string;
  dni: string | null;
  status: "presente" | "ausente" | "justificado";
};

/**
 * Alumnos activos inscriptos en la categoría, con el estado de asistencia
 * de la fecha pedida si ya existe (para poder editar/revisar), o
 * "presente" por defecto. Incluye si ese día ya quedó finalizado.
 */
export async function getAlumnosParaAsistencia(
  categoryId: string,
  date: string
): Promise<{
  categoryName: string;
  attendanceId: string | null;
  finalized: boolean;
  alumnos: AlumnoParaAsistencia[];
}> {
  const supabase = createClient();

  const { data: categoria } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  const { data: inscripciones } = await supabase
    .from("enrollments")
    .select("student_id, students!inner(id, full_name, dni, is_active)")
    .eq("category_id", categoryId)
    .eq("students.is_active", true);

  const { data: attendance } = await supabase
    .from("attendances")
    .select("id, finalized")
    .eq("category_id", categoryId)
    .eq("date", date)
    .maybeSingle();

  let detallesMap = new Map<string, "presente" | "ausente" | "justificado">();
  if (attendance) {
    const { data: detalles } = await supabase
      .from("attendance_details")
      .select("student_id, status")
      .eq("attendance_id", attendance.id);
    detallesMap = new Map((detalles ?? []).map((d) => [d.student_id, d.status]));
  }

  const alumnos: AlumnoParaAsistencia[] = (inscripciones ?? [])
    .map((i: any) => ({
      student_id: i.students.id,
      full_name: i.students.full_name,
      dni: i.students.dni,
      status: detallesMap.get(i.students.id) ?? "presente",
    }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  return {
    categoryName: categoria?.name ?? "Categoría",
    attendanceId: attendance?.id ?? null,
    finalized: attendance?.finalized ?? false,
    alumnos,
  };
}

export type DiaDelMes = {
  date: string; // YYYY-MM-DD
  estado: "sin_registrar" | "en_progreso" | "finalizada";
};

/**
 * Estado de cada día del mes para una categoría: sin registrar, en
 * progreso (se guardó pero no se finalizó) o finalizada. Alimenta el
 * calendario mensual de asistencia.
 */
export async function getResumenMensual(
  categoryId: string,
  year: number,
  month: number // 1-12
): Promise<Map<string, "en_progreso" | "finalizada">> {
  const supabase = createClient();
  const inicio = `${year}-${String(month).padStart(2, "0")}-01`;
  const ultimoDia = new Date(year, month, 0).getDate();
  const fin = `${year}-${String(month).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;

  const { data } = await supabase
    .from("attendances")
    .select("date, finalized")
    .eq("category_id", categoryId)
    .gte("date", inicio)
    .lte("date", fin);

  const mapa = new Map<string, "en_progreso" | "finalizada">();
  (data ?? []).forEach((a) => {
    mapa.set(a.date, a.finalized ? "finalizada" : "en_progreso");
  });
  return mapa;
}
