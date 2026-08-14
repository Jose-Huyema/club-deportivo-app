"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select, ErrorText } from "@/components/ui/FormField";
import { autorizarGoogle } from "./actions";

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
