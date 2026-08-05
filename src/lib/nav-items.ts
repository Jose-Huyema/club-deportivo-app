export type NavIconName = "asistencia" | "alumnos" | "inventario" | "admin";

export type NavItem = {
  href: string;
  label: string;
  iconName: NavIconName;
};

// Archivo SIN "use client": son datos planos (strings), no componentes ni
// funciones, así que un Server Component puede manipularlos (spread, map)
// sin problema, y también se pueden pasar como prop a un Client Component
// porque son serializables.
export const NAV_ITEMS: NavItem[] = [
  { href: "/asistencia", label: "Asistencia", iconName: "asistencia" },
  { href: "/alumnos", label: "Alumnos", iconName: "alumnos" },
  { href: "/inventario", label: "Inventario", iconName: "inventario" },
];

export const ADMIN_NAV_ITEM: NavItem = {
  href: "/admin/usuarios",
  label: "Admin",
  iconName: "admin",
};
