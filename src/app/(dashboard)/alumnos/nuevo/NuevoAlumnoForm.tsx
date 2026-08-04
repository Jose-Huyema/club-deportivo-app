"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Textarea, ErrorText } from "@/components/ui/FormField";
import type { Categoria } from "@/lib/data/admin";
import { crearAlumno } from "./actions";

export function NuevoAlumnoForm({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [tutorName, setTutorName] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [categoryIds, setCategoryIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleCategoria(id: string) {
    setCategoryIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await crearAlumno({
        fullName,
        emergencyPhone,
        birthDate,
        tutorName,
        medicalNotes,
        categoryIds: Array.from(categoryIds),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push(result.studentId ? `/alumnos/${result.studentId}` : "/alumnos");
      router.refresh();
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>

        <div>
          <Label htmlFor="emergencyPhone">Teléfono de emergencia</Label>
          <Input
            id="emergencyPhone"
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            placeholder="11-2345-6789"
            required
          />
        </div>

        <div>
          <Label htmlFor="birthDate">Fecha de nacimiento (opcional)</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="tutorName">Tutor/a (opcional)</Label>
          <Input
            id="tutorName"
            value={tutorName}
            onChange={(e) => setTutorName(e.target.value)}
            placeholder="Ej: Ana Pérez"
          />
        </div>

        <div>
          <Label htmlFor="medicalNotes">Notas médicas (opcional)</Label>
          <Textarea
            id="medicalNotes"
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            placeholder="Alergias, condiciones a tener en cuenta, etc."
          />
        </div>

        {categorias.length > 0 && (
          <div>
            <Label htmlFor="categorias">Categorías (opcional)</Label>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => {
                const activa = categoryIds.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategoria(c.id)}
                    className={clsx(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      activa
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                    )}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="w-full" loading={isPending}>
          Crear alumno
        </Button>
      </form>
    </Card>
  );
}
