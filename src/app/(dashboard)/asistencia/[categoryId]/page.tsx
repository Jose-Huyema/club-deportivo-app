import { notFound } from "next/navigation";
import { getAlumnosParaAsistencia } from "@/lib/data/asistencia";
import { EmptyState } from "@/components/ui/EmptyState";
import { AttendanceForm } from "./AttendanceForm";

export default async function TomarAsistenciaPage({
  params,
}: {
  params: { categoryId: string };
}) {
  const { categoryName, alumnos } = await getAlumnosParaAsistencia(params.categoryId);

  if (!categoryName) notFound();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary">{categoryName}</h1>
      <p className="mb-5 text-sm text-slate-500">
        Tocá el nombre de cada alumno para cambiar su estado. Por defecto está presente.
      </p>

      {alumnos.length === 0 ? (
        <EmptyState
          title="No hay alumnos inscriptos"
          description="Inscribí alumnos en esta categoría desde el panel de Admin para poder pasar asistencia."
        />
      ) : (
        <AttendanceForm categoryId={params.categoryId} alumnosIniciales={alumnos} />
      )}
    </div>
  );
}
