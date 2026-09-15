"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select, Textarea, ErrorText } from "@/components/ui/FormField";
import type { Disciplina } from "@/lib/data/admin";
import { crearArticulo } from "./actions";

export function NuevoArticuloForm({ disciplinas }: { disciplinas: Disciplina[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [disciplineId, setDisciplineId] = useState(disciplinas[0]?.id ?? "");
  const [totalQuantity, setTotalQuantity] = useState("0");
  const [minWarningQuantity, setMinWarningQuantity] = useState("5");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await crearArticulo({ name, disciplineId, totalQuantity, minWarningQuantity, description });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/inventario");
      router.refresh();
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del artículo</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Pecheras" required />
        </div>
        {disciplinas.length > 0 && (
          <div>
            <Label htmlFor="discipline">Disciplina (opcional)</Label>
            <Select id="discipline" value={disciplineId} onChange={(e) => setDisciplineId(e.target.value)}>
              <option value="">General (todas)</option>
              {disciplinas.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="totalQuantity">Stock inicial</Label>
            <Input id="totalQuantity" type="number" min={0} value={totalQuantity} onChange={(e) => setTotalQuantity(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="minWarningQuantity">Aviso de stock bajo</Label>
            <Input id="minWarningQuantity" type="number" min={0} value={minWarningQuantity} onChange={(e) => setMinWarningQuantity(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="w-full" loading={isPending}>
          Crear artículo
        </Button>
      </form>
    </Card>
  );
}
