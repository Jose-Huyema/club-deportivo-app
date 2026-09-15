import Link from "next/link";
import { getInventario } from "@/lib/data/inventario";
import { requireProfile, puedeEditar } from "@/lib/data/profile";
import { puedeRegistrarEgreso } from "@/lib/roles";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AlertTriangle } from "lucide-react";

export default async function InventarioPage() {
  const profile = await requireProfile();
  const items = await getInventario();
  const bajoStock = items.filter((i) => i.stock_bajo);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-primary dark:text-white">Inventario</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{items.length} artículos</p>
        </div>
        <div className="flex gap-2">
          {puedeEditar(profile.role) && (
            <Link href="/inventario/nuevo">
              <Button variant="secondary">Nuevo artículo</Button>
            </Link>
          )}
          {puedeRegistrarEgreso(profile.role) && (
            <Link href="/inventario/movimientos">
              <Button>{profile.role === "profe" ? "Registrar egreso" : "Registrar movimiento"}</Button>
            </Link>
          )}
        </div>
      </div>

      {bajoStock.length > 0 && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p><strong>{bajoStock.length}</strong> artículo(s) con stock bajo el mínimo: {bajoStock.map((i) => i.name).join(", ")}.</p>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState title="Sin artículos cargados" description='Tocá "Nuevo artículo" para cargar el primero.' />
      ) : (
        <div className="space-y-2">
          {items.map((i) => (
            <Card key={i.id} className={i.stock_bajo ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20" : undefined}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{i.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{i.discipline_name ?? "General"}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{i.total_quantity}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">mín. {i.min_warning_quantity}</p>
                </div>
              </div>
              {i.stock_bajo && <Badge tone="warning" className="mt-2">Stock bajo</Badge>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
