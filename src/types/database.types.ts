/**
 * Este archivo es un PLACEHOLDER genérico: le permite compilar a TypeScript
 * para CUALQUIER nombre de tabla, sin chequear los campos exactos.
 *
 * Para tener autocompletado y chequeo real de columnas, generalo con:
 *   npx supabase login
 *   npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.types.ts
 *
 * Corré ese comando cada vez que cambies el esquema en Supabase.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, any>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, any>;
        Returns: any;
      };
    };
    Enums: {
      [key: string]: string;
    };
  };
};
