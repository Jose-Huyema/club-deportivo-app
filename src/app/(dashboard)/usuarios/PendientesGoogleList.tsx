"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { labelRol } from "@/lib/roles";
import type { InvitacionPendiente } from "@/lib/data/invitaciones";
import { cancelarAutorizacionPendiente } from "./actions";

export function PendientesGoogleList({ pendientes }: { pendientes: InvitacionPendiente[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancelar(email: string) {
    setError(null);
    startTransition(async () => {
      const result = await cancelarAutorizacionPendiente(email);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  if (pendientes.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Esperando primer login con Google ({pendientes.length})
      </p>
      <div className="space-y-2">
        {pendientes.map((p) => (
          <Card key={p.email} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.email}</p>
              <Badge tone="warning">{labelRol(p.role, p.genero)}</Badge>
            </div>
            <button
              type="button"
              onClick={() => handleCancelar(p.email)}
              disabled={isPending}
              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
            >
              Cancelar
            </button>
          </Card>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
