import { NextResponse } from "next/server";
import { getReporteProfesores, toCsv } from "@/lib/data/reportes";
import { requireProfile } from "@/lib/data/profile";

export async function GET() {
  const profile = await requireProfile();
  if (!profile.allowed_views.includes("reportes")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const usuarios = await getReporteProfesores();
  const csv = toCsv(usuarios, [
    { key: "full_name", label: "Nombre" },
    { key: "email", label: "Email" },
    { key: "role", label: "Rol" },
    { key: "categorias", label: "Categorías" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="profesores.csv"',
    },
  });
}
