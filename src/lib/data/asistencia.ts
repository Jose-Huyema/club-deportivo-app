import { createClient } from "@/lib/supabase/server";

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
  role: "admin" | "profe"
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
    .eq("date", today);

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
  status: "presente" | "ausente" | "justificado";
};

/**
 * Alumnos activos inscriptos en la categoría, con el estado de asistencia
 * de hoy si ya existe (para poder editar), o "presente" por defecto.
 */
export async function getAlumnosParaAsistencia(
  categoryId: string
): Promise<{
  categoryName: string;
  attendanceId: string | null;
  alumnos: AlumnoParaAsistencia[];
}> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: categoria } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  const { data: inscripciones } = await supabase
    .from("enrollments")
    .select("student_id, students!inner(id, full_name, is_active)")
    .eq("category_id", categoryId)
    .eq("students.is_active", true);

  const { data: attendance } = await supabase
    .from("attendances")
    .select("id")
    .eq("category_id", categoryId)
    .eq("date", today)
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
      status: detallesMap.get(i.students.id) ?? "presente",
    }))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  return {
    categoryName: categoria?.name ?? "Categoría",
    attendanceId: attendance?.id ?? null,
    alumnos,
  };
}
