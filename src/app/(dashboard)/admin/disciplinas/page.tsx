import { requireAdmin } from "@/lib/data/profile";
import { getDisciplinas } from "@/lib/data/admin";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { NuevaDisciplinaForm } from "./NuevaDisciplinaForm";

export default async function DisciplinasAdminPage() {
  await requireAdmin();
  const disciplinas = await getDisciplinas();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary">Disciplinas</h1>
      <p className="mb-5 text-sm text-slate-500">Deportes o actividades que ofrece el club.</p>

      <NuevaDisciplinaForm />

      <h2 className="mb-2 mt-6 text-sm font-semibold text-slate-700">Disciplinas existentes</h2>
      {disciplinas.length === 0 ? (
        <EmptyState title="Todavía no hay disciplinas cargadas" />
      ) : (
        <div className="space-y-2">
          {disciplinas.map((d) => (
            <Card key={d.id}>
              <p className="font-medium text-slate-900">{d.name}</p>
              {d.description && <p className="text-sm text-slate-500">{d.description}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
