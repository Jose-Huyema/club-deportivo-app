"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { buscarAlumnosIngreso, registrarIngresoPorCodigo, registrarIngresoRapido, type IngresoAlumno } from "./actions";
import { ScannerInput } from "@/components/ui/ScannerInput";

type Mode = "buscar" | "escanear";

type Feedback = { ok: boolean; text: string };

export function IngresoClient() {
  const [mode, setMode] = useState<Mode>("buscar");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<IngresoAlumno[]>([]);
  const [message, setMessage] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== "buscar") return;
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
  }, [term, mode]);

  function registrarAlumno(alumno: IngresoAlumno) {
    setMessage(null);
    startTransition(async () => {
      const result = await registrarIngresoRapido(alumno.id);
      if (result.error) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setMessage({ ok: true, text: `✓ Ingreso registrado: ${result.studentName}` });
      setTerm("");
      setResults([]);
      inputRef.current?.focus();
    });
  }

  function procesarCodigo(codigo: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await registrarIngresoPorCodigo(codigo);
      if (result.error) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setMessage({ ok: true, text: `✓ Ingreso registrado: ${result.studentName}` });
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => { setMode("buscar"); setMessage(null); }}
          className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${mode === "buscar" ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"}`}
        >
          🔎 Buscar alumno
        </button>
        <button
          type="button"
          onClick={() => { setMode("escanear"); setMessage(null); }}
          className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${mode === "escanear" ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"}`}
        >
          📷 Escanear carnet
        </button>
      </div>

      {mode === "buscar" ? (
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
              if (e.key === "Enter" && results.length === 1) registrarAlumno(results[0]);
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
                  onClick={() => registrarAlumno(alumno)}
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
      ) : (
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 text-center">
            <p className="text-sm font-semibold">Acercá el carnet al lector</p>
            <p className="mt-1 text-xs text-slate-500">El lector USB funciona como teclado y finaliza con Enter.</p>
          </div>
          <ScannerInput onScan={procesarCodigo} disabled={isPending} placeholder="Listo para escanear…" />
          {isPending && <p className="mt-3 text-center text-xs text-slate-500">Registrando ingreso…</p>}
        </div>
      )}

      {message && (
        <div role="status" className={`rounded-xl p-4 text-center font-semibold ${message.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-center gap-4 text-sm">
        <Link href="/alumnos" className="font-semibold underline underline-offset-4">Ver alumnos</Link>
        <Link href="/asistencia" className="font-semibold underline underline-offset-4">Ir a asistencia</Link>
      </div>
    </div>
  );
}
