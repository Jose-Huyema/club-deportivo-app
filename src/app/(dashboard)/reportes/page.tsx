import { requireProfile } from "@/lib/data/profile";
import { EmptyState } from "@/components/ui/EmptyState";
import { redirect } from "next/navigation";

export default async function ReportesPage() {
  const profile = await requireProfile();
  if (!profile.allowed_views.includes("reportes")) redirect("/asistencia");

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary">Reportes</h1>
      <p className="mb-5 text-sm text-slate-500">Exportá listados y estadísticas del club.</p>
      <EmptyState
        title="Próximamente"
        description="Contame qué reportes necesitás (por ejemplo: asistencia por categoría, alumnos activos, movimientos de stock) y los armamos."
      />
    </div>
  );
}
