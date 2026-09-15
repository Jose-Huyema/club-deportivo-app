export type NavIconName = "asistencia" | "alumnos" | "inventario" | "documentos" | "reportes" | "ingreso";

export type NavItem = {
  key: string;
  href: string;
  label: string;
  iconName: NavIconName;
};

// Todas las secciones posibles. Cada usuario ve solo las que tenga en
// profile.allowed_views. "ingreso" es una vista aparte de "asistencia":
// el portero solo tiene esa, no el resto de asistencia.
export const ALL_NAV_ITEMS: NavItem[] = [
  { key: "asistencia", href: "/asistencia", label: "Asistencia", iconName: "asistencia" },
  { key: "alumnos", href: "/alumnos", label: "Alumnos", iconName: "alumnos" },
  { key: "inventario", href: "/inventario", label: "Inventario", iconName: "inventario" },
  { key: "documentos", href: "/documentos", label: "Documentos", iconName: "documentos" },
  { key: "reportes", href: "/reportes", label: "Reportes", iconName: "reportes" },
  { key: "ingreso", href: "/asistencia/scanner", label: "Control de ingreso", iconName: "ingreso" },
];

export const USUARIOS_ITEM = { href: "/usuarios", label: "Usuarios" };
export const CONFIGURACION_ITEM = { href: "/admin/general", label: "Configuración" };

export const ALL_VIEW_KEYS = ["asistencia", "alumnos", "inventario", "documentos", "reportes", "ingreso"] as const;
export type ViewKey = (typeof ALL_VIEW_KEYS)[number];
