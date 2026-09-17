"use server";

import { createClient } from "@/lib/supabase/server";

export type BusquedaAlumno = {
  id: string;
  full_name: string;
  dni: string | null;
  is_active: boolean;
  categorias: string[];
};

export async function buscarAlumnosGlobal(term: string) {
  const value = term.trim();
  if (value.length < 2) return { data: [] as BusquedaAlumno[], error: null };

  const supabase = createClient();
  const { data, error } = await supabase.rpc("buscar_alumnos_global", {
    p_term: value,
    p_limit: 8,
  });

  if (error) {
    if (error.message.includes("NO_AUTORIZADO")) {
      return { data: [] as BusquedaAlumno[], error: "No autorizado." };
    }
    return { data: [] as BusquedaAlumno[], error: "No se pudo realizar la búsqueda." };
  }

  return {
    error: null,
    data: (data ?? []) as BusquedaAlumno[],
  };
}
