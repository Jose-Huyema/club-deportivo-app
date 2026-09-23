import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarCheck2, CreditCard, FileText, LogIn, Pencil, UserRound, Paperclip, CheckCircle2 } from "lucide-react";
import { getAlumnoDetalle } from "@/lib/data/alumnos";
import { getCategorias } from "@/lib/data/admin";
import { getEstadoFinancieroAlumno } from "@/lib/data/cuotas";
import { requireProfile, puedeEditar } from "@/lib/data/profile";
import { Card } from "@/components/ui";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
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
  const mostrarFinanzas = profile.role === "admin" || profile.role === "operador";
  const finanzas = mostrarFinanzas ? await getEstadoFinancieroAlumno(params.studentId) : null;

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary dark:text-white">
            {alumno.full_name}
          </h1>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {alumno.categorias.length > 0 ? alumno.categorias.join(", ") : "Sin categoría asignada"}
          </p>
        </div>
        {puedeEditarAlumno ? (
          <ActivoToggle studentId={alumno.id} isActive={alumno.is_active} />
        ) : (
          !alumno.is_active && <Badge tone="neutral">Inactivo</Badge>
        )}
      </div>

      {mostrarFinanzas && finanzas && (
        <Card className="mb-4 border-accent/30 bg-accent/5 dark:bg-accent/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Plan / estado económico</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{finanzas.plan?.name ?? "Sin plan asignado"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{finanzas.plan?.is_free ? "Plan gratuito / comunitario" : "Gestión de cuotas habilitada"}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Saldo pendiente</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(finanzas.balance)}</p>
              </div>
              <a href="/cuotas" className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90">Gestionar</a>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Link href={`/alumnos/${alumno.id}/carnet`}>
          <Button variant="secondary" className="w-full">
            <CreditCard className="h-4 w-4" />
            Carnet
          </Button>
        </Link>
        <Link href="/ingreso">
          <Button variant="secondary" className="w-full">
            <LogIn className="h-4 w-4" />
            Ingreso
          </Button>
        </Link>
        {puedeEditarAlumno ? (
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
        ) : (
          <Link href="/asistencia">
            <Button variant="secondary" className="w-full">
              <CalendarCheck2 className="h-4 w-4" />
              Asistencia
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Asistencia</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{alumno.asistencia_resumen.porcentaje}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{alumno.asistencia_resumen.presentes} presentes · {alumno.asistencia_resumen.ausentes} ausentes</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Categorías</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{alumno.categorias.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">inscripciones activas</p>
            </div>
            <UserRound className="h-5 w-5 text-accent" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Documentos</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{alumno.documentos_cantidad}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">archivos cargados</p>
            </div>
            <Paperclip className="h-5 w-5 text-accent" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Último ingreso</p>
              <p className="mt-1 truncate text-lg font-bold text-slate-900 dark:text-white">
                {alumno.ultimos_ingresos[0]
                  ? new Date(alumno.ultimos_ingresos[0].checked_in_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })
                  : "Sin registros"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">control de acceso</p>
            </div>
            <LogIn className="h-5 w-5 text-accent" />
          </div>
        </Card>
      </div>

      <Card className="mb-4 text-sm">
        <CollapsibleSection title="Datos personales" defaultOpen>
          <div className="space-y-2">
            {alumno.dni && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">DNI</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.dni}</span>
              </div>
            )}
            {alumno.birth_date && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Fecha de nacimiento</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.birth_date}</span>
              </div>
            )}
            {alumno.address && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Dirección</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.address}</span>
              </div>
            )}
            {alumno.phone && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500 dark:text-slate-400">Teléfono personal</span>
                <a href={`tel:${alumno.phone}`} className="font-medium text-accent hover:underline">
                  {alumno.phone}
                </a>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 dark:text-slate-400">Contacto de emergencia</span>
              <a href={`tel:${alumno.emergency_phone}`} className="font-medium text-accent hover:underline">
                {alumno.emergency_phone}
              </a>
            </div>
            {alumno.tutor_name && (
              <div className="flex justify-between gap-4">
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
          </div>
        </CollapsibleSection>
      </Card>

      {(alumno.height_cm || alumno.weight_kg || alumno.clothing_size) && (
        <Card className="mb-4">
          <CollapsibleSection title="Medidas">
            <div className="flex gap-4 text-sm">
              {alumno.height_cm && (
                <div>
                  <span className="block text-slate-500 dark:text-slate-400">Altura</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.height_cm} cm</span>
                </div>
              )}
              {alumno.weight_kg && (
                <div>
                  <span className="block text-slate-500 dark:text-slate-400">Peso</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.weight_kg} kg</span>
                </div>
              )}
              {alumno.clothing_size && (
                <div>
                  <span className="block text-slate-500 dark:text-slate-400">Talle</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{alumno.clothing_size}</span>
                </div>
              )}
            </div>
          </CollapsibleSection>
        </Card>
      )}

      {puedeEditarAlumno && categorias.length > 0 && (
        <Card className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Categorías inscriptas</p>
            <span className="text-xs text-slate-500">{alumno.categorias.length} activas</span>
          </div>
          <CategoriasEditor studentId={alumno.id} categorias={categorias} categoriaIdsIniciales={alumno.categoria_ids} />
        </Card>
      )}

      <Card className="mb-4">
        <CollapsibleSection title="Documentación" defaultOpen={alumno.documentos_recientes.length > 0}>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Documentos recientes</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{alumno.documentos_cantidad} archivo(s) registrados</p>
              </div>
              <Link href={`/documentos/${alumno.id}`} className="text-xs font-semibold text-accent hover:underline">Gestionar documentos</Link>
            </div>
            {alumno.documentos_recientes.length === 0 ? (
              <EmptyState title="Todavía no hay documentos cargados" />
            ) : (
              <div className="space-y-2">
                {alumno.documentos_recientes.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800 dark:text-slate-100">{d.file_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{d.tipo} · {new Date(d.created_at).toLocaleDateString("es-AR")}</p>
                    </div>
                    <Link href={`/documentos/${alumno.id}`} className="shrink-0 text-xs font-semibold text-accent hover:underline">Ver</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleSection>
      </Card>

      <Card className="mb-4">
        <CollapsibleSection title="Actividad" defaultOpen>
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Últimos ingresos</p>
                <Link href="/ingreso" className="text-xs font-semibold text-accent hover:underline">Nuevo ingreso</Link>
              </div>
              {alumno.ultimos_ingresos.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Todavía no hay registros de ingreso.</p>
              ) : (
                <div className="space-y-2">
                  {alumno.ultimos_ingresos.map((i, index) => (
                    <div key={`${i.checked_in_at}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {new Date(i.checked_in_at).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                      <Badge tone="neutral">{i.method}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Historial de asistencia</p>
                <Link href="/asistencia" className="text-xs font-semibold text-accent hover:underline">Abrir asistencia</Link>
              </div>
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
          </div>
        </CollapsibleSection>
      </Card>
    </div>
  );
}
