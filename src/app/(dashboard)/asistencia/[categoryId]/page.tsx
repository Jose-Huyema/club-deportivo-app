import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getResumenMensual } from "@/lib/data/asistencia";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import clsx from "clsx";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default async function CalendarioAsistenciaPage({
  params,
  searchParams,
}: {
  params: { categoryId: string };
  searchParams: { year?: string; month?: string };
}) {
  const supabase = createClient();
  const { data: categoria } = await supabase
    .from("categories")
    .select("name")
    .eq("id", params.categoryId)
    .single();

  if (!categoria) notFound();

  const hoy = new Date();
  const year = Number(searchParams.year) || hoy.getFullYear();
  const month = Number(searchParams.month) || hoy.getMonth() + 1; // 1-12

  const resumen = await getResumenMensual(params.categoryId, year, month);

  const diasEnMes = new Date(year, month, 0).getDate();
  const primerDiaSemana = new Date(year, month - 1, 1).getDay(); // 0=domingo
  const hoyStr = hoy.toISOString().slice(0, 10);

  const mesAnterior = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const mesSiguiente = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary">{categoria.name}</h1>
      <p className="mb-5 text-sm text-slate-500">Elegí un día para tomar o revisar la asistencia.</p>

      <div className="mb-3 flex items-center justify-between">
        <Link
          href={`/asistencia/${params.categoryId}?year=${mesAnterior.year}&month=${mesAnterior.month}`}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <ChevronLeft className="h-5 w-5 text-slate-500" />
        </Link>
        <p className="font-semibold text-slate-900">{MESES[month - 1]} {year}</p>
        <Link
          href={`/asistencia/${params.categoryId}?year=${mesSiguiente.year}&month=${mesSiguiente.month}`}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </Link>
      </div>

      <Card>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
          {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: primerDiaSemana }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: diasEnMes }).map((_, i) => {
            const dia = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
            const estado = resumen.get(dateStr);
            const esHoy = dateStr === hoyStr;

            return (
              <Link
                key={dia}
                href={`/asistencia/${params.categoryId}/${dateStr}`}
                className={clsx(
                  "flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors",
                  estado === "finalizada" && "bg-emerald-100 text-emerald-800",
                  estado === "en_progreso" && "bg-amber-100 text-amber-800",
                  !estado && "text-slate-600 hover:bg-slate-100",
                  esHoy && "ring-2 ring-accent"
                )}
              >
                {dia}
              </Link>
            );
          })}
        </div>
      </Card>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-100" /> Finalizada</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-amber-100" /> En progreso</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm ring-2 ring-accent" /> Hoy</span>
      </div>
    </div>
  );
}
