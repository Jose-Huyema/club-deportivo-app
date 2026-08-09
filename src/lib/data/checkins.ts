import { createClient } from "@/lib/supabase/server";

export type UltimoIngreso = {
  id: string;
  student_name: string;
  checked_in_at: string;
};

export async function getUltimosIngresos(limit = 15): Promise<UltimoIngreso[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("checkins")
    .select("id, checked_in_at, students(full_name)")
    .order("checked_in_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((c: any) => ({
    id: c.id,
    student_name: c.students?.full_name ?? "Alumno",
    checked_in_at: c.checked_in_at,
  }));
}
