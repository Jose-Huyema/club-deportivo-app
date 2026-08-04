/**
 * Este archivo es un PLACEHOLDER.
 *
 * Generalo/actualizalo con:
 *   npx supabase login
 *   npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.types.ts
 *
 * Corré ese comando cada vez que cambies el esquema en Supabase para que
 * el tipado de TypeScript quede sincronizado con la base real.
 */
export type Database = {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
