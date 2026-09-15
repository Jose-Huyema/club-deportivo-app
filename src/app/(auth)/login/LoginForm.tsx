"use client";

import { useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, ErrorText } from "@/components/ui/FormField";
import { Card } from "@/components/ui/Card";

export function LoginForm() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const errorUrl = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : "No pudimos iniciar sesión. Probá de nuevo."
      );
      setLoading(false);
      return;
    }

    window.location.href = "/";
  }

  async function handleGoogle() {
    setLoadingGoogle(true);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError("No se pudo iniciar sesión con Google. Probá de nuevo.");
      setLoadingGoogle(false);
    }
    // Si no hubo error, el navegador ya está siendo redirigido a Google.
  }

  return (
    <Card className="border-0 shadow-lg">
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleGoogle}
        loading={loadingGoogle}
      >
        <svg viewBox="0 0 48 48" className="h-4 w-4">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.3 0 10.2-2 13.9-5.3l-6.4-5.4C29.4 35.4 26.8 36 24 36c-5.4 0-9.9-3.4-11.6-8.2l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.4 5.4C39.9 37 44 31.4 44 24c0-1.3-.1-2.7-.4-3.5z"/>
        </svg>
        Continuar con Google
      </Button>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-xs text-slate-400">o con tu email</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      {errorUrl === "no_autorizado" && (
        <p className="mb-3 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Ese Gmail no está autorizado. Pedile a un administrador que te agregue en Usuarios.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="profe@club.com" />
        </div>
        <div className="mb-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="mt-4 w-full" loading={loading}>
          Iniciar sesión
        </Button>
      </form>
    </Card>
  );
}
