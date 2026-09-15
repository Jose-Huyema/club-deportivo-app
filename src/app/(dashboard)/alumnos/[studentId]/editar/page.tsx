import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireEditor } from "@/lib/data/profile";
import { getAlumnoDetalle } from "@/lib/data/alumnos";
import { EditarAlumnoForm } from "./EditarAlumnoForm";

export default async function EditarAlumnoPage({ params }: { params: { studentId: string } }) {
  await requireEditor();
  const alumno = await getAlumnoDetalle(params.studentId);
  if (!alumno) notFound();

  return (
    <div>
      <Link href={`/alumnos/${alumno.id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver a la ficha
      </Link>
      <h1 className="mb-5 font-display text-2xl font-bold tracking-tight text-primary dark:text-white">Editar a {alumno.full_name}</h1>
      <EditarAlumnoForm alumno={alumno} />
    </div>
  );
}
