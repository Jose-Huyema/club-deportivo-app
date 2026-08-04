import { notFound } from "next/navigation";
import { getAlumnoDetalle } from "@/lib/data/alumnos";
import { getCategorias } from "@/lib/data/admin";
import { requireProfile } from "@/lib/data/profile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActivoToggle } from "./ActivoToggle";
import { CategoriasEditor } from "./CategoriasEditor";

const TONE_POR_ESTADO: Record<string, "success" | "danger" | "warning"> = {
  presente: "success",
  ausente: "danger",
  justificado: "warning",
};

export default async function AlumnoDetallePage({ params }: { params: { studentId: string } }) {
  const [alumno, categorias, profile] = await Promise.all([
    getAlumnoDetalle(params.studentId),
    getCategorias(),
    requireProfile(),
  ]);

  if (!alumno) notFound();
  const esAdmin = profile.role === "admin";

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-primary">{alumno.full_name}</h1>
          <p className="text-sm text-slate-500">
            {alumno.categorias.length > 0 ? alumno.categorias.join(", ") : "Sin categoría asignada"}
          </p>
        </div>
        {esAdmin ? (
          <ActivoToggle studentId={alumno.id} isActive={alumno.is_active} />
        ) : (
          !alumno.is_active && <Badge tone="neutral">Inactivo</Badge>
        )}
      </div>

      <Card className="mb-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Contacto de emergencia</span>
          <span className="font-medium text-slate-900">{alumno.emergency_phone}</span>
        </div>
        {alumno.tutor_name && (
          <div className="flex justify-between">
            <span className="text-slate-500">Tutor/a</span>
            <span className="font-medium text-slate-900">{alumno.tutor_name}</span>
          </div>
        )}
        {alumno.birth_date && (
          <div className="flex justify-between">
            <span className="text-slate-500">Fecha de nacimiento</span>
            <span className="font-medium text-slate-900">{alumno.birth_date}</span>
          </div>
        )}
        {alumno.medical_notes && (
          <div className="border-t border-slate-100 pt-2">
            <span className="block text-slate-500">Notas médicas</span>
            <span className="font-medium text-slate-900">{alumno.medical_notes}</span>
          </div>
        )}
      </Card>

      {esAdmin && categorias.length > 0 && (
        <Card className="mb-4">
          <p className="mb-2 text-sm font-semibold text-slate-700">Categorías inscriptas</p>
          <CategoriasEditor
            studentId={alumno.id}
            categorias={categorias}
            categoriaIdsIniciales={alumno.categoria_ids}
          />
        </Card>
      )}

      <h2 className="mb-2 text-sm font-semibold text-slate-700">Historial de asistencia</h2>
      {alumno.historial.length === 0 ? (
        <EmptyState title="Todavía no hay registros de asistencia" />
      ) : (
        <div className="space-y-2">
          {alumno.historial.map((h, i) => (
            <Card key={i} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-900">{h.category_name}</p>
                <p className="text-xs text-slate-500">{h.date}</p>
              </div>
              <Badge tone={TONE_POR_ESTADO[h.status] ?? "neutral"}>{h.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
