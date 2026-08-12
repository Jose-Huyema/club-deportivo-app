"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label, Select, Input, Textarea, ErrorText } from "@/components/ui/FormField";
import type { ItemInventario } from "@/lib/data/inventario";
import { registrarMovimiento } from "./actions";

type Tipo = "ingreso" | "egreso" | "baja_desgaste";

export function MovimientoForm({ items, soloEgresos }: { items: ItemInventario[]; soloEgresos: boolean }) {
  const router = useRouter();
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [type, setType] = useState<Tipo>(soloEgresos ? "egreso" : "ingreso");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!itemId) {
      setError("Elegí un artículo.");
      return;
    }
    if (soloEgresos && !notes.trim()) {
      setError("El motivo es obligatorio.");
      return;
    }

    startTransition(async () => {
      const result = await registrarMovimiento({ itemId, type, quantity: Number(quantity), notes });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setQuantity("1");
        setNotes("");
        router.refresh();
      }
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {soloEgresos
          ? "No hay artículos cargados en tu disciplina todavía."
          : "No hay artículos cargados todavía. Agregalos desde el panel de Admin."}
      </p>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="item">Artículo</Label>
          <Select id="item" value={itemId} onChange={(e) => setItemId(e.target.value)}>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} (stock actual: {i.total_quantity})
              </option>
            ))}
          </Select>
        </div>

        {!soloEgresos && (
          <div>
            <Label htmlFor="type">Tipo de movimiento</Label>
            <Select id="type" value={type} onChange={(e) => setType(e.target.value as Tipo)}>
              <option value="ingreso">Ingreso (compra o donación)</option>
              <option value="egreso">Egreso (préstamo o uso)</option>
              <option value="baja_desgaste">Baja por desgaste</option>
            </Select>
          </div>
        )}

        {soloEgresos && (
          <div>
            <Label htmlFor="type">Motivo del movimiento</Label>
            <Select id="type" value={type} onChange={(e) => setType(e.target.value as Tipo)}>
              <option value="egreso">Egreso (préstamo o uso)</option>
              <option value="baja_desgaste">Baja por desgaste</option>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="quantity">Cantidad</Label>
          <Input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="notes">{soloEgresos ? "Motivo (obligatorio)" : "Notas (opcional)"}</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={soloEgresos ? "Ej: se rompieron 2 pecheras en el entrenamiento" : "Ej: compra para categoría infantil"}
            required={soloEgresos}
          />
        </div>

        <ErrorText>{error}</ErrorText>
        {success && <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Movimiento registrado.</p>}

        <Button type="submit" className="w-full" loading={isPending}>
          Registrar movimiento
        </Button>
      </form>
    </Card>
  );
}
