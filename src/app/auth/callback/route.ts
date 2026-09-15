import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Ruta a la que Supabase redirige después de validar un login (Google,
 * magic link, invitación por contraseña, recuperación). Por defecto manda
 * a "/" — el flujo de invitación por contraseña pisa esto explícitamente
 * con ?next=/actualizar-password.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);

    // Si el código "ya fue usado", puede ser que el navegador haya llegado
    // dos veces a esta URL (prefetch, doble navegación) y la primera vez
    // ya haya iniciado sesión con éxito. Antes de mostrar error, chequeamos
    // si de hecho ya hay una sesión válida.
    const yaUsado = error.message?.toLowerCase().includes("already") || (error as any).code === "flow_state_already_used";
    if (yaUsado) {
      const { data } = await supabase.auth.getUser();
      if (data.user) return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=invite_link_invalid`);
}
