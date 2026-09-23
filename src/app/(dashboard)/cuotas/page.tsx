import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/data/profile";
import { getFinanzasResumen, getPlanes } from "@/lib/data/cuotas";
import { Card, Badge } from "@/components/ui";
import { CuotasClient } from "./CuotasClient";

const money = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(value);

export default async function CuotasPage() {
  const profile = await requireProfile();
  if (profile.role !== "admin" && !profile.allowed_views.includes("cuotas")) redirect("/");

  const [summary, plans] = await Promise.all([getFinanzasResumen(), getPlanes()]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2"><h1 className="font-display text-2xl font-bold text-primary dark:text-white">Cuotas y cobranzas</h1><Badge tone="success">Preparado para el futuro</Badge></div>
        <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">El club puede trabajar con planes gratuitos hoy y activar planes pagos más adelante, sin rediseñar el sistema.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card><p className="text-xs uppercase tracking-wide text-slate-500">Planes activos</p><p className="mt-1 text-2xl font-bold">{summary.planesActivos}</p></Card>
        <Card><p className="text-xs uppercase tracking-wide text-slate-500">Alumnos con plan</p><p className="mt-1 text-2xl font-bold">{summary.sociosConPlan}</p></Card>
        <Card><p className="text-xs uppercase tracking-wide text-slate-500">Cuotas pendientes</p><p className="mt-1 text-2xl font-bold">{summary.cuotasPendientes}</p></Card>
        <Card><p className="text-xs uppercase tracking-wide text-slate-500">Saldo pendiente</p><p className="mt-1 text-2xl font-bold">{money(summary.deudaPendiente)}</p></Card>
      </div>

      <CuotasClient plans={plans} isAdmin={profile.role === "admin"} />
    </div>
  );
}
