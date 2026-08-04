import { requireAdmin } from "@/lib/data/profile";
import { getCategorias, getDisciplinas } from "@/lib/data/admin";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { NuevaCategoriaForm } from "./NuevaCategoriaForm";

export default async function CategoriasAdminPage() {
  await requireAdmin();
  const [categorias, disciplinas] = await Promise.all([getCategorias(), getDisciplinas()]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary">Categorías</h1>
      <p className="mb-5 text-sm text-slate-500">Grupos de entrenamiento dentro de cada disciplina.</p>

      {disciplinas.length === 0 ? (
        <EmptyState
          title="Primero creá una disciplina"
          description="Las categorías pertenecen a una disciplina (ej: Fútbol → Sub-12)."
        />
      ) : (
        <NuevaCategoriaForm disciplinas={disciplinas} />
      )}

      <h2 className="mb-2 mt-6 text-sm font-semibold text-slate-700">Categorías existentes</h2>
      {categorias.length === 0 ? (
        <EmptyState title="Todavía no hay categorías cargadas" />
      ) : (
        <div className="space-y-2">
          {categorias.map((c) => (
            <Card key={c.id}>
              <p className="font-medium text-slate-900">{c.name}</p>
              <p className="text-sm text-slate-500">
                {c.discipline_name}
                {c.schedule ? ` · ${c.schedule}` : ""}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
