import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ActualizarPasswordForm } from "./ActualizarPasswordForm";

export default async function ActualizarPasswordPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  // Si no hay sesión (el link venció o ya se usó), no tiene sentido esta pantalla.
  if (error || !data.user) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Elegí tu contraseña</h1>
          <p className="mt-1 text-sm text-slate-300">Para poder ingresar a partir de ahora.</p>
        </div>
        <ActualizarPasswordForm />
      </div>
    </div>
  );
}
