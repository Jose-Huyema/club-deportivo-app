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
  const [role, setRole] = useState<"profe" | "admin" | "operador">("profe");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await invitarUsuario(email, fullName, role);
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
        <div>
          <Label htmlFor="role">Rol</Label>
          <Select id="role" value={role} onChange={(e) => setRole(e.target.value as "profe" | "admin" | "operador")}>
            <option value="profe">Profe (asistencia + lectura de alumnos e inventario)</option>
            <option value="operador">Operador (alumnos, documentos y reportes)</option>
            <option value="admin">Admin (acceso total)</option>
          </Select>
        </div>
        <ErrorText>{error}</ErrorText>
        {success && (
          <p className="text-sm font-medium text-emerald-700">
            Invitación enviada. Le va a llegar un mail para elegir su contraseña. Podés ajustar sus vistas específicas después, en la lista de abajo.
          </p>
        )}
        <Button type="submit" loading={isPending}>
          Enviar invitación
        </Button>
      </form>
    </Card>
  );
}
