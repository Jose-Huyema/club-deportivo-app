/**
 * Tipos versionados de la base de datos de Club Deportivo (V0.5).
 *
 * Son equivalentes al esquema esperado por las migraciones 001..011.
 * Cuando el proyecto tenga SUPABASE_PROJECT_ID configurado, puede regenerarse
 * con `npm run types:generate` para sustituir este archivo por el generado por
 * Supabase CLI.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          allowed_views: string[];
          genero: "M" | "F" | null;
          autorizado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          allowed_views?: string[];
          genero?: "M" | "F" | null;
          autorizado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          allowed_views?: string[];
          genero?: "M" | "F" | null;
          autorizado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      disciplines: {
        Row: { id: string; name: string; description: string | null; created_at: string };
        Insert: { id?: string; name: string; description?: string | null; created_at?: string };
        Update: { id?: string; name?: string; description?: string | null; created_at?: string };
        Relationships: [];
      };
      categories: {
        Row: { id: string; discipline_id: string; name: string; schedule: string | null; created_at: string };
        Insert: { id?: string; discipline_id: string; name: string; schedule?: string | null; created_at?: string };
        Update: { id?: string; discipline_id?: string; name?: string; schedule?: string | null; created_at?: string };
        Relationships: [{ foreignKeyName: "categories_discipline_id_fkey"; columns: ["discipline_id"]; isOneToOne: false; referencedRelation: "disciplines"; referencedColumns: ["id"] }];
      };
      professor_categories: {
        Row: { id: string; professor_id: string; category_id: string };
        Insert: { id?: string; professor_id: string; category_id: string };
        Update: { id?: string; professor_id?: string; category_id?: string };
        Relationships: [
          { foreignKeyName: "professor_categories_professor_id_fkey"; columns: ["professor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "professor_categories_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }
        ];
      };
      students: {
        Row: {
          id: string; full_name: string; birth_date: string | null; tutor_name: string | null;
          emergency_phone: string; medical_notes: string | null; is_active: boolean; created_at: string;
          dni: string | null; phone: string | null; address: string | null; height_cm: number | null;
          weight_kg: number | null; clothing_size: string | null;
        };
        Insert: {
          id?: string; full_name: string; birth_date?: string | null; tutor_name?: string | null;
          emergency_phone: string; medical_notes?: string | null; is_active?: boolean; created_at?: string;
          dni?: string | null; phone?: string | null; address?: string | null; height_cm?: number | null;
          weight_kg?: number | null; clothing_size?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
        Relationships: [];
      };
      enrollments: {
        Row: { id: string; student_id: string; category_id: string; enrolled_at: string };
        Insert: { id?: string; student_id: string; category_id: string; enrolled_at?: string };
        Update: { id?: string; student_id?: string; category_id?: string; enrolled_at?: string };
        Relationships: [
          { foreignKeyName: "enrollments_student_id_fkey"; columns: ["student_id"]; isOneToOne: false; referencedRelation: "students"; referencedColumns: ["id"] },
          { foreignKeyName: "enrollments_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }
        ];
      };
      attendances: {
        Row: { id: string; category_id: string; professor_id: string | null; date: string; notes: string | null; finalized: boolean; created_at: string };
        Insert: { id?: string; category_id: string; professor_id?: string | null; date?: string; notes?: string | null; finalized?: boolean; created_at?: string };
        Update: { id?: string; category_id?: string; professor_id?: string | null; date?: string; notes?: string | null; finalized?: boolean; created_at?: string };
        Relationships: [
          { foreignKeyName: "attendances_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] },
          { foreignKeyName: "attendances_professor_id_fkey"; columns: ["professor_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      attendance_details: {
        Row: { id: string; attendance_id: string; student_id: string; status: Database["public"]["Enums"]["attendance_status"] };
        Insert: { id?: string; attendance_id: string; student_id: string; status?: Database["public"]["Enums"]["attendance_status"] };
        Update: { id?: string; attendance_id?: string; student_id?: string; status?: Database["public"]["Enums"]["attendance_status"] };
        Relationships: [
          { foreignKeyName: "attendance_details_attendance_id_fkey"; columns: ["attendance_id"]; isOneToOne: false; referencedRelation: "attendances"; referencedColumns: ["id"] },
          { foreignKeyName: "attendance_details_student_id_fkey"; columns: ["student_id"]; isOneToOne: false; referencedRelation: "students"; referencedColumns: ["id"] }
        ];
      };
      inventory_items: {
        Row: { id: string; discipline_id: string | null; name: string; description: string | null; total_quantity: number; min_warning_quantity: number; updated_at: string };
        Insert: { id?: string; discipline_id?: string | null; name: string; description?: string | null; total_quantity?: number; min_warning_quantity?: number; updated_at?: string };
        Update: { id?: string; discipline_id?: string | null; name?: string; description?: string | null; total_quantity?: number; min_warning_quantity?: number; updated_at?: string };
        Relationships: [{ foreignKeyName: "inventory_items_discipline_id_fkey"; columns: ["discipline_id"]; isOneToOne: false; referencedRelation: "disciplines"; referencedColumns: ["id"] }];
      };
      inventory_movements: {
        Row: { id: string; item_id: string; user_id: string | null; type: Database["public"]["Enums"]["movement_type"]; quantity: number; notes: string | null; created_at: string };
        Insert: { id?: string; item_id: string; user_id?: string | null; type: Database["public"]["Enums"]["movement_type"]; quantity: number; notes?: string | null; created_at?: string };
        Update: { id?: string; item_id?: string; user_id?: string | null; type?: Database["public"]["Enums"]["movement_type"]; quantity?: number; notes?: string | null; created_at?: string };
        Relationships: [
          { foreignKeyName: "inventory_movements_item_id_fkey"; columns: ["item_id"]; isOneToOne: false; referencedRelation: "inventory_items"; referencedColumns: ["id"] },
          { foreignKeyName: "inventory_movements_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      checkins: {
        Row: { id: string; student_id: string; recorded_by: string | null; checked_in_at: string };
        Insert: { id?: string; student_id: string; recorded_by?: string | null; checked_in_at?: string };
        Update: { id?: string; student_id?: string; recorded_by?: string | null; checked_in_at?: string };
        Relationships: [
          { foreignKeyName: "checkins_student_id_fkey"; columns: ["student_id"]; isOneToOne: false; referencedRelation: "students"; referencedColumns: ["id"] },
          { foreignKeyName: "checkins_recorded_by_fkey"; columns: ["recorded_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      student_documents: {
        Row: { id: string; student_id: string; tipo: string; file_name: string; file_path: string; uploaded_by: string | null; created_at: string };
        Insert: { id?: string; student_id: string; tipo: string; file_name: string; file_path: string; uploaded_by?: string | null; created_at?: string };
        Update: { id?: string; student_id?: string; tipo?: string; file_name?: string; file_path?: string; uploaded_by?: string | null; created_at?: string };
        Relationships: [
          { foreignKeyName: "student_documents_student_id_fkey"; columns: ["student_id"]; isOneToOne: false; referencedRelation: "students"; referencedColumns: ["id"] },
          { foreignKeyName: "student_documents_uploaded_by_fkey"; columns: ["uploaded_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      app_settings: {
        Row: { id: number; club_name: string; club_subtitle: string; logo_url: string | null; address: string | null; phone: string | null; email: string | null; tax_id: string | null; tax_condition: string | null; footer_text: string | null; updated_at: string };
        Insert: { id?: number; club_name?: string; club_subtitle?: string; logo_url?: string | null; address?: string | null; phone?: string | null; email?: string | null; tax_id?: string | null; tax_condition?: string | null; footer_text?: string | null; updated_at?: string };
        Update: { id?: number; club_name?: string; club_subtitle?: string; logo_url?: string | null; address?: string | null; phone?: string | null; email?: string | null; tax_id?: string | null; tax_condition?: string | null; footer_text?: string | null; updated_at?: string };
        Relationships: [];
      };
      invited_emails: {
        Row: { email: string; role: Database["public"]["Enums"]["user_role"]; genero: "M" | "F" | null; allowed_views: string[]; invited_by: string | null; created_at: string };
        Insert: { email: string; role?: Database["public"]["Enums"]["user_role"]; genero?: "M" | "F" | null; allowed_views?: string[]; invited_by?: string | null; created_at?: string };
        Update: { email?: string; role?: Database["public"]["Enums"]["user_role"]; genero?: "M" | "F" | null; allowed_views?: string[]; invited_by?: string | null; created_at?: string };
        Relationships: [{ foreignKeyName: "invited_emails_invited_by_fkey"; columns: ["invited_by"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }];
      };
    };
    Views: {
      v_stock_bajo: { Row: { id: string; name: string; discipline_name: string | null; total_quantity: number; min_warning_quantity: number } };
      v_resumen_asistencia: { Row: { attendance_id: string; category_name: string; date: string; presentes: number; ausentes: number; justificados: number } };
    };
    Functions: {
      allowed_views_for_role: { Args: { p_role: Database["public"]["Enums"]["user_role"] }; Returns: string[] };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_editor: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: "admin" | "profe" | "operador" | "portero";
      attendance_status: "presente" | "ausente" | "justificado";
      movement_type: "ingreso" | "egreso" | "baja_desgaste";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
