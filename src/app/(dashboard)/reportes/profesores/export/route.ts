import { NextResponse } from "next/server";
import { getReporteProfesores, toCsv } from "@/lib/data/reportes";
import { requireProfile, labelRol } from "@/lib/data/profile";

export async function GET() {
  const profile = await requireProfile();
  if (!profile.allowed_views.includes("reportes")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const usuarios = await getReporteProfesores();
  const filas = usuarios.map((u) => ({ ...u, rol_legible: labelRol(u.role, u.genero) }));
  const csv = toCsv(filas, [
    { key: "full_name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "rol_legible", label: "Rol" },
    { key: "categorias", label: "Categorías" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="profesores.csv"',
    },
  });
}
