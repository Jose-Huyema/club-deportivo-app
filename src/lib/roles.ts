/**
 * Funciones puras sobre roles, SIN ninguna dependencia de servidor
 * (nada de cookies, nada de Supabase). Por eso viven en su propio archivo:
 * así se pueden importar tanto desde Server Components como desde
 * Client Components sin arrastrar next/headers al bundle del navegador.
 */

export type Role = "admin" | "profe" | "operador";
export type Genero = "M" | "F" | null;

export function puedeEditar(role: Role) {
  return role === "admin" || role === "operador";
}

/**
 * Etiqueta legible del rol. Para "profe" varía según género
 * (Profesor/Profesora); si no está cargado, usa "Profe" genérico.
 */
export function labelRol(role: Role, genero?: Genero): string {
  if (role === "profe") {
    if (genero === "M") return "Profesor";
    if (genero === "F") return "Profesora";
    return "Profe";
  }
  if (role === "admin") return "Admin";
  return "Operador";
}
