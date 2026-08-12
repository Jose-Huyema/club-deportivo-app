"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Textarea, ErrorText } from "@/components/ui/FormField";
import type { Categoria, Disciplina } from "@/lib/data/admin";
import { crearAlumno } from "./actions";

const TALLES = ["XS", "S", "M", "L", "XL", "XXL"];

export function NuevoAlumnoForm({ categorias, disciplinas }: { categorias: Categoria[]; disciplinas: Disciplina[] }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [tutorName, setTutorName] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [dni, setDni] = useState("");
  const [address, setAddress] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [clothingSize, setClothingSize] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("todas");
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
        fullName, emergencyPhone, phone, birthDate, tutorName, medicalNotes,
        dni, address, heightCm, weightKg, clothingSize,
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

  const categoriasFiltradas =
    disciplineFilter === "todas" ? categorias : categorias.filter((c) => c.discipline_id === disciplineFilter);

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Datos personales</p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej: Juan Pérez" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dni">DNI (opcional)</Label>
                <Input id="dni" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="12345678" />
              </div>
              <div>
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Dirección (opcional)</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle 123, Ciudad" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="phone">Teléfono personal (opcional)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="11-2345-6789" />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Teléfono de emergencia</Label>
                <Input id="emergencyPhone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="11-2345-6789" required />
              </div>
            </div>
            <div>
              <Label htmlFor="tutorName">Tutor/a (opcional)</Label>
              <Input id="tutorName" value={tutorName} onChange={(e) => setTutorName(e.target.value)} placeholder="Ej: Ana Pérez" />
            </div>
            <div>
              <Label htmlFor="medicalNotes">Notas médicas (opcional)</Label>
              <Textarea id="medicalNotes" value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} placeholder="Alergias, condiciones a tener en cuenta, etc." />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Medidas (opcional)</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="heightCm">Altura (cm)</Label>
              <Input id="heightCm" type="number" min={0} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="150" />
            </div>
            <div>
              <Label htmlFor="weightKg">Peso (kg)</Label>
              <Input id="weightKg" type="number" min={0} step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="45" />
            </div>
            <div>
              <Label htmlFor="clothingSize">Talle</Label>
              <select
                id="clothingSize"
                value={clothingSize}
                onChange={(e) => setClothingSize(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">—</option>
                {TALLES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
          <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Disciplina y categorías (opcional)</p>
          {disciplinas.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Todavía no hay disciplinas cargadas. Podés crear el alumno igual y asignarlo después desde su ficha.
            </p>
          ) : (
            <>
              <div className="mb-3">
                <Label htmlFor="disciplineFilter">Disciplina</Label>
                <select
                  id="disciplineFilter"
                  value={disciplineFilter}
                  onChange={(e) => setDisciplineFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="todas">Todas</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              {categoriasFiltradas.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Esa disciplina todavía no tiene categorías creadas.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categoriasFiltradas.map((c) => {
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
                            : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        )}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="w-full" loading={isPending}>
          Crear alumno
        </Button>
      </form>
    </Card>
  );
}
