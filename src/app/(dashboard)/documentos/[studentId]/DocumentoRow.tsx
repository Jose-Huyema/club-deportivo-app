"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TIPOS_DOCUMENTO, type DocumentoAlumno } from "@/lib/data/documentos";
import { eliminarDocumento } from "./actions";

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
