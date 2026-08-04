import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getInventario, getMovimientosRecientes } from "@/lib/data/inventario";
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
  const [items, movimientos] = await Promise.all([
    getInventario(),
    getMovimientosRecientes(),
  ]);

  return (
    <div>
      <Link href="/inventario" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver a inventario
      </Link>
      <h1 className="mb-5 text-xl font-bold text-primary">Registrar movimiento</h1>

      <MovimientoForm items={items} />

      <h2 className="mb-2 mt-8 text-sm font-semibold text-slate-700">Movimientos recientes</h2>
      <div className="space-y-2">
        {movimientos.map((m) => (
          <Card key={m.id} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-900">{m.item_name}</p>
              <p className="text-xs text-slate-500">
                {m.user_name ?? "—"} · {new Date(m.created_at).toLocaleString("es-AR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {m.type === "ingreso" ? "+" : "-"}
                {m.quantity}
              </span>
              <Badge tone={TONE_POR_TIPO[m.type] ?? "neutral"}>{LABEL_POR_TIPO[m.type] ?? m.type}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
