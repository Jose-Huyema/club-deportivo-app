"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { buscarAlumnosIngreso, registrarIngresoRapido, type IngresoAlumno } from "./actions";

export function IngresoClient() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<IngresoAlumno[]>([]);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const value = term.trim();
    if (value.length < 2) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const result = await buscarAlumnosIngreso(value);
        setResults(result.data);
        if (result.error) setMessage({ ok: false, text: result.error });
      });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [term]);

  function ingresar(alumno: IngresoAlumno) {
    setMessage(null);
    startTransition(async () => {
      const result = await registrarIngresoRapido(alumno.id);
      if (result.error) {
        setMessage({ ok: false, text: result.error });
      } else {
        setMessage({ ok: true, text: `✓ Ingreso registrado: ${result.studentName}` });
        setTerm("");
        setResults([]);
        inputRef.current?.focus();
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label htmlFor="ingreso-search" className="mb-2 block text-sm font-semibold">
          DNI o nombre del alumno
        </label>
        <input
          ref={inputRef}
          id="ingreso-search"
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length === 1) ingresar(results[0]);
          }}
          placeholder="Ej. 12345678 o Juan Pérez"
          className="w-full rounded-xl border border-slate-300 px-4 py-4 text-lg outline-none focus:ring-2 dark:border-slate-600 dark:bg-slate-800"
        />
        {isPending && <p className="mt-2 text-xs text-slate-500">Buscando…</p>}

        {results.length > 0 && (
          <div className="mt-3 space-y-2">
            {results.map((alumno) => (
              <button
                key={alumno.id}
                type="button"
                onClick={() => ingresar(alumno)}
                disabled={isPending}
                className="flex w-full items-center justify-between rounded-xl border p-4 text-left hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <span>
                  <span className="block font-semibold">{alumno.full_name}</span>
                  <span className="text-sm text-slate-500">{alumno.dni || "Sin DNI"}</span>
                </span>
                <span className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                  Registrar
                </span>
              </button>
            ))}
          </div>
        )}

        {term.trim().length >= 2 && !isPending && results.length === 0 && (
          <p className="mt-4 text-sm text-slate-500">No encontramos alumnos activos.</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/asistencia/scanner" className="rounded-xl border px-4 py-3 text-center font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
          📷 Escanear carnet
        </Link>
        <Link href="/alumnos" className="rounded-xl border px-4 py-3 text-center font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
          Ver alumnos
        </Link>
      </div>

      {message && (
        <div role="status" className={`rounded-xl p-4 text-center font-semibold ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
