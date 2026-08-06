"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Input, ErrorText } from "@/components/ui/FormField";
import type { AppSettings } from "@/lib/data/settings";
import { actualizarConfiguracion } from "./actions";

export function ConfiguracionGeneralForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [clubName, setClubName] = useState(settings.club_name);
  const [clubSubtitle, setClubSubtitle] = useState(settings.club_subtitle);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await actualizarConfiguracion(clubName, clubSubtitle);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="clubName">Nombre que se muestra al iniciar sesión</Label>
          <Input id="clubName" value={clubName} onChange={(e) => setClubName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="clubSubtitle">Subtítulo</Label>
          <Input id="clubSubtitle" value={clubSubtitle} onChange={(e) => setClubSubtitle(e.target.value)} />
        </div>
        <ErrorText>{error}</ErrorText>
        {success && <p className="text-sm font-medium text-emerald-700">Guardado.</p>}
        <Button type="submit" loading={isPending}>
          Guardar cambios
        </Button>
      </form>
    </Card>
  );
}
