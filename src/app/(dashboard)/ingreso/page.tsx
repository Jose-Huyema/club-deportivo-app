import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/data/profile";
import { puedeRegistrarIngreso } from "@/lib/roles";
import { IngresoClient } from "./IngresoClient";
import { getUltimosIngresos } from "@/lib/data/checkins";

export default async function IngresoPage() {
  const profile = await requireProfile();
  if (!puedeRegistrarIngreso(profile.role)) redirect("/");

  const ultimos = await getUltimosIngresos(8);

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">Operación rápida · Portería</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Control de ingreso</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Buscá un alumno por DNI o nombre y registrá su ingreso en un toque.
        </p>
      </div>
      <IngresoClient />

      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Últimos ingresos</h2>
        {ultimos.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Todavía no hay ingresos registrados.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {ultimos.map((ingreso) => (
              <div key={ingreso.id} className="flex items-center justify-between rounded-lg border px-3 py-2 dark:border-slate-700">
                <span className="text-sm font-medium">{ingreso.student_name}</span>
                <span className="text-xs text-slate-500">{new Date(ingreso.checked_in_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
