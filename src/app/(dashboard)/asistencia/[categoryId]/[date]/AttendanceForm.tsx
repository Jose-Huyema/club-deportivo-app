"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, X, FileText, Lock, Unlock, Search, Users, Save } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import type { AlumnoParaAsistencia } from "@/lib/data/asistencia";
import { finalizarAsistencia, reabrirAsistencia } from "./actions";

type Status = "presente" | "ausente" | "justificado";
const ORDEN: Status[] = ["presente", "ausente", "justificado"];

const ESTILO: Record<Status, { label: string; classes: string; icon: typeof Check }> = {
  presente: { label: "Presente", classes: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Check },
  ausente: { label: "Ausente", classes: "bg-red-100 text-red-800 border-red-200", icon: X },
  justificado: { label: "Justificado", classes: "bg-amber-100 text-amber-800 border-amber-200", icon: FileText },
};

export function AttendanceForm({
  categoryId, date, alumnosIniciales, finalizadaInicial, attendanceId, esAdmin,
}: {
  categoryId: string; date: string; alumnosIniciales: AlumnoParaAsistencia[];
  finalizadaInicial: boolean; attendanceId: string | null; esAdmin: boolean;
}) {
  const router = useRouter();
  const [alumnos, setAlumnos] = useState(alumnosIniciales);
  const [finalizada, setFinalizada] = useState(finalizadaInicial);
  const [isPending, startTransition] = useTransition();
  const [busqueda, setBusqueda] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const soloLectura = finalizada;
  const presentes = alumnos.filter((a) => a.status === "presente").length;
  const ausentes = alumnos.filter((a) => a.status === "ausente").length;
  const justificados = alumnos.filter((a) => a.status === "justificado").length;
  const porcentaje = alumnos.length ? Math.round((presentes / alumnos.length) * 100) : 0;

  const alumnosVisibles = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase();
    if (!q) return alumnos;
    return alumnos.filter((a) => a.full_name.toLocaleLowerCase().includes(q) || (a.dni ?? "").includes(q));
  }, [alumnos, busqueda]);

  function ciclarEstado(studentId: string) {
    if (soloLectura) return;
    setFeedback(null);
    setAlumnos((prev) => prev.map((a) => a.student_id !== studentId ? a : { ...a, status: ORDEN[(ORDEN.indexOf(a.status) + 1) % ORDEN.length] }));
  }

  function marcarTodosPresentes() {
    if (soloLectura) return;
    setFeedback(null);
    setAlumnos((prev) => prev.map((a) => ({ ...a, status: "presente" })));
  }

  function limpiarEstados() {
    if (soloLectura) return;
    setFeedback(null);
    setAlumnos((prev) => prev.map((a) => ({ ...a, status: "ausente" })));
  }

  function handleFinalizar() {
    setFeedback(null);
    startTransition(async () => {
      const result = await finalizarAsistencia(categoryId, date, alumnos.map((a) => ({ student_id: a.student_id, status: a.status })));
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
        return;
      }
      setFinalizada(true);
      setFeedback({ type: "success", message: "✓ Asistencia guardada y finalizada" });
    });
  }

  function handleReabrir() {
    if (!attendanceId) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await reabrirAsistencia(attendanceId, categoryId, date);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
        return;
      }
      setFinalizada(false);
      setFeedback({ type: "success", message: "✓ Asistencia reabierta" });
    });
  }

  return (
    <div>
      {finalizada && (
        <Card className="mb-4 flex items-center justify-between border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300"><Lock className="h-4 w-4" /> Asistencia finalizada — solo lectura</span>
          {esAdmin && <Button variant="secondary" onClick={handleReabrir} loading={isPending}><Unlock className="h-4 w-4" /> Reabrir</Button>}
        </Card>
      )}

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{presentes} de {alumnos.length} presentes</p>
            <div className="mt-2 h-2 w-64 max-w-full overflow-hidden rounded-full bg-slate-200" aria-label={`${porcentaje}% de asistencia`}>
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${porcentaje}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{porcentaje}% · {ausentes} ausentes · {justificados} justificados</p>
          </div>
          {!soloLectura && (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={marcarTodosPresentes} disabled={isPending}><Check className="h-4 w-4" /> Todos presentes</Button>
              <Button variant="secondary" onClick={limpiarEstados} disabled={isPending}>Todos ausentes</Button>
            </div>
          )}
        </div>
      </Card>

      {!soloLectura && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar alumno por nombre o DNI..." className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </div>
      )}

      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {alumnosVisibles.length} alumno{alumnosVisibles.length === 1 ? "" : "s"}</span>
        {busqueda && <span>Filtro: “{busqueda}”</span>}
      </div>

      <div className="space-y-2">
        {alumnosVisibles.map((a) => {
          const estilo = ESTILO[a.status];
          const Icon = estilo.icon;
          return (
            <button key={a.student_id} type="button" onClick={() => ciclarEstado(a.student_id)} disabled={soloLectura} className="w-full text-left disabled:cursor-default">
              <Card className={clsx("flex min-h-14 items-center justify-between border py-3 transition-colors active:scale-[0.995]", estilo.classes)}>
                <span className="font-medium text-slate-900">{a.full_name}<span className="ml-2 text-xs font-normal text-slate-500">{a.dni ?? ""}</span></span>
                <span className="flex items-center gap-1.5 text-sm font-semibold"><Icon className="h-4 w-4" />{estilo.label}</span>
              </Card>
            </button>
          );
        })}
        {alumnosVisibles.length === 0 && <Card className="py-8 text-center text-sm text-slate-500">No se encontraron alumnos.</Card>}
      </div>

      {feedback && <p className={clsx("mt-4 text-sm font-medium", feedback.type === "success" ? "text-emerald-700" : "text-red-600")} role="status" aria-live="polite">{feedback.message}</p>}

      {!soloLectura && (
        <Button className="mt-5 w-full" onClick={handleFinalizar} loading={isPending}><Save className="h-4 w-4" /> Guardar y finalizar asistencia</Button>
      )}
      {soloLectura && feedback?.type !== "success" && <Badge tone="success" className="mt-4">Asistencia guardada</Badge>}
    </div>
  );
}
