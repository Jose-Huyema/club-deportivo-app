import { createClient } from "@/lib/supabase/server";
import type { Role, Genero } from "@/lib/roles";

export type InvitacionPendiente = {
  email: string;
  role: Role;
  genero: Genero;
  created_at: string;
};

export async function getInvitacionesPendientes(): Promise<InvitacionPendiente[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("invited_emails")
    .select("email, role, genero, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}
