"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type IngresoMethod = "qr" | "dni" | "manual";

export type IngresoConfirmacion = {
  id: string;
  full_name: string;
  dni: string | null;
  categorias: string[];
  checked_in_at: string;
  method: IngresoMethod;
};

function errorIngreso(message: string) {
  switch (message) {
    case "NO_AUTORIZADO": return "No tenés permisos para registrar ingresos.";
    case "CODIGO_INVALIDO": return "El código del carnet no es válido.";
    case "ALUMNO_NO_ENCONTRADO": return "No se encontró ningún alumno con ese código.";
    case "ALUMNO_INACTIVO": return "El alumno figura como inactivo.";
    default: return "No se pudo registrar el ingreso. Probá de nuevo.";
  }
}

export async function registrarIngreso(codigo: string, preferredMethod?: IngresoMethod) {
  const supabase = createClient();
  const method: IngresoMethod = preferredMethod ?? (codigo.trim().startsWith("STUDENT:") ? "qr" : "dni");

  const { data, error } = await supabase.rpc("registrar_ingreso_rapido", {
    p_code: codigo,
    p_method: method,
  });

  if (error) {
    const raw = error.message || "";
    const code = raw.includes("NO_AUTORIZADO") ? "NO_AUTORIZADO"
      : raw.includes("CODIGO_INVALIDO") ? "CODIGO_INVALIDO"
      : raw.includes("ALUMNO_NO_ENCONTRADO") ? "ALUMNO_NO_ENCONTRADO"
      : raw.includes("ALUMNO_INACTIVO") ? "ALUMNO_INACTIVO"
      : raw;
    return { error: errorIngreso(code), student: null as IngresoConfirmacion | null, studentName: null as string | null };
  }

  const student = data?.[0];
  if (!student) {
    return { error: "No se pudo confirmar el ingreso.", student: null as IngresoConfirmacion | null, studentName: null as string | null };
  }

  const confirmation: IngresoConfirmacion = {
    id: student.id,
    full_name: student.full_name,
    dni: student.dni ?? null,
    categorias: student.categorias ?? [],
    checked_in_at: student.checked_in_at,
    method: (student.method as IngresoMethod) ?? method,
  };

  revalidatePath("/ingreso");
  revalidatePath("/asistencia/scanner");
  return { error: null, student: confirmation, studentName: confirmation.full_name };
}
