import { createClient } from "@/lib/supabase/server";

export const TIPOS_DOCUMENTO = [
  { value: "seguro", label: "Seguro" },
  { value: "foto_dni", label: "Foto de DNI" },
  { value: "autorizacion", label: "Autorización" },
  { value: "comunicado", label: "Comunicado" },
  { value: "otro", label: "Otro" },
] as const;

export type DocumentoAlumno = {
  id: string;
  tipo: string;
  file_name: string;
  file_path: string;
  created_at: string;
  uploaded_by_name: string | null;
};

export async function getDocumentosDeAlumno(studentId: string): Promise<DocumentoAlumno[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("student_documents")
    .select("id, tipo, file_name, file_path, created_at, profiles(full_name)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((d: any) => ({
    id: d.id,
    tipo: d.tipo,
    file_name: d.file_name,
    file_path: d.file_path,
    created_at: d.created_at,
    uploaded_by_name: d.profiles?.full_name ?? null,
  }));
}
