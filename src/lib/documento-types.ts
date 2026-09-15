/**
 * Datos y tipos puros sobre documentos, SIN dependencias de servidor.
 * Separado de lib/data/documentos.ts (que sí usa el cliente de Supabase)
 * para poder importarse desde componentes "use client" sin arrastrar
 * next/headers al bundle del navegador.
 */

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
