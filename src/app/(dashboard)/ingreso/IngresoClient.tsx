"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  buscarAlumnosIngreso,
  registrarIngresoPorCodigo,
  registrarIngresoRapido,
  type IngresoAlumno,
} from "./actions";
import type { IngresoConfirmacion } from "../asistencia/scanner/actions";
import { ScannerInput } from "@/components/ui/ScannerInput";

type Mode = "buscar" | "escanear";
type Feedback = { ok: boolean; text: string };

function Iniciales({ nombre }: { nombre: string }) {
  const iniciales = nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white dark:bg-white dark:text-slate-900">
      {iniciales || "A"}
    </div>
  );
}

function ConfirmacionIngreso({ student, onNuevo }: { student: IngresoConfirmacion; onNuevo: () => void }) {
  const hora = new Date(student.checked_in_at).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white">✓ INGRESO REGISTRADO</div>
        <Iniciales nombre={student.full_name} />
        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{student.full_name}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">DNI: {student.dni || "Sin DNI"}</p>
        {student.categorias.length > 0 ? (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {student.categorias.map((categoria) => (
              <span key={categoria} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                {categoria}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500">Sin actividad asignada</p>
        )}
        <p className="mt-5 text-lg font-semibold text-emerald-700 dark:text-emerald-300">{hora}</p>
        <button
          type="button"
          onClick={onNuevo}
          className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-4 font-bold text-white hover:opacity-90 dark:bg-white dark:text-slate-900 sm:w-auto sm:min-w-64"
        >
          Nuevo ingreso
        </button>
      </div>
    </section>
  );
}

export function IngresoClient() {
  const [mode, setMode] = useState<Mode>("buscar");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<IngresoAlumno[]>([]);
  const [message, setMessage] = useState<Feedback | null>(null);
  const [confirmed, setConfirmed] = useState<IngresoConfirmacion | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef<Map<string, IngresoAlumno[]>>(new Map());

  useEffect(() => {
    if (mode !== "buscar" || confirmed) return;
    const value = term.trim();
    if (value.length < 2) {
      setResults([]);
      return;
    }
    const cacheKey = value.toLocaleLowerCase();
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResults(cached);
      setMessage(null);
      return;
    }

    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const result = await buscarAlumnosIngreso(value);
        cacheRef.current.set(cacheKey, result.data);
        setResults(result.data);
        if (result.error) setMessage({ ok: false, text: result.error });
      });
    }, 260);
    return () => window.clearTimeout(timer);
  }, [term, mode, confirmed]);

  function nuevoIngreso() {
    setConfirmed(null);
    setMessage(null);
    setTerm("");
    setResults([]);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function registrarAlumno(alumno: IngresoAlumno) {
    setMessage(null);
    startTransition(async () => {
      const result = await registrarIngresoRapido(alumno.id);
      if (result.error || !result.student) {
        setMessage({ ok: false, text: result.error || "No se pudo registrar el ingreso." });
        return;
      }
      setConfirmed(result.student);
      setTerm("");
      setResults([]);
    });
  }

  function procesarCodigo(codigo: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await registrarIngresoPorCodigo(codigo);
      if (result.error || !result.student) {
        setMessage({ ok: false, text: result.error || "No se pudo registrar el ingreso." });
        return;
      }
      setConfirmed(result.student);
    });
  }

  if (confirmed) {
    return <ConfirmacionIngreso student={confirmed} onNuevo={nuevoIngreso} />;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
        <button type="button" onClick={() => { setMode("buscar"); setMessage(null); }} className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${mode === "buscar" ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"}`}>
          🔎 Buscar alumno
        </button>
        <button type="button" onClick={() => { setMode("escanear"); setMessage(null); }} className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${mode === "escanear" ? "bg-white shadow-sm dark:bg-slate-900" : "text-slate-500"}`}>
          📷 Escanear carnet
        </button>
      </div>

      {mode === "buscar" ? (
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <label htmlFor="ingreso-search" className="mb-2 block text-sm font-semibold">DNI o nombre del alumno</label>
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
          {isPending && <p className="mt-2 text-xs text-slate-500">Procesando…</p>}

          {results.length > 0 && (
            <div className="mt-3 space-y-2">
              {results.map((alumno) => (
                <button key={alumno.id} type="button" onClick={() => registrarAlumno(alumno)} disabled={isPending} className="flex w-full items-center justify-between rounded-xl border p-4 text-left hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800">
                  <span>
                    <span className="block font-semibold">{alumno.full_name}</span>
                    <span className="text-sm text-slate-500">{alumno.dni || "Sin DNI"}</span>
                  </span>
                  <span className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">Registrar</span>
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
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-center font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">
          {message.text}
          {message.text.includes("inactivo") && <p className="mt-1 text-xs font-normal">No se registró el ingreso.</p>}
        </div>
      )}

      <div className="flex justify-center gap-4 text-sm">
        <Link href="/alumnos" className="font-semibold underline underline-offset-4">Ver alumnos</Link>
        <Link href="/asistencia" className="font-semibold underline underline-offset-4">Ir a asistencia</Link>
      </div>
    </div>
  );
}
