"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertEditorAction } from "@/lib/data/profile";
import { revalidatePath } from "next/cache";

const TIPOS_VALIDOS = ["seguro", "foto_dni", "autorizacion", "comunicado", "otro"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function subirDocumento(studentId: string, formData: FormData) {
  const check = await assertEditorAction();
  if ("error" in check) return check;

  const file = formData.get("file") as File | null;
  const tipo = String(formData.get("tipo") || "");

  if (!file || file.size === 0) return { error: "Elegí un archivo." };
  if (file.size > MAX_BYTES) return { error: "El archivo no puede superar los 10 MB." };
  if (!TIPOS_VALIDOS.includes(tipo)) return { error: "Elegí un tipo de documento válido." };

  const admin = createAdminClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `${studentId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage
    .from("documentos-alumnos")
    .upload(path, arrayBuffer, { contentType: file.type || "application/octet-stream" });

  if (uploadError) return { error: "No se pudo subir el archivo. Probá de nuevo." };

  const supabase = createClient();
  const { error: dbError } = await supabase.from("student_documents").insert({
    student_id: studentId,
    tipo,
    file_path: path,
    file_name: file.name,
    uploaded_by: check.userId,
  });

  if (dbError) {
    await admin.storage.from("documentos-alumnos").remove([path]);
    return { error: "No se pudo guardar el documento." };
  }

  revalidatePath(`/documentos/${studentId}`);
  return { error: null };
}

export async function eliminarDocumento(docId: string, studentId: string, filePath: string) {
  const check = await assertEditorAction();
  if ("error" in check) return check;

  const admin = createAdminClient();
  await admin.storage.from("documentos-alumnos").remove([filePath]);

  const supabase = createClient();
  const { error } = await supabase.from("student_documents").delete().eq("id", docId);
  if (error) return { error: "No se pudo eliminar el documento." };

  revalidatePath(`/documentos/${studentId}`);
  return { error: null };
}
