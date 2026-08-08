import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { getReporteProfesores } from "@/lib/data/reportes";
import { PrintButton } from "@/components/layout/PrintButton";
import { Badge } from "@/components/ui/Badge";

const LABEL_ROL: Record<string, string> = { admin: "Admin", profe: "Profe", operador: "Operador" };
const TONE_ROL: Record<string, "success" | "warning" | "neutral"> = { admin: "success", profe: "neutral", operador: "warning" };

export default async function ReporteProfesoresPage() {
  const usuarios = await getReporteProfesores();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href="/reportes" className="inline-flex items-center gap-1 text-sm text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <div className="flex gap-2">
          <a href="/reportes/profesores/export">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" /> Exportar CSV
            </button>
          </a>
          <PrintButton label="Imprimir" />
        </div>
      </div>

      <h1 className="mb-1 text-xl font-bold text-primary">Reporte de profesores y usuarios</h1>
      <p className="mb-4 text-sm text-slate-500">{usuarios.length} usuarios</p>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Categorías</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usuarios.map((u, i) => (
              <tr key={i}>
                <td className="px-3 py-2 font-medium text-slate-900">{u.full_name}</td>
                <td className="px-3 py-2 text-slate-600">{u.email}</td>
                <td className="px-3 py-2"><Badge tone={TONE_ROL[u.role] ?? "neutral"}>{LABEL_ROL[u.role] ?? u.role}</Badge></td>
                <td className="px-3 py-2 text-slate-600">{u.categorias || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
