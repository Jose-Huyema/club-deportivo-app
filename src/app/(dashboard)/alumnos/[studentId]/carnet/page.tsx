import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { getAlumnoDetalle } from "@/lib/data/alumnos";
import { getAppSettings } from "@/lib/data/settings";
import { PrintButton } from "@/components/layout/PrintButton";

export default async function CarnetAlumnoPage({ params }: { params: { studentId: string } }) {
  const [alumno, settings] = await Promise.all([
    getAlumnoDetalle(params.studentId),
    getAppSettings(),
  ]);

  if (!alumno) notFound();

  // El QR codifica el ID del alumno. Cuando se construya el módulo de
  // check-in por scanner, va a leer este mismo valor para identificarlo.
  const qrDataUrl = await QRCode.toDataURL(`STUDENT:${alumno.id}`, { margin: 1, width: 240 });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/alumnos/${alumno.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <PrintButton label="Imprimir carnet" />
      </div>

      <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:border-2 print:shadow-none">
        <div className="bg-primary px-5 py-3 text-center">
          <p className="text-sm font-bold text-white">{settings.club_name}</p>
        </div>
        <div className="flex flex-col items-center gap-3 p-6">
          <img src={qrDataUrl} alt="Código QR del alumno" className="h-40 w-40" />
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{alumno.full_name}</p>
            {alumno.dni && <p className="text-sm text-slate-500">DNI {alumno.dni}</p>}
            {alumno.categorias.length > 0 && (
              <p className="mt-1 text-sm font-medium text-accent">{alumno.categorias.join(" · ")}</p>
            )}
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-2 text-center">
          <p className="text-xs text-slate-400">ID {alumno.id.slice(0, 8)}</p>
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-sm text-center text-xs text-slate-400 print:hidden">
        Este QR está preparado para un futuro control de ingreso por scanner. Por ahora es solo identificatorio.
      </p>
    </div>
  );
}
