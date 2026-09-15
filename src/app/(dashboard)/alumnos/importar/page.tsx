import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireEditor } from "@/lib/data/profile";
import { ImportarAlumnosForm } from "./ImportarAlumnosForm";

export default async function ImportarAlumnosPage() {
  await requireEditor();

  return (
    <div>
      <Link href="/alumnos" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver a alumnos
      </Link>
      <h1 className="mb-1 text-xl font-bold text-primary">Importar alumnos</h1>
      <p className="mb-5 text-sm text-slate-500">
        Subí un archivo CSV con los alumnos a cargar. Columnas obligatorias: <code className="rounded bg-slate-100 px-1">full_name</code> y{" "}
        <code className="rounded bg-slate-100 px-1">emergency_phone</code>. Opcionales: <code className="rounded bg-slate-100 px-1">dni</code>,{" "}
        <code className="rounded bg-slate-100 px-1">birth_date</code> (formato AAAA-MM-DD), <code className="rounded bg-slate-100 px-1">tutor_name</code>,{" "}
        <code className="rounded bg-slate-100 px-1">medical_notes</code>.
      </p>
      <ImportarAlumnosForm />
    </div>
  );
}
