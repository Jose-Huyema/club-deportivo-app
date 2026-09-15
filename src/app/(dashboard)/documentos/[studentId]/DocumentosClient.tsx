"use client";

import { useState, useRef, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Card, Badge, Button, Label, Select, ErrorText } from "@/components/ui";
import { TIPOS_DOCUMENTO, type DocumentoAlumno } from "@/lib/documento-types";
import { subirDocumento, eliminarDocumento } from "./actions";

/* ───────────────────────── Subir documento ───────────────────────── */

export function UploadDocumentoForm({ studentId }: { studentId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [tipo, setTipo] = useState("seguro");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await subirDocumento(studentId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <Card>
      <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Subir documento</p>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="tipo">Tipo de documento</Label>
          <Select id="tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="file">Archivo (máx. 10 MB)</Label>
          <input
            id="file"
            name="file"
            type="file"
            required
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:file:bg-slate-700"
          />
        </div>
        <ErrorText>{error}</ErrorText>
        {success && <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Documento subido.</p>}
        <Button type="submit" loading={isPending}>
          Subir
        </Button>
      </form>
    </Card>
  );
}

/* ───────────────────────── Fila de documento (descargar / eliminar) ───────────────────────── */

export function DocumentoRow({ documento, studentId }: { documento: DocumentoAlumno; studentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const tipoLabel = TIPOS_DOCUMENTO.find((t) => t.value === documento.tipo)?.label ?? documento.tipo;

  function handleEliminar() {
    if (!window.confirm(`¿Eliminar "${documento.file_name}"? Esta acción no se puede deshacer.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await eliminarDocumento(documento.id, studentId, documento.file_path);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Card className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{documento.file_name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {documento.uploaded_by_name ?? "—"} · {new Date(documento.created_at).toLocaleDateString("es-AR")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone="neutral">{tipoLabel}</Badge>
          <a
            href={`/documentos/${studentId}/${documento.id}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            title="Descargar"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={handleEliminar}
            disabled={isPending}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-900/20"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </Card>
  );
}
