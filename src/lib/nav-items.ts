import { CalendarCheck, Users, Package, Shield, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// Archivo SIN "use client": son datos planos, no componentes. Por eso puede
// importarse y manipularse directo (spread, map, etc.) desde Server Components
// como el layout del dashboard.
export const NAV_ITEMS: NavItem[] = [
  { href: "/asistencia", label: "Asistencia", icon: CalendarCheck },
  { href: "/alumnos", label: "Alumnos", icon: Users },
  { href: "/inventario", label: "Inventario", icon: Package },
];

export const ADMIN_NAV_ITEM: NavItem = {
  href: "/admin/usuarios",
  label: "Admin",
  icon: Shield,
};
