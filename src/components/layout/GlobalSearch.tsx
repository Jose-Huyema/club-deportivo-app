"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { buscarAlumnosGlobal, type BusquedaAlumno } from "@/app/(dashboard)/buscar/actions";

export function GlobalSearch() {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<BusquedaAlumno[]>([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef<Map<string, BusquedaAlumno[]>>(new Map());
  const requestRef = useRef(0);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const value = term.trim();
    if (value.length < 2) {
      setResults([]);
      setMessage(null);
      return;
    }

    const cacheKey = value.toLocaleLowerCase();
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResults(cached);
      setMessage(null);
      setOpen(true);
      return;
    }

    const timer = window.setTimeout(() => {
      const requestId = ++requestRef.current;
      startTransition(async () => {
        const result = await buscarAlumnosGlobal(value);
        if (requestId !== requestRef.current) return;
        if (!result.error) cacheRef.current.set(cacheKey, result.data);
        setResults(result.data);
        setMessage(result.error);
        setOpen(true);
      });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [term]);

  function clear() {
    setTerm("");
    setResults([]);
    setMessage(null);
    setOpen(false);
  }

  return (
    <div className="relative w-full min-w-0">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          value={term}
          onFocus={() => setOpen(term.trim().length >= 2)}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar alumno por nombre o DNI…"
          aria-label="Buscar alumno por nombre o DNI"
          className="w-full rounded-xl border border-white/10 bg-white/10 px-10 py-2.5 text-sm text-white placeholder:text-slate-400 outline-none focus:border-white/30 focus:bg-white/15"
        />
        {isPending && <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-slate-300">Buscando…</span>}
        {term && !isPending && (
          <button type="button" onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-300 hover:bg-white/10" aria-label="Limpiar búsqueda">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (results.length > 0 || message || (term.trim().length >= 2 && !isPending)) && (
        <div className="absolute left-0 right-0 top-full z-[80] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:ring-white/5">
          {message ? (
            <p className="p-4 text-sm text-red-600 dark:text-red-300">{message}</p>
          ) : results.length === 0 ? (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400">No encontramos alumnos.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {results.map((student) => (
                <Link
                  key={student.id}
                  href={`/alumnos/${student.id}`}
                  onClick={() => setOpen(false)}
                  className="block border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900 dark:text-white">{student.full_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">DNI: {student.dni || "Sin DNI"}</p>
                      {student.categorias.length > 0 && (
                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{student.categorias.join(" · ")}</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${student.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                      {student.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
