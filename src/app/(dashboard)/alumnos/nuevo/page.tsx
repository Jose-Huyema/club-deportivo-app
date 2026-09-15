import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireEditor } from "@/lib/data/profile";
import { getCategorias, getDisciplinas } from "@/lib/data/admin";
import { NuevoAlumnoForm } from "./NuevoAlumnoForm";

export default async function NuevoAlumnoPage() {
  await requireEditor();
  const [categorias, disciplinas] = await Promise.all([getCategorias(), getDisciplinas()]);

  return (
    <div>
      <Link href="/alumnos" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver a alumnos
      </Link>
      <h1 className="mb-5 text-xl font-bold text-primary">Nuevo alumno</h1>
      <NuevoAlumnoForm categorias={categorias} disciplinas={disciplinas} />
    </div>
  );
}
