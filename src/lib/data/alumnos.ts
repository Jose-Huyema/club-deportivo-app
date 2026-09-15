import { createClient } from "@/lib/supabase/server";

export type AlumnoResumen = {
  id: string;
  full_name: string;
  emergency_phone: string;
  is_active: boolean;
  categorias: string[];
};

export async function getAlumnos(): Promise<AlumnoResumen[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, emergency_phone, is_active, enrollments(categories(name))")
    .order("full_name");

  if (error || !data) return [];

  return data.map((s: any) => ({
    id: s.id,
    full_name: s.full_name,
    emergency_phone: s.emergency_phone,
    is_active: s.is_active,
    categorias: (s.enrollments ?? []).map((e: any) => e.categories?.name).filter(Boolean),
  }));
}

export type AlumnoDetalle = {
  id: string;
  full_name: string;
  birth_date: string | null;
  tutor_name: string | null;
  emergency_phone: string;
  phone: string | null;
  medical_notes: string | null;
  is_active: boolean;
  dni: string | null;
  address: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  clothing_size: string | null;
  categoria_ids: string[];
  categorias: string[];
  historial: { date: string; category_name: string; status: string }[];
};

export async function getAlumnoDetalle(studentId: string): Promise<AlumnoDetalle | null> {
  const supabase = createClient();

  const { data: student, error } = await supabase
    .from("students")
    .select(
      "id, full_name, birth_date, tutor_name, emergency_phone, phone, medical_notes, is_active, dni, address, height_cm, weight_kg, clothing_size, enrollments(category_id, categories(name))"
    )
    .eq("id", studentId)
    .single();

  if (error || !student) return null;

  const { data: historialRaw } = await supabase
    .from("attendance_details")
    .select("status, attendances(date, categories(name))")
    .eq("student_id", studentId)
    .order("attendances(date)", { ascending: false })
    .limit(20);

  const historial = (historialRaw ?? []).map((h: any) => ({
    date: h.attendances?.date,
    category_name: h.attendances?.categories?.name ?? "—",
    status: h.status,
  }));

  return {
    id: student.id,
    full_name: student.full_name,
    birth_date: student.birth_date,
    tutor_name: student.tutor_name,
    emergency_phone: student.emergency_phone,
    phone: student.phone,
    medical_notes: student.medical_notes,
    is_active: student.is_active,
    dni: student.dni,
    address: student.address,
    height_cm: student.height_cm,
    weight_kg: student.weight_kg,
    clothing_size: student.clothing_size,
    categoria_ids: (student.enrollments ?? []).map((e: any) => e.category_id).filter(Boolean),
    categorias: (student.enrollments ?? []).map((e: any) => e.categories?.name).filter(Boolean),
    historial,
  };
}
