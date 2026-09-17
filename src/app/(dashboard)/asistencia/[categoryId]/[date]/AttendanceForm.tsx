"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { Check, X, FileText, Lock, Unlock, Search, Users, RotateCcw } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import type { AlumnoParaAsistencia } from "@/lib/data/asistencia";
import { guardarAsistencia, finalizarAsistencia, reabrirAsistencia } from "./actions";

type Status = "presente" | "ausente" | "justificado";
const ORDEN: Status[] = ["presente", "ausente", "justificado"];
const ESTILO: Record<Status, { label: string; classes: string; icon: typeof Check }> = {
  presente: { label: "Presente", classes: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Check },
  ausente: { label: "Ausente", classes: "bg-red-100 text-red-800 border-red-200", icon: X },
  justificado: { label: "Justificado", classes: "bg-amber-100 text-amber-800 border-amber-200", icon: FileText },
};

export function AttendanceForm({ categoryId, date, alumnosIniciales, finalizadaInicial, attendanceId, esAdmin }: {
  categoryId: string; date: string; alumnosIniciales: AlumnoParaAsistencia[]; finalizadaInicial: boolean; attendanceId: string | null; esAdmin: boolean;
}) {
  const [alumnos, setAlumnos] = useState(alumnosIniciales);
  const [finalizada, setFinalizada] = useState(finalizadaInicial);
  const [busqueda, setBusqueda] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase();
    if (!q) return alumnos;
    return alumnos.filter((a) => a.full_name.toLocaleLowerCase().includes(q) || (a.dni ?? "").toLocaleLowerCase().includes(q));
  }, [alumnos, busqueda]);

  const presentes = alumnos.filter(a => a.status === "presente").length;
  const ausentes = alumnos.filter(a => a.status === "ausente").length;
  const justificados = alumnos.filter(a => a.status === "justificado").length;
  const porcentaje = alumnos.length ? Math.round((presentes / alumnos.length) * 100) : 0;

  useEffect(() => {
    if (!dirty || finalizada) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty, finalizada]);

  function setTodos(status: Status) {
    if (finalizada) return;
    setFeedback(null);
    setAlumnos(prev => prev.map(a => ({ ...a, status })));\n    setDirty(true);
  }

  function ciclarEstado(studentId: string) {
    if (finalizada) return;
    setFeedback(null);
    setAlumnos(prev => prev.map(a => {
      if (a.student_id !== studentId) return a;
      return { ...a, status: ORDEN[(ORDEN.indexOf(a.status) + 1) % ORDEN.length] };
    }));
    setDirty(true);
  }

  function guardar(finalizar: boolean) {
    setFeedback(null);
    startTransition(async () => {
      const result = finalizar
        ? await finalizarAsistencia(categoryId, date, alumnos.map(a => ({ student_id: a.student_id, status: a.status })))
        : await guardarAsistencia(categoryId, date, alumnos.map(a => ({ student_id: a.student_id, status: a.status })));
      if (result.error) setFeedback({ type: "error", message: result.error });
      else {
        if (finalizar) setFinalizada(true);
        setDirty(false);
        setFeedback({ type: "success", message: finalizar ? "✓ Asistencia finalizada y guardada" : "✓ Asistencia guardada" });
      }
    });
  }

  function reabrir() {
    if (!attendanceId) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await reabrirAsistencia(attendanceId, categoryId, date);
      if (result.error) setFeedback({ type: "error", message: result.error });
      else { setFinalizada(false); setDirty(false); setFeedback({ type: "success", message: "✓ Asistencia reabierta" }); }
    });
  }

  return <div>
    {finalizada && <Card className="mb-4 flex items-center justify-between border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
      <span className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300"><Lock className="h-4 w-4" /> Asistencia finalizada — solo lectura</span>
      {esAdmin && <Button variant="secondary" onClick={reabrir} loading={isPending}><Unlock className="h-4 w-4" /> Reabrir</Button>}
    </Card>}

    <Card className="mb-4 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><strong>{presentes} / {alumnos.length} presentes</strong></div>
        <Badge tone={porcentaje >= 75 ? "success" : "warning"}>{porcentaje}%</Badge>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${porcentaje}%` }} /></div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
        <div><strong className="text-emerald-700">{presentes}</strong><div>Presentes</div></div>
        <div><strong className="text-red-700">{ausentes}</strong><div>Ausentes</div></div>
        <div><strong className="text-amber-700">{justificados}</strong><div>Justificados</div></div>
      </div>
    </Card>

    {!finalizada && <>
      <div className="sticky top-0 z-10 -mx-1 mb-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Button onClick={() => setTodos("presente")}><Check className="h-4 w-4" /> Todos presentes</Button>
          <Button variant="secondary" onClick={() => setTodos("ausente")}><X className="h-4 w-4" /> Todos ausentes</Button>
          <Button variant="secondary" onClick={() => setTodos("justificado")}><FileText className="h-4 w-4" /> Todos justificados</Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar alumno por nombre o DNI..." aria-label="Buscar alumno por nombre o DNI" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800" />
          {busqueda && <button type="button" onClick={() => setBusqueda("")} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">×</button>}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {busqueda ? `Mostrando ${filtrados.length} de ${alumnos.length} alumnos` : `${alumnos.length} alumnos`}
          {dirty && <span className="ml-2 font-medium text-amber-600">• cambios sin guardar</span>}
        </div>
      </div>
    </>}

    {finalizada && <div className="mb-4 flex items-center justify-between text-sm text-slate-500"><span>{alumnos.length} alumnos</span><span>Solo lectura</span></div>}

    <div className="space-y-2">
      {filtrados.map(a => { const estilo = ESTILO[a.status]; const Icon = estilo.icon; return <button key={a.student_id} type="button" onClick={() => ciclarEstado(a.student_id)} disabled={finalizada} className="w-full text-left disabled:cursor-default">
        <Card className={clsx("flex items-center justify-between border py-3 transition-colors", estilo.classes)}>
          <span><span className="block font-medium text-slate-900">{a.full_name}</span>{a.dni && <span className="text-xs opacity-70">DNI: {a.dni}</span>}</span>
          <span className="flex items-center gap-1.5 text-sm font-semibold"><Icon className="h-4 w-4" />{estilo.label}</span>
        </Card>
      </button>; })}
      {filtrados.length === 0 && <Card className="py-8 text-center text-sm text-slate-500">No encontramos alumnos con “{busqueda}”.</Card>}
    </div>

    {feedback && <p className={clsx("mt-4 text-sm font-medium", feedback.type === "success" ? "text-emerald-700" : "text-red-600")} role="status">{feedback.message}</p>}

    {!finalizada && <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <Button variant="secondary" onClick={() => guardar(false)} loading={isPending}><RotateCcw className="h-4 w-4" /> Guardar</Button>
      <Button onClick={() => guardar(true)} loading={isPending}><Lock className="h-4 w-4" /> Guardar y finalizar</Button>
    </div>}
  </div>;
}
