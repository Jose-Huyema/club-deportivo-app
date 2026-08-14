import Link from "next/link";
import { getAlumnos } from "@/lib/data/alumnos";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function DocumentosIndexPage() {
  const alumnos = await getAlumnos();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary dark:text-white">Documentos</h1>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
        Elegí un alumno para ver o subir sus archivos: seguro, foto de DNI, autorizaciones, comunicados.
      </p>

      {alumnos.length === 0 ? (
        <EmptyState title="Todavía no hay alumnos cargados" />
      ) : (
        <div className="space-y-2">
          {alumnos.map((a) => (
            <Link key={a.id} href={`/documentos/${a.id}`}>
              <Card className="flex items-center justify-between hover:shadow-md">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{a.full_name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {a.categorias.length > 0 ? a.categorias.join(", ") : "Sin categoría"}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
