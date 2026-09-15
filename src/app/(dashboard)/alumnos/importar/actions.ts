"use server";

import { createClient } from "@/lib/supabase/server";
import { assertEditorAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

export type FilaImportacion = {
  full_name: string;
  emergency_phone: string;
  dni?: string;
  birth_date?: string;
  tutor_name?: string;
  medical_notes?: string;
};

export async function importarAlumnos(filas: FilaImportacion[]) {
  const check = await assertEditorAction();
  if ("error" in check) return { error: check.error, creados: 0, fallidos: [] as string[] };

  if (filas.length === 0) return { error: "No hay filas para importar.", creados: 0, fallidos: [] };
  if (filas.length > 500) return { error: "Máximo 500 filas por importación.", creados: 0, fallidos: [] };

  const supabase = createClient();
  const fallidos: string[] = [];
  const validas = filas.filter((f) => {
    const ok = f.full_name?.trim() && f.emergency_phone?.trim();
    if (!ok) fallidos.push(f.full_name || "(sin nombre)");
    return ok;
  });

  if (validas.length === 0) {
    return { error: "Ninguna fila tiene nombre y teléfono de emergencia (son obligatorios).", creados: 0, fallidos };
  }

  const rows = validas.map((f) => ({
    full_name: f.full_name.trim(),
    emergency_phone: f.emergency_phone.trim(),
    dni: f.dni?.trim() || null,
    birth_date: f.birth_date?.trim() || null,
    tutor_name: f.tutor_name?.trim() || null,
    medical_notes: f.medical_notes?.trim() || null,
  }));

  const { error, count } = await supabase.from("students").insert(rows, { count: "exact" });

  if (error) {
    return { error: "Falló la importación en la base de datos. Revisá que no haya filas duplicadas o mal formadas.", creados: 0, fallidos };
  }

  revalidatePath("/alumnos");
  return { error: null, creados: count ?? rows.length, fallidos };
}
