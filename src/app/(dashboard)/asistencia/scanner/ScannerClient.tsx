"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { ScannerInput } from "@/components/ui/ScannerInput";
import { registrarIngreso } from "./actions";

type Feedback = { type: "success" | "error"; message: string };

export function ScannerClient() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleScan(codigo: string) {
    setFeedback(null);
    startTransition(async () => {
      const result = await registrarIngreso(codigo);
      if (result.error) {
        setFeedback({ type: "error", message: result.error });
      } else {
        setFeedback({ type: "success", message: `Ingreso registrado: ${result.studentName}` });
      }
    });
  }

  return (
    <div>
      <Card>
        <ScannerInput onScan={handleScan} disabled={isPending} placeholder="Apuntá el lector al carnet…" />
        <p className="mt-2 text-center text-xs text-slate-400">
          Conectá el lector Zebex (u otro compatible) por USB — funciona como un teclado, no hace falta configurar nada más.
        </p>
      </Card>

      {feedback && (
        <p
          className={`mt-3 text-center text-sm font-medium ${
            feedback.type === "success" ? "text-emerald-700" : "text-red-600"
          }`}
          role="status"
        >
          {isPending ? "Procesando…" : feedback.message}
        </p>
      )}
    </div>
  );
}
