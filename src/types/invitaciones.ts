import type { Role, Genero } from "@/lib/roles";

export type InvitacionPendiente = {
  email: string;
  role: Role;
  genero: Genero;
  created_at: string;
};
