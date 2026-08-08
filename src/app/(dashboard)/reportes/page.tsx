import Link from "next/link";
import { Users, CreditCard } from "lucide-react";
import { requireProfile } from "@/lib/data/profile";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";

export default async function ReportesPage() {
  const profile = await requireProfile();
  if (!profile.allowed_views.includes("reportes")) redirect("/asistencia");

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary">Reportes</h1>
      <p className="mb-5 text-sm text-slate-500">Elegí qué querés ver, imprimir o exportar.</p>

      <div className="space-y-3">
        <Link href="/reportes/alumnos">
          <Card className="flex items-center gap-3 hover:shadow-md">
            <CreditCard className="h-5 w-5 text-accent" />
            <div>
              <p className="font-semibold text-slate-900">Alumnos</p>
              <p className="text-sm text-slate-500">Listado completo con datos de contacto y categorías</p>
            </div>
          </Card>
        </Link>
        <Link href="/reportes/profesores">
          <Card className="flex items-center gap-3 hover:shadow-md">
            <Users className="h-5 w-5 text-accent" />
            <div>
              <p className="font-semibold text-slate-900">Profesores y usuarios</p>
              <p className="text-sm text-slate-500">Listado con roles y categorías asignadas</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
