import { requireAdmin } from "@/lib/data/profile";
import { getProfesores, getCategorias } from "@/lib/data/admin";
import { EmptyState } from "@/components/ui/EmptyState";
import { InvitarUsuarioForm } from "./InvitarUsuarioForm";
import { UsuarioCard } from "./UsuarioCard";

export default async function UsuariosAdminPage() {
  await requireAdmin();
  const [usuarios, categorias] = await Promise.all([getProfesores(), getCategorias()]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary">Usuarios</h1>
      <p className="mb-5 text-sm text-slate-500">
        Invitá profesores o administradores y asigná qué categorías puede ver cada uno.
      </p>

      <InvitarUsuarioForm />

      <h2 className="mb-2 mt-6 text-sm font-semibold text-slate-700">Usuarios registrados</h2>
      {usuarios.length === 0 ? (
        <EmptyState title="Todavía no hay usuarios" />
      ) : (
        <div className="space-y-3">
          {usuarios.map((u) => (
            <UsuarioCard key={u.id} usuario={u} categorias={categorias} />
          ))}
        </div>
      )}
    </div>
  );
}
