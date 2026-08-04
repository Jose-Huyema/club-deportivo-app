import Link from "next/link";
import { requireProfile } from "@/lib/data/profile";
import { getCategoriasParaAsistencia } from "@/lib/data/asistencia";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChevronRight } from "lucide-react";

export default async function AsistenciaPage() {
  // ── Versión temporal de diagnóstico ──
  let profile;
  try {
    profile = await requireProfile();
  } catch (err: any) {
    return <DebugError etapa="requireProfile()" error={{ message: err?.message, stack: err?.stack }} />;
  }

  let categorias;
  try {
    categorias = await getCategoriasParaAsistencia(profile.id, profile.role);
  } catch (err: any) {
    return <DebugError etapa="getCategoriasParaAsistencia()" error={{ message: err?.message, stack: err?.stack }} />;
  }
  // ── Fin de la versión temporal ──

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary">Asistencia</h1>
      <p className="mb-5 text-sm text-slate-500">
        Elegí una categoría para pasar lista de hoy.
      </p>

      {categorias.length === 0 ? (
        <EmptyState
          title="No tenés categorías asignadas"
          description="Pedile a un administrador que te asigne una categoría desde el panel de Admin."
        />
      ) : (
        <div className="space-y-3">
          {categorias.map((c) => (
            <Link key={c.id} href={`/asistencia/${c.id}`}>
              <Card className="flex items-center justify-between transition-shadow hover:shadow-md active:shadow-none">
                <div>
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <p className="text-sm text-slate-500">
                    {c.discipline_name}
                    {c.schedule ? ` · ${c.schedule}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {c.ya_registrada_hoy ? (
                    <Badge tone="success">Ya tomada</Badge>
                  ) : (
                    <Badge tone="warning">Pendiente</Badge>
                  )}
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function DebugError({ etapa, error }: { etapa: string; error: unknown }) {
  return (
    <div>
      <h1 className="mb-2 text-lg font-bold text-red-700">Error de diagnóstico</h1>
      <p className="mb-3 text-sm text-slate-600">
        Falló en: <strong>{etapa}</strong>
      </p>
      <pre className="overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-red-300">
        {JSON.stringify(error, null, 2)}
      </pre>
    </div>
  );
}
