"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, ErrorText } from "@/components/ui/FormField";
import { crearDisciplina } from "./actions";

export function NuevaDisciplinaForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await crearDisciplina(name, description);
      if (result.error) {
        setError(result.error);
        return;
      }
      setName("");
      setDescription("");
      router.refresh();
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Fútbol" required />
        </div>
        <div>
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Fútbol infantil y juvenil"
          />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={isPending}>
          Agregar disciplina
        </Button>
      </form>
    </Card>
  );
}
