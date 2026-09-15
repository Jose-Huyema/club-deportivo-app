"use client";

import { useState, useTransition, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorText } from "@/components/ui/FormField";
import { importarAlumnos, type FilaImportacion } from "./actions";

const COLUMNAS_ESPERADAS = ["full_name", "emergency_phone", "dni", "birth_date", "tutor_name", "medical_notes"];

export function ImportarAlumnosForm() {
  const router = useRouter();
  const [filas, setFilas] = useState<FilaImportacion[]>([]);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ creados: number; fallidos: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResultado(null);
    setNombreArchivo(file.name);

    Papa.parse<FilaImportacion>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const columnas = results.meta.fields ?? [];
        const faltantes = ["full_name", "emergency_phone"].filter((c) => !columnas.includes(c));
        if (faltantes.length > 0) {
          setError(`Al CSV le faltan las columnas obligatorias: ${faltantes.join(", ")}.`);
          setFilas([]);
          return;
        }
        setFilas(results.data);
      },
      error: () => setError("No se pudo leer el archivo. Verificá que sea un CSV válido."),
    });
  }

  function handleImportar() {
    setError(null);
    startTransition(async () => {
      const result = await importarAlumnos(filas);
      if (result.error) {
        setError(result.error);
        return;
      }
      setResultado({ creados: result.creados, fallidos: result.fallidos });
      setFilas([]);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Archivo CSV</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
        </label>
        {nombreArchivo && <p className="mt-2 text-xs text-slate-500">Archivo: {nombreArchivo}</p>}
        <ErrorText>{error}</ErrorText>
      </Card>

      {filas.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Vista previa: {filas.length} fila(s) detectadas
          </p>
          <div className="max-h-64 overflow-auto rounded-lg border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {COLUMNAS_ESPERADAS.map((c) => (
                    <th key={c} className="whitespace-nowrap px-2 py-1.5">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filas.slice(0, 10).map((f, i) => (
                  <tr key={i}>
                    {COLUMNAS_ESPERADAS.map((c) => (
                      <td key={c} className="whitespace-nowrap px-2 py-1.5 text-slate-700">
                        {(f as any)[c] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filas.length > 10 && <p className="mt-1 text-xs text-slate-400">…y {filas.length - 10} más</p>}
          <Button className="mt-3 w-full" onClick={handleImportar} loading={isPending}>
            Importar {filas.length} alumno(s)
          </Button>
        </Card>
      )}

      {resultado && (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm font-medium text-emerald-800">
            Se crearon {resultado.creados} alumno(s).
          </p>
          {resultado.fallidos.length > 0 && (
            <p className="mt-1 text-sm text-amber-700">
              {resultado.fallidos.length} fila(s) se saltearon por faltarles nombre o teléfono: {resultado.fallidos.join(", ")}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
