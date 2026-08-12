import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/data/profile";
import { puedeRegistrarEgreso } from "@/lib/roles";
import { getInventario, getMovimientosRecientes, getDisciplinasDelProfe } from "@/lib/data/inventario";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MovimientoForm } from "./MovimientoForm";

const TONE_POR_TIPO: Record<string, "success" | "danger" | "warning"> = {
  ingreso: "success",
  egreso: "warning",
  baja_desgaste: "danger",
};

const LABEL_POR_TIPO: Record<string, string> = {
  ingreso: "Ingreso",
  egreso: "Egreso",
  baja_desgaste: "Baja por desgaste",
};

export default async function MovimientosPage() {
  const profile = await requireProfile();
  if (!puedeRegistrarEgreso(profile.role)) redirect("/inventario");

  const soloEgresos = profile.role === "profe";
  const [todosLosItems, movimientos] = await Promise.all([getInventario(), getMovimientosRecientes()]);

  let items = todosLosItems;
  if (soloEgresos) {
    const disciplinasProfe = await getDisciplinasDelProfe(profile.id);
    items = todosLosItems.filter((i) => i.discipline_id && disciplinasProfe.includes(i.discipline_id));
  }

  return (
    <div>
      <Link href="/inventario" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver a inventario
      </Link>
      <h1 className="mb-1 text-xl font-bold text-primary dark:text-white">
        {soloEgresos ? "Registrar egreso o baja" : "Registrar movimiento"}
      </h1>
      {soloEgresos && (
        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Como profe solo podés descontar stock de los artículos de tu disciplina, detallando el motivo.
        </p>
      )}

      <MovimientoForm items={items} soloEgresos={soloEgresos} />

      <h2 className="mb-2 mt-8 text-sm font-semibold text-slate-700 dark:text-slate-300">Movimientos recientes</h2>
      <div className="space-y-2">
        {movimientos.map((m) => (
          <Card key={m.id} className="py-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{m.item_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{m.user_name ?? "—"} · {new Date(m.created_at).toLocaleString("es-AR")}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{m.type === "ingreso" ? "+" : "-"}{m.quantity}</span>
                <Badge tone={TONE_POR_TIPO[m.type] ?? "neutral"}>{LABEL_POR_TIPO[m.type] ?? m.type}</Badge>
              </div>
            </div>
            {m.notes && <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">"{m.notes}"</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
