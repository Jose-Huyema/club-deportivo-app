"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { setAlumnoActivo } from "./actions";

export function ActivoToggle({ studentId, isActive }: { studentId: string; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    const anterior = active;
    setError(null);
    setActive(!anterior);

    startTransition(async () => {
      const result = await setAlumnoActivo(studentId, !anterior);
      if (result.error) {
        setError(result.error);
        setActive(anterior);
      }
    });
  }

  return (
    <div className="text-right">
      <button type="button" onClick={handleClick} disabled={isPending}>
        <Badge tone={active ? "success" : "neutral"}>{active ? "Activo" : "Inactivo"}</Badge>
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
