import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAlumnosParaAsistencia } from "@/lib/data/asistencia";
import { requireProfile } from "@/lib/data/profile";
import { EmptyState } from "@/components/ui/EmptyState";
import { AttendanceForm } from "./AttendanceForm";

function formatearFecha(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default async function AsistenciaFechaPage({
  params,
}: {
  params: { categoryId: string; date: string };
}) {
  const profile = await requireProfile();
  const { categoryName, attendanceId, finalized, alumnos } = await getAlumnosParaAsistencia(
    params.categoryId,
    params.date
  );

  if (!categoryName) notFound();

  return (
    <div>
      <Link href={`/asistencia/${params.categoryId}`} className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver al calendario
      </Link>
      <h1 className="mb-1 text-xl font-bold text-primary">{categoryName}</h1>
      <p className="mb-5 text-sm capitalize text-slate-500">{formatearFecha(params.date)}</p>

      {alumnos.length === 0 ? (
        <EmptyState
          title="No hay alumnos inscriptos"
          description="Inscribí alumnos en esta categoría desde su ficha para poder pasar asistencia."
        />
      ) : (
        <AttendanceForm
          categoryId={params.categoryId}
          date={params.date}
          alumnosIniciales={alumnos}
          finalizadaInicial={finalized}
          attendanceId={attendanceId}
          esAdmin={profile.role === "admin"}
        />
      )}
    </div>
  );
}
