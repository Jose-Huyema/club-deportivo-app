"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AlumnoResumen } from "@/lib/data/alumnos";

export function AlumnosList({ alumnos }: { alumnos: AlumnoResumen[] }) {
  const [query, setQuery] = useState("");

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return alumnos;
    return alumnos.filter((a) => a.full_name.toLowerCase().includes(q));
  }, [alumnos, query]);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar alumno por nombre…"
          className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          title="No encontramos alumnos"
          description="Probá con otro nombre o revisá que esté cargado en el sistema."
        />
      ) : (
        <div className="space-y-2">
          {filtrados.map((a) => (
            <Link key={a.id} href={`/alumnos/${a.id}`}>
              <Card className="flex items-center justify-between hover:shadow-md active:shadow-none">
                <div>
                  <p className="font-medium text-slate-900">{a.full_name}</p>
                  <p className="text-sm text-slate-500">
                    {a.categorias.length > 0 ? a.categorias.join(", ") : "Sin categoría"}
                  </p>
                </div>
                {!a.is_active && <Badge tone="neutral">Inactivo</Badge>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
