"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { AlumnoParaAsistencia } from "@/lib/data/asistencia";
import { guardarAsistencia } from "./actions";

type Status = "presente" | "ausente" | "justificado";
const ORDEN: Status[] = ["presente", "ausente", "justificado"];

const ESTILO: Record<Status, { label: string; classes: string; icon: typeof Check }> = {
  presente: { label: "Presente", classes: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Check },
  ausente: { label: "Ausente", classes: "bg-red-100 text-red-800 border-red-200", icon: X },
  justificado: { label: "Justificado", classes: "bg-amber-100 text-amber-800 border-amber-200", icon: FileText },
};

export function AttendanceForm({
  categoryId,
  alumnosIniciales,
}: {
  categoryId: string;
  alumnosIniciales: AlumnoParaAsistencia[];
}) {
  const router = useRouter();
  const [alumnos, setAlumnos] = useState(alumnosIniciales);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function ciclarEstado(studentId: string) {
    setAlumnos((prev) =>
      prev.map((a) => {
        if (a.student_id !== studentId) return a;
        const siguiente = ORDEN[(ORDEN.indexOf(a.status) + 1) % ORDEN.length];
        return { ...a, status: siguiente };
      })
    );
  }

  function handleGuardar() {
    setFeedback(null);
    startTransition(async () => {
      const result = await guardarAsistencia(
        categoryId,
        alumnos.map((a) => ({ student_id: a.student_id, status: a.status }))
      );
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: "Asistencia guardada." });
        router.refresh();
      }
    });
  }

  const presentes = alumnos.filter((a) => a.status === "presente").length;

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-slate-600">
        {presentes} de {alumnos.length} presentes
      </p>

      <div className="space-y-2">
        {alumnos.map((a) => {
          const estilo = ESTILO[a.status];
          const Icon = estilo.icon;
          return (
            <button
              key={a.student_id}
              type="button"
              onClick={() => ciclarEstado(a.student_id)}
              className="w-full text-left"
            >
              <Card
                className={clsx(
                  "flex items-center justify-between border py-3 transition-colors",
                  estilo.classes
                )}
              >
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
        <p
          className={clsx(
            "mt-4 text-sm font-medium",
            feedback.type === "success" ? "text-emerald-700" : "text-red-600"
          )}
          role="status"
        >
          {feedback.message}
        </p>
      )}

      <Button className="mt-5 w-full" onClick={handleGuardar} loading={isPending}>
        Guardar asistencia
      </Button>
    </div>
  );
}
