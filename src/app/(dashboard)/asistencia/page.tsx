import Link from "next/link";
import { requireProfile } from "@/lib/data/profile";
import { getCategoriasParaAsistencia } from "@/lib/data/asistencia";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AsistenciaPage() {
  const profile = await requireProfile();
  const categorias = await getCategoriasParaAsistencia(profile.id, profile.role);

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
                  <span className="text-slate-400">›</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
