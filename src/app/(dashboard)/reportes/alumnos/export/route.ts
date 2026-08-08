import { NextResponse } from "next/server";
import { getReporteAlumnos, toCsv } from "@/lib/data/reportes";
import { requireProfile } from "@/lib/data/profile";

export async function GET() {
  const profile = await requireProfile();
  if (!profile.allowed_views.includes("reportes")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const alumnos = await getReporteAlumnos();
  const csv = toCsv(alumnos, [
    { key: "full_name", label: "Nombre" },
    { key: "dni", label: "DNI" },
    { key: "birth_date", label: "Nacimiento" },
    { key: "emergency_phone", label: "Contacto emergencia" },
    { key: "tutor_name", label: "Tutor" },
    { key: "categorias", label: "Categorías" },
    { key: "is_active", label: "Activo" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="alumnos.csv"',
    },
  });
}
