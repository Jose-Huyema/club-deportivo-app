export type NavIconName = "asistencia" | "alumnos" | "inventario" | "documentos" | "reportes";

export type NavItem = {
  href: string;
  label: string;
  iconName: NavIconName;
};

// Todas las secciones posibles. Cada usuario ve solo las que tenga en
// profile.allowed_views (la lista de "vistas permitidas" que asigna el admin).
export const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/asistencia", label: "Asistencia", iconName: "asistencia" },
  { href: "/alumnos", label: "Alumnos", iconName: "alumnos" },
  { href: "/inventario", label: "Inventario", iconName: "inventario" },
  { href: "/documentos", label: "Documentos", iconName: "documentos" },
  { href: "/reportes", label: "Reportes", iconName: "reportes" },
];

// Exclusivos de admin: separados entre sí a propósito.
// Usuarios = gente, roles, vistas, habilitación.
// Configuración = parámetros globales del sistema (nombre, categorías, disciplinas).
export const USUARIOS_ITEM = { href: "/usuarios", label: "Usuarios" };
export const CONFIGURACION_ITEM = { href: "/admin/general", label: "Configuración" };

export const ALL_VIEW_KEYS = ["asistencia", "alumnos", "inventario", "documentos", "reportes"] as const;
export type ViewKey = (typeof ALL_VIEW_KEYS)[number];
