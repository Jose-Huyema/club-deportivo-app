"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { labelRol } from "@/lib/data/profile";
import type { ProfesorConCategorias, Categoria } from "@/lib/data/admin";
import { toggleAsignacion, cambiarRol, actualizarVistas, alternarHabilitado, actualizarGenero } from "./actions";

const VISTAS_DISPONIBLES: { key: string; label: string }[] = [
  { key: "asistencia", label: "Asistencia" },
  { key: "alumnos", label: "Alumnos" },
  { key: "inventario", label: "Inventario" },
  { key: "documentos", label: "Documentos" },
  { key: "reportes", label: "Reportes" },
];

export function UsuarioCard({
  usuario,
  categorias,
}: {
  usuario: ProfesorConCategorias;
  categorias: Categoria[];
}) {
  const [asignadas, setAsignadas] = useState(new Set(usuario.categoria_ids));
  const [role, setRole] = useState(usuario.role);
  const [genero, setGenero] = useState(usuario.genero);
  const [vistas, setVistas] = useState(new Set(usuario.allowed_views));
  const [habilitado, setHabilitado] = useState(usuario.habilitado);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggleCategoria(categoryId: string) {
    const yaAsignada = asignadas.has(categoryId);
    setError(null);
    setAsignadas((prev) => {
      const next = new Set(prev);
      yaAsignada ? next.delete(categoryId) : next.add(categoryId);
      return next;
    });
    startTransition(async () => {
      const result = await toggleAsignacion(usuario.id, categoryId, !yaAsignada);
      if (result.error) {
        setError(result.error);
        setAsignadas((prev) => {
          const next = new Set(prev);
          yaAsignada ? next.add(categoryId) : next.delete(categoryId);
          return next;
        });
      }
    });
  }

  function handleCambiarRol(nuevoRol: "admin" | "profe" | "operador") {
    const anterior = role;
    setError(null);
    setRole(nuevoRol);
    startTransition(async () => {
      const result = await cambiarRol(usuario.id, nuevoRol);
      if (result.error) {
        setError(result.error);
        setRole(anterior);
      }
    });
  }

  function handleCambiarGenero(nuevoGenero: "M" | "F" | "") {
    const anterior = genero;
    setError(null);
    const valor = nuevoGenero || null;
    setGenero(valor);
    startTransition(async () => {
      const result = await actualizarGenero(usuario.id, valor);
      if (result.error) {
        setError(result.error);
        setGenero(anterior);
      }
    });
  }

  function handleToggleVista(key: string) {
    const tenia = vistas.has(key);
    setError(null);
    const nuevasVistas = new Set(vistas);
    tenia ? nuevasVistas.delete(key) : nuevasVistas.add(key);
    setVistas(nuevasVistas);
    startTransition(async () => {
      const result = await actualizarVistas(usuario.id, Array.from(nuevasVistas));
      if (result.error) {
        setError(result.error);
        setVistas(new Set(vistas));
      }
    });
  }

  function handleToggleHabilitado() {
    const anterior = habilitado;
    setError(null);
    setHabilitado(!anterior);
    startTransition(async () => {
      const result = await alternarHabilitado(usuario.id, !anterior);
      if (result.error) {
        setError(result.error);
        setHabilitado(anterior);
      }
    });
  }

  return (
    <Card className={!habilitado ? "opacity-60" : undefined}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{usuario.full_name}</p>
          <p className="text-sm text-slate-500">{usuario.email}</p>
          <p className="mt-0.5 text-xs font-medium text-accent">{labelRol(role, genero)}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Select value={role} onChange={(e) => handleCambiarRol(e.target.value as "admin" | "profe" | "operador")} disabled={isPending} className="w-auto">
            <option value="profe">Profe</option>
            <option value="operador">Operador</option>
            <option value="admin">Admin</option>
          </Select>
          {role === "profe" && (
            <Select value={genero ?? ""} onChange={(e) => handleCambiarGenero(e.target.value as "M" | "F" | "")} disabled={isPending} className="w-auto">
              <option value="">Género —</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </Select>
          )}
        </div>
      </div>

      <button type="button" onClick={handleToggleHabilitado} disabled={isPending} className="mb-3">
        <Badge tone={habilitado ? "success" : "danger"}>
          {habilitado ? "Habilitado — tocar para deshabilitar" : "Deshabilitado — tocar para habilitar"}
        </Badge>
      </button>

      <div className="mb-3">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Vistas permitidas</p>
        <div className="flex flex-wrap gap-2">
          {VISTAS_DISPONIBLES.map((v) => {
            const activa = vistas.has(v.key);
            return (
              <button
                key={v.key}
                type="button"
                disabled={isPending || role === "admin"}
                onClick={() => handleToggleVista(v.key)}
                title={role === "admin" ? "Los admin siempre ven todo" : undefined}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                  activa ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                )}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {categorias.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Categorías asignadas</p>
          <div className="flex flex-wrap gap-2">
            {categorias.map((c) => {
              const activa = asignadas.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggleCategoria(c.id)}
                  className={clsx(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                    activa ? "border-accent bg-accent/15 text-accent" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
