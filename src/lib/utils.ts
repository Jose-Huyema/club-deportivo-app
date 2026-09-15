import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// clsx solo concatena clases; si dos clases de Tailwind chocan (ej. "bg-white"
// del componente y "bg-primary" que le pasás por className), gana la que
// termine más abajo en el CSS compilado, no la que vos escribiste último.
// twMerge resuelve ese choque a favor de la última clase pasada, que es el
// comportamiento esperado al sobrescribir estilos vía props.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
