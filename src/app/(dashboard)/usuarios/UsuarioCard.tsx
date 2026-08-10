"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/FormField";
import type { ProfesorConCategorias, Categoria } from "@/lib/data/admin";
import { toggleAsignacion, cambiarRol } from "./actions";

export function UsuarioCard({
  usuario,
  categorias,
}: {
  usuario: ProfesorConCategorias;
  categorias: Categoria[];
}) {
  const [asignadas, setAsignadas] = useState(new Set(usuario.categoria_ids));
  const [role, setRole] = useState(usuario.role);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggleCategoria(categoryId: string) {
    const yaAsignada = asignadas.has(categoryId);
    setError(null);

    setAsignadas((prev) => {
      const next = new Set(prev);
      yaAsignada ? next.delete(categoryId) : next.add(categoryId);
      return next;
    });

    startTransition(async () => {
      const result = await toggleAsignacion(usuario.id, categoryId, !yaAsignada);
      if (result.error) {
        setError(result.error);
        setAsignadas((prev) => {
          const next = new Set(prev);
          yaAsignada ? next.add(categoryId) : next.delete(categoryId);
          return next;
        });
      }
    });
  }

  function handleCambiarRol(nuevoRol: "admin" | "profe") {
    const anterior = role;
    setError(null);
    setRole(nuevoRol);

    startTransition(async () => {
      const result = await cambiarRol(usuario.id, nuevoRol);
      if (result.error) {
        setError(result.error);
        setRole(anterior);
      }
    });
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{usuario.full_name}</p>
          <p className="text-sm text-slate-500">{usuario.email}</p>
        </div>
        <Select
          value={role}
          onChange={(e) => handleCambiarRol(e.target.value as "admin" | "profe")}
          disabled={isPending}
          className="w-auto"
        >
          <option value="profe">Profe</option>
          <option value="admin">Admin</option>
        </Select>
      </div>

      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => {
            const activa = asignadas.has(c.id);
            return (
              <button
                key={c.id}
                type="button"
                disabled={isPending}
                onClick={() => handleToggleCategoria(c.id)}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
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
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
