"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, Select, ErrorText } from "@/components/ui/FormField";
import { invitarUsuario } from "./actions";

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
