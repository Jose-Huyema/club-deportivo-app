import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDocumentosDeAlumno } from "@/lib/data/documentos";
import { createClient } from "@/lib/supabase/server";
import { UploadDocumentoForm } from "./UploadDocumentoForm";
import { DocumentoRow } from "./DocumentoRow";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function DocumentosAlumnoPage({ params }: { params: { studentId: string } }) {
  const supabase = createClient();
  const { data: alumno } = await supabase
    .from("students")
    .select("full_name")
    .eq("id", params.studentId)
    .single();

  if (!alumno) notFound();

  const documentos = await getDocumentosDeAlumno(params.studentId);

  return (
    <div>
      <Link href="/documentos" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver a documentos
      </Link>
      <h1 className="mb-5 text-xl font-bold text-primary dark:text-white">{alumno.full_name}</h1>

      <UploadDocumentoForm studentId={params.studentId} />

      <h2 className="mb-2 mt-6 text-sm font-semibold text-slate-700 dark:text-slate-300">Archivos cargados</h2>
      {documentos.length === 0 ? (
        <EmptyState title="Todavía no hay documentos para este alumno" />
      ) : (
        <div className="space-y-2">
          {documentos.map((d) => (
            <DocumentoRow key={d.id} documento={d} studentId={params.studentId} />
          ))}
        </div>
      )}
    </div>
  );
}
