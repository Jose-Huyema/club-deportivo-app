import { requireAdmin } from "@/lib/data/profile";
import { getProfesores, getCategorias } from "@/lib/data/admin";
import { getInvitacionesPendientes } from "@/lib/data/invitaciones";
import { EmptyState } from "@/components/ui/EmptyState";
import { AutorizarGoogleForm } from "./AutorizarGoogleForm";
import { PendientesGoogleList } from "./PendientesGoogleList";
import { InvitarUsuarioForm } from "./InvitarUsuarioForm";
import { UsuarioCard } from "./UsuarioCard";

export default async function UsuariosPage() {
  await requireAdmin();
  const [usuarios, categorias, pendientes] = await Promise.all([
    getProfesores(),
    getCategorias(),
    getInvitacionesPendientes(),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary dark:text-white">Usuarios</h1>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
        Autorizá el acceso por Gmail (recomendado) o invitá por email y contraseña.
      </p>

      <AutorizarGoogleForm />
      <PendientesGoogleList pendientes={pendientes} />

      <details className="mb-6">
        <summary className="cursor-pointer text-sm font-medium text-slate-500 dark:text-slate-400">
          Alternativa: invitar por email y contraseña
        </summary>
        <div className="mt-3">
          <InvitarUsuarioForm />
        </div>
      </details>

      <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Usuarios registrados</h2>
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
