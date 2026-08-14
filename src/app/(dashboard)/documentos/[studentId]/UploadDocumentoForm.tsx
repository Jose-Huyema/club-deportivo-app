"use client";

import { useState, useRef, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select, ErrorText } from "@/components/ui/FormField";
import { TIPOS_DOCUMENTO } from "@/lib/data/documentos";
import { subirDocumento } from "./actions";

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
