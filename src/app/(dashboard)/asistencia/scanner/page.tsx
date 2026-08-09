import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireEditor } from "@/lib/data/profile";
import { getUltimosIngresos } from "@/lib/data/checkins";
import { Card } from "@/components/ui/Card";
import { ScannerClient } from "./ScannerClient";

export default async function ScannerPage() {
  await requireEditor();
  const ultimos = await getUltimosIngresos();

  return (
    <div>
      <Link href="/asistencia" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver a asistencia
      </Link>
      <h1 className="mb-1 text-xl font-bold text-primary">Control de ingreso</h1>
      <p className="mb-5 text-sm text-slate-500">Escaneá el carnet del alumno para registrar su ingreso al complejo.</p>

      <ScannerClient />

      <h2 className="mb-2 mt-8 text-sm font-semibold text-slate-700">Últimos ingresos</h2>
      {ultimos.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay ingresos registrados.</p>
      ) : (
        <div className="space-y-2">
          {ultimos.map((u) => (
            <Card key={u.id} className="flex items-center justify-between py-2.5">
              <span className="text-sm font-medium text-slate-900">{u.student_name}</span>
              <span className="text-xs text-slate-500">{new Date(u.checked_in_at).toLocaleString("es-AR")}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
