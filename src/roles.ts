export type Role = "admin" | "profe" | "operador" | "portero";
export type Genero = "M" | "F" | null;

export function puedeEditar(role: Role) {
  return role === "admin" || role === "operador";
}

/** admin/operador: acceso completo al inventario. profe: solo puede registrar egresos/bajas. */
export function puedeRegistrarEgreso(role: Role) {
  return role === "admin" || role === "operador" || role === "profe";
}

export function puedeRegistrarIngreso(role: Role) {
  return role === "admin" || role === "operador" || role === "portero";
}

export function labelRol(role: Role, genero?: Genero): string {
  if (role === "profe") {
    if (genero === "M") return "Profesor";
    if (genero === "F") return "Profesora";
    return "Profe";
  }
  if (role === "portero") {
    if (genero === "F") return "Portera";
    return "Portero";
  }
  if (role === "admin") return "Admin";
  return "Operador";
}

export const DEFAULT_VIEWS_BY_ROLE: Record<Exclude<Role, "admin"> | "admin", string[]> = {
  admin: ["asistencia", "alumnos", "inventario", "documentos", "reportes", "ingreso"],
  operador: ["alumnos", "documentos", "reportes"],
  portero: ["ingreso"],
  profe: ["asistencia", "alumnos", "inventario"],
};

export function defaultViewsForRole(role: Role): string[] {
  return [...DEFAULT_VIEWS_BY_ROLE[role]];
}
