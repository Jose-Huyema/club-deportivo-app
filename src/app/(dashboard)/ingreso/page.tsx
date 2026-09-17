import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/data/profile";
import { puedeRegistrarIngreso } from "@/lib/roles";
import { IngresoClient } from "./IngresoClient";

export default async function IngresoPage() {
  const profile = await requireProfile();
  if (!puedeRegistrarIngreso(profile.role)) redirect("/");

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
    </main>
  );
}
