import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { getReporteAlumnos } from "@/lib/data/reportes";
import { PrintButton } from "@/components/layout/PrintButton";
import { Badge } from "@/components/ui/Badge";

export default async function ReporteAlumnosPage() {
  const alumnos = await getReporteAlumnos();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href="/reportes" className="inline-flex items-center gap-1 text-sm text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <div className="flex gap-2">
          <a href="/reportes/alumnos/export">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" /> Exportar CSV
            </button>
          </a>
          <PrintButton label="Imprimir" />
        </div>
      </div>

      <h1 className="mb-1 text-xl font-bold text-primary">Reporte de alumnos</h1>
      <p className="mb-4 text-sm text-slate-500">{alumnos.length} alumnos</p>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">DNI</th>
              <th className="px-3 py-2">Nacimiento</th>
              <th className="px-3 py-2">Contacto</th>
              <th className="px-3 py-2">Tutor</th>
              <th className="px-3 py-2">Categorías</th>
              <th className="px-3 py-2">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alumnos.map((a, i) => (
              <tr key={i}>
                <td className="px-3 py-2 font-medium text-slate-900">{a.full_name}</td>
                <td className="px-3 py-2 text-slate-600">{a.dni ?? "—"}</td>
                <td className="px-3 py-2 text-slate-600">{a.birth_date ?? "—"}</td>
                <td className="px-3 py-2 text-slate-600">{a.emergency_phone}</td>
                <td className="px-3 py-2 text-slate-600">{a.tutor_name ?? "—"}</td>
                <td className="px-3 py-2 text-slate-600">{a.categorias || "—"}</td>
                <td className="px-3 py-2">
                  <Badge tone={a.is_active ? "success" : "neutral"}>{a.is_active ? "Activo" : "Inactivo"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
