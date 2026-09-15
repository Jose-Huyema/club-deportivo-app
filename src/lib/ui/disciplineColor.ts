// Paleta categórica para diferenciar disciplinas a simple vista en listados
// (no tiene significado semántico, a diferencia de success/warn).
const DISCIPLINE_PALETTE = [
  "#1D7A73", // teal
  "#3A5BA0", // indigo
  "#8B5E3C", // tierra
  "#6E1F2E", // bordó (marca)
  "#4F7A28", // verde oliva
  "#7A4F91", // violeta
] as const;

export function colorForDisciplina(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return DISCIPLINE_PALETTE[hash % DISCIPLINE_PALETTE.length];
}
