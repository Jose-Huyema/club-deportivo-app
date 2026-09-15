"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, X, FileText, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
  categoryId,
  date,
  alumnosIniciales,
  finalizadaInicial,
  attendanceId,
  esAdmin,
}: {
  categoryId: string;
  date: string;
  alumnosIniciales: AlumnoParaAsistencia[];
  finalizadaInicial: boolean;
  attendanceId: string | null;
  esAdmin: boolean;
}) {
  const router = useRouter();
  const [alumnos, setAlumnos] = useState(alumnosIniciales);
  const [finalizada, setFinalizada] = useState(finalizadaInicial);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const soloLectura = finalizada;

  function ciclarEstado(studentId: string) {
    if (soloLectura) return;
    setAlumnos((prev) =>
      prev.map((a) => {
        if (a.student_id !== studentId) return a;
        const siguiente = ORDEN[(ORDEN.indexOf(a.status) + 1) % ORDEN.length];
        return { ...a, status: siguiente };
      })
    );
  }

  function handleFinalizar() {
    setFeedback(null);
    startTransition(async () => {
      const result = await finalizarAsistencia(
        categoryId,
        date,
        alumnos.map((a) => ({ student_id: a.student_id, status: a.status }))
      );
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFinalizada(true);
        router.refresh();
      }
    });
  }

  function handleReabrir() {
    if (!attendanceId) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await reabrirAsistencia(attendanceId, categoryId, date);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFinalizada(false);
        router.refresh();
      }
    });
  }

  const presentes = alumnos.filter((a) => a.status === "presente").length;

  return (
    <div>
      {finalizada && (
        <Card className="mb-4 flex items-center justify-between border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
          <span className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            <Lock className="h-4 w-4" /> Asistencia finalizada — solo lectura
          </span>
          {esAdmin && (
            <Button variant="secondary" onClick={handleReabrir} loading={isPending}>
              <Unlock className="h-4 w-4" /> Reabrir
            </Button>
          )}
        </Card>
      )}

      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{presentes} de {alumnos.length} presentes</p>
        {finalizada && <Badge tone="success">Finalizada</Badge>}
      </div>

      <div className="space-y-2">
        {alumnos.map((a) => {
          const estilo = ESTILO[a.status];
          const Icon = estilo.icon;
          return (
            <button
              key={a.student_id}
              type="button"
              onClick={() => ciclarEstado(a.student_id)}
              disabled={soloLectura}
              className="w-full text-left disabled:cursor-default"
            >
              <Card className={clsx("flex items-center justify-between border py-3 transition-colors", estilo.classes)}>
                <span className="font-medium text-slate-900">{a.full_name}</span>
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Icon className="h-4 w-4" />
                  {estilo.label}
                </span>
              </Card>
            </button>
          );
        })}
      </div>

      {feedback && (
        <p className={clsx("mt-4 text-sm font-medium", feedback.type === "success" ? "text-emerald-700" : "text-red-600")} role="status">
          {feedback.message}
        </p>
      )}

      {!soloLectura && (
        <Button className="mt-5 w-full" onClick={handleFinalizar} loading={isPending}>
          Finalizar asistencia
        </Button>
      )}
    </div>
  );
}
