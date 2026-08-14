import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEditor } from "@/lib/data/profile";

export async function GET(
  request: Request,
  { params }: { params: { studentId: string; docId: string } }
) {
  await requireEditor();

  const supabase = createClient();
  const { data: doc } = await supabase
    .from("student_documents")
    .select("file_path")
    .eq("id", params.docId)
    .eq("student_id", params.studentId)
    .single();

  if (!doc) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("documentos-alumnos")
    .createSignedUrl(doc.file_path, 60);

  if (error || !data) return NextResponse.json({ error: "No se pudo generar el link" }, { status: 500 });

  return NextResponse.redirect(data.signedUrl);
}
