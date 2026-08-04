import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con la SERVICE ROLE KEY. Ignora RLS por completo.
 *
 * Reglas de uso:
 * - Solo se importa desde archivos "use server" (Server Actions) o Route Handlers.
 * - El import "server-only" hace que el build falle si por error se importa
 *   desde un Client Component, evitando que la key termine en el bundle del navegador.
 * - Antes de cualquier operación, quien la llama debe verificar explícitamente
 *   que el usuario actual tiene role = 'admin' (ver ejemplos en admin/usuarios/actions.ts).
 *
 * NOTA: sin el genérico <Database> hasta generar los tipos reales.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
