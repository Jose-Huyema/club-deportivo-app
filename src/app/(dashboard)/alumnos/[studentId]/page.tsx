import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarCheck2, CreditCard, FileText, LogIn, Pencil } from "lucide-react";
import { getAlumnoDetalle } from "@/lib/data/alumnos";
import { getCategorias } from "@/lib/data/admin";
import { requireProfile, puedeEditar } from "@/lib/data/profile";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { EmptyState } from "@/components/ui";
import { ActivoToggle, CategoriasEditor } from "./AlumnoDetalleClient";

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
  const puedeEditarAlumno = puedeEditar(profile.role);

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary dark:text-white">{alumno.full_name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {alumno.categorias.length > 0 ? alumno.categorias.join(", ") : "Sin categoría asignada"}
          </p>
        </div>
        {puedeEditarAlumno ? (
          <ActivoToggle studentId={alumno.id} isActive={alumno.is_active} />
        ) : (
          !alumno.is_active && <Badge tone="neutral">Inactivo</Badge>
        )}
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <Link href={`/alumnos/${alumno.id}/carnet`}>
          <Button variant="secondary" className="w-full">
            <CreditCard className="h-4 w-4" />
            Carnet
          </Button>
        </Link>
        {puedeEditarAlumno && (
          <>
            <Link href={`/documentos/${alumno.id}`}>
              <Button variant="secondary" className="w-full">
                <FileText className="h-4 w-4" />
                Documentos
              </Button>
            </Link>
            <Link href={`/alumnos/${alumno.id}/editar`}>
              <Button variant="secondary" className="w-full">
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            </Link>
          </>
        )}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Categorías</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{alumno.categorias.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">inscripciones activas visibles</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Documentos</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{alumno.documentos_cantidad}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">archivos cargados</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Último ingreso</p>
          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
            {alumno.ultimos_ingresos[0]
              ? new Date(alumno.ultimos_ingresos[0].checked_in_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })
              : "Sin registros"}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">control de acceso</p>
        </Card>
      </div>

      <Card className="mb-4 space-y-2 text-sm">
        {alumno.dni && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">DNI</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.dni}</span>
          </div>
        )}
        {alumno.birth_date && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Fecha de nacimiento</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.birth_date}</span>
          </div>
        )}
        {alumno.address && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Dirección</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.address}</span>
          </div>
        )}
        {alumno.phone && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Teléfono personal</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.phone}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Contacto de emergencia</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.emergency_phone}</span>
        </div>
        {alumno.tutor_name && (
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Tutor/a</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.tutor_name}</span>
          </div>
        )}
        {alumno.medical_notes && (
          <div className="border-t border-slate-100 pt-2 dark:border-slate-700">
            <span className="block text-slate-500 dark:text-slate-400">Notas médicas</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.medical_notes}</span>
          </div>
        )}
      </Card>

      {(alumno.height_cm || alumno.weight_kg || alumno.clothing_size) && (
        <Card className="mb-4">
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Medidas</p>
          <div className="flex gap-4 text-sm">
            {alumno.height_cm && (
              <div><span className="block text-slate-500 dark:text-slate-400">Altura</span><span className="font-medium text-slate-900 dark:text-slate-100">{alumno.height_cm} cm</span></div>
            )}
            {alumno.weight_kg && (
              <div><span className="block text-slate-500 dark:text-slate-400">Peso</span><span className="font-medium text-slate-900 dark:text-slate-100">{alumno.weight_kg} kg</span></div>
            )}
            {alumno.clothing_size && (
              <div><span className="block text-slate-500 dark:text-slate-400">Talle</span><span className="font-medium text-slate-900 dark:text-slate-100">{alumno.clothing_size}</span></div>
            )}
          </div>
        </Card>
      )}

      {puedeEditarAlumno && categorias.length > 0 && (
        <Card className="mb-4">
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Categorías inscriptas</p>
          <CategoriasEditor studentId={alumno.id} categorias={categorias} categoriaIdsIniciales={alumno.categoria_ids} />
        </Card>
      )}

      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        <Link href={`/documentos/${alumno.id}`} className="rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"><FileText className="h-4 w-4" /> Documentación</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ver y cargar archivos</p>
        </Link>
        <Link href="/asistencia" className="rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"><CalendarCheck2 className="h-4 w-4" /> Asistencia</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ir al módulo de asistencia</p>
        </Link>
        <Link href="/ingreso" className="rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100"><LogIn className="h-4 w-4" /> Control de ingreso</div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Registrar un nuevo ingreso</p>
        </Link>
      </div>

      <Card className="mb-5">
        <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Últimos ingresos</p>
        {alumno.ultimos_ingresos.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Todavía no hay registros de ingreso.</p>
        ) : (
          <div className="space-y-2">
            {alumno.ultimos_ingresos.map((i, index) => (
              <div key={`${i.checked_in_at}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                <span className="font-medium text-slate-800 dark:text-slate-100">{new Date(i.checked_in_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}</span>
                <Badge tone="neutral">{i.method}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Historial de asistencia</h2>
      {alumno.historial.length === 0 ? (
        <EmptyState title="Todavía no hay registros de asistencia" />
      ) : (
        <div className="space-y-2">
          {alumno.historial.map((h, i) => (
            <Card key={i} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{h.category_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{h.date}</p>
              </div>
              <Badge tone={TONE_POR_ESTADO[h.status] ?? "neutral"}>{h.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
