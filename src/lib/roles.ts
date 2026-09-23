export type Role = "admin" | "profe" | "operador" | "portero";
export type Genero = "M" | "F" | null;

export function puedeEditar(role: Role) {
  return role === "admin" || role === "operador";
}

/** Permiso operativo: puede tomar/guardar/finalizar asistencia.
 * La categoría se valida por separado para profesores.
 */
export function puedeGestionarAsistencia(role: Role) {
  return role === "admin" || role === "operador" || role === "profe";
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
export function vistasPorDefecto(role: Role): string[] {
  if (role === "admin") return ["asistencia", "alumnos", "inventario", "documentos", "reportes", "cuotas"];
  if (role === "operador") return ["alumnos", "documentos", "reportes", "cuotas"];
  if (role === "portero") return ["ingreso"];
  return ["asistencia", "alumnos", "inventario"];
}

