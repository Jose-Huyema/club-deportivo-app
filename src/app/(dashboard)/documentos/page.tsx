import { requireProfile } from "@/lib/data/profile";
import { EmptyState } from "@/components/ui/EmptyState";
import { redirect } from "next/navigation";

export default async function DocumentosPage() {
  const profile = await requireProfile();
  if (!profile.allowed_views.includes("documentos")) redirect("/asistencia");

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary">Documentos</h1>
      <p className="mb-5 text-sm text-slate-500">
        Seguros, foto de DNI, autorizaciones y comunicados por alumno.
      </p>
      <EmptyState
        title="Próximamente"
        description="Este módulo necesita un paso previo en Supabase (crear un espacio de almacenamiento de archivos) antes de poder subir documentos. Pedile a tu desarrollador que lo active."
      />
    </div>
  );
}
