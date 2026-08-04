"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select, ErrorText } from "@/components/ui/FormField";
import type { Disciplina } from "@/lib/data/admin";
import { crearCategoria } from "./actions";

export function NuevaCategoriaForm({ disciplinas }: { disciplinas: Disciplina[] }) {
  const router = useRouter();
  const [disciplineId, setDisciplineId] = useState(disciplinas[0]?.id ?? "");
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await crearCategoria(disciplineId, name, schedule);
      if (result.error) {
        setError(result.error);
        return;
      }
      setName("");
      setSchedule("");
      router.refresh();
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="discipline">Disciplina</Label>
          <Select id="discipline" value={disciplineId} onChange={(e) => setDisciplineId(e.target.value)}>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="name">Nombre de la categoría</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Sub-12" required />
        </div>
        <div>
          <Label htmlFor="schedule">Horario (opcional)</Label>
          <Input
            id="schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="Ej: Martes y jueves 18:00"
          />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={isPending}>
          Agregar categoría
        </Button>
      </form>
    </Card>
  );
}
