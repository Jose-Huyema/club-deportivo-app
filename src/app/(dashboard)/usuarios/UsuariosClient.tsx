"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Mail, Send, Trash2 } from "lucide-react";
import { Card, Badge, Button, Label, Input, Select, ErrorText } from "@/components/ui";
import { labelRol } from "@/lib/roles";
import type { InvitacionPendiente } from "@/lib/data/misc";
import type { ProfesorConCategorias, Categoria } from "@/lib/data/admin";
import {
  autorizarGoogle,
  invitarUsuario,
  cancelarAutorizacionPendiente,
  toggleAsignacion,
  cambiarRol,
  actualizarVistas,
  alternarHabilitado,
  actualizarGenero,
  actualizarEmail,
  reenviarInvitacion,
  eliminarUsuario,
} from "./actions";

/* ───────────────────────── Autorizar acceso con Google ───────────────────────── */

export function AutorizarGoogleForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"profe" | "admin" | "operador" | "portero">("profe");
  const [genero, setGenero] = useState<"M" | "F" | "">("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await autorizarGoogle(email, role, genero);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setEmail("");
      router.refresh();
    });
  }

  return (
    <Card className="mb-4">
      <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Autorizar acceso con Google</p>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        No se manda ningún mail. Avisale vos a la persona que entre a la app y toque "Continuar con Google" con esta cuenta.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="googleEmail">Gmail a autorizar</Label>
          <Input id="googleEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="persona@gmail.com" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="googleRole">Rol</Label>
            <Select id="googleRole" value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="profe">Profe</option>
              <option value="operador">Operador</option>
              <option value="portero">Portero</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          {role === "profe" && (
            <div>
              <Label htmlFor="googleGenero">Género (opcional)</Label>
              <Select id="googleGenero" value={genero} onChange={(e) => setGenero(e.target.value as "M" | "F" | "")}>
                <option value="">—</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </Select>
            </div>
          )}
        </div>
        <ErrorText>{error}</ErrorText>
        {success && <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Email autorizado.</p>}
        <Button type="submit" loading={isPending}>
          Autorizar
        </Button>
      </form>
    </Card>
  );
}

/* ───────────────────────── Invitar por email y contraseña ───────────────────────── */

export function InvitarUsuarioForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"profe" | "admin" | "operador" | "portero">("profe");
  const [genero, setGenero] = useState<"M" | "F" | "">("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await invitarUsuario(email, fullName, role, genero);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setEmail("");
      setFullName("");
      router.refresh();
    });
  }

  return (
    <Card>
      <p className="mb-3 text-sm font-semibold text-slate-700">Invitar nuevo usuario</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="fullName">Nombre completo</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej: María Gómez" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="maria@club.com" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="role">Rol</Label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as "profe" | "admin" | "operador" | "portero")}>
              <option value="profe">Profe</option>
              <option value="operador">Operador</option>
              <option value="portero">Portero</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="genero">Género (opcional)</Label>
            <Select id="genero" value={genero} onChange={(e) => setGenero(e.target.value as "M" | "F" | "")}>
              <option value="">—</option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
            </Select>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          El género solo se usa para mostrar "Profesor" o "Profesora" en vez de "Profe" genérico.
        </p>
        <ErrorText>{error}</ErrorText>
        {success && (
          <p className="text-sm font-medium text-emerald-700">
            Invitación enviada. Le va a llegar un mail para elegir su contraseña.
          </p>
        )}
        <Button type="submit" loading={isPending}>
          Enviar invitación
        </Button>
      </form>
    </Card>
  );
}

/* ───────────────────────── Invitaciones de Google pendientes ───────────────────────── */

export function PendientesGoogleList({ pendientes }: { pendientes: InvitacionPendiente[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancelar(email: string) {
    setError(null);
    startTransition(async () => {
      const result = await cancelarAutorizacionPendiente(email);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  if (pendientes.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Esperando primer login con Google ({pendientes.length})
      </p>
      <div className="space-y-2">
        {pendientes.map((p) => (
          <Card key={p.email} className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.email}</p>
              <Badge tone="warning">{labelRol(p.role, p.genero)}</Badge>
            </div>
            <button
              type="button"
              onClick={() => handleCancelar(p.email)}
              disabled={isPending}
              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
            >
              Cancelar
            </button>
          </Card>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

/* ───────────────────────── Tarjeta de usuario registrado ───────────────────────── */

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
  const router = useRouter();
  const [asignadas, setAsignadas] = useState(new Set(usuario.categoria_ids));
  const [role, setRole] = useState(usuario.role);
  const [genero, setGenero] = useState(usuario.genero);
  const [vistas, setVistas] = useState(new Set(usuario.allowed_views));
  const [habilitado, setHabilitado] = useState(usuario.habilitado);
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(usuario.email);
  const [emailActual, setEmailActual] = useState(usuario.email);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

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

  function handleCambiarRol(nuevoRol: "admin" | "profe" | "operador" | "portero") {
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

  function handleGuardarEmail() {
    setError(null);
    startTransition(async () => {
      const result = await actualizarEmail(usuario.id, emailInput);
      if (result.error) {
        setError(result.error);
        return;
      }
      setEmailActual(emailInput);
      setEditandoEmail(false);
    });
  }

  function handleReenviarInvitacion() {
    setError(null);
    setAviso(null);
    startTransition(async () => {
      const result = await reenviarInvitacion(emailActual);
      if (result.error) {
        setError(result.error);
      } else {
        setAviso("Invitación reenviada.");
      }
    });
  }

  function handleEliminar() {
    if (!window.confirm(`¿Eliminar a ${usuario.full_name} definitivamente? Esta acción no se puede deshacer.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await eliminarUsuario(usuario.id);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Card className={!habilitado ? "opacity-60" : undefined}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-slate-900 dark:text-slate-100">{usuario.full_name}</p>

          {editandoEmail ? (
            <div className="mt-1 flex items-center gap-1.5">
              <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="py-1 text-sm" />
              <Button variant="secondary" onClick={handleGuardarEmail} loading={isPending} className="shrink-0 px-2 py-1.5 text-xs">
                Guardar
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setEmailInput(emailActual); setEditandoEmail(true); }}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-accent dark:text-slate-400"
            >
              <Mail className="h-3.5 w-3.5" /> {emailActual}
            </button>
          )}

          <p className="mt-0.5 text-xs font-medium text-accent">{labelRol(role, genero)}</p>
          {!usuario.confirmado && (
            <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">Todavía no confirmó su cuenta</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <Select value={role} onChange={(e) => handleCambiarRol(e.target.value as any)} disabled={isPending} className="w-auto">
            <option value="profe">Profe</option>
            <option value="operador">Operador</option>
            <option value="portero">Portero</option>
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

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleToggleHabilitado} disabled={isPending}>
          <Badge tone={habilitado ? "success" : "danger"}>
            {habilitado ? "Habilitado" : "Deshabilitado"}
          </Badge>
        </button>

        {!usuario.confirmado && (
          <button
            type="button"
            onClick={handleReenviarInvitacion}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:border-accent hover:text-accent disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
          >
            <Send className="h-3 w-3" /> Reenviar invitación
          </button>
        )}

        <button
          type="button"
          onClick={handleEliminar}
          disabled={isPending}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <Trash2 className="h-3 w-3" /> Eliminar
        </button>
      </div>

      {aviso && <p className="mb-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">{aviso}</p>}

      {role !== "portero" && (
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
                    activa
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {categorias.length > 0 && role !== "portero" && (
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
                    activa
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </Card>
  );
}
