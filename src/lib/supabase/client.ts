import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para Client Components ("use client").
 * Usar en hooks, formularios interactivos, listeners en tiempo real, etc.
 *
 * NOTA: sin el genérico <Database> hasta generar los tipos reales con
 *   npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.types.ts
 * Una vez generados, se puede tipar como createBrowserClient<Database>(...)
 * para tener autocompletado y chequeo de columnas.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
