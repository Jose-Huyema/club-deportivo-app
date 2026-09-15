"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import type { Categoria } from "@/lib/data/admin";
import { toggleInscripcion } from "./actions";

export function CategoriasEditor({
  studentId,
  categorias,
  categoriaIdsIniciales,
}: {
  studentId: string;
  categorias: Categoria[];
  categoriaIdsIniciales: string[];
}) {
  const [inscriptas, setInscriptas] = useState(new Set(categoriaIdsIniciales));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle(categoryId: string) {
    const yaInscripta = inscriptas.has(categoryId);
    setError(null);

    setInscriptas((prev) => {
      const next = new Set(prev);
      yaInscripta ? next.delete(categoryId) : next.add(categoryId);
      return next;
    });

    startTransition(async () => {
      const result = await toggleInscripcion(studentId, categoryId, !yaInscripta);
      if (result.error) {
        setError(result.error);
        setInscriptas((prev) => {
          const next = new Set(prev);
          yaInscripta ? next.add(categoryId) : next.delete(categoryId);
          return next;
        });
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categorias.map((c) => {
          const activa = inscriptas.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              disabled={isPending}
              onClick={() => handleToggle(c.id)}
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
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
