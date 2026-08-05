import { requireProfile } from "@/lib/data/profile";
import { getCategoriasParaAsistencia } from "@/lib/data/asistencia";

export default async function AsistenciaPage() {
  const profile = await requireProfile();
  const categorias = await getCategoriasParaAsistencia(profile.id, profile.role);

  return (
    <div>
      <h1>Asistencia (versión mínima de diagnóstico)</h1>
      <p>Categorías encontradas: {categorias.length}</p>
      <ul>
        {categorias.map((c) => (
          <li key={c.id}>{c.name} — {c.discipline_name}</li>
        ))}
      </ul>
    </div>
  );
}
