import { DesktopNavLink, MobileNavLink, NAV_ITEMS, ADMIN_NAV_ITEM } from "@/components/layout/NavLinks";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // ── Versión temporal de diagnóstico: reemplaza a requireProfile() ──
  // Envuelve cada paso en try/catch y muestra el error real en pantalla
  // en vez de dejar que explote sin detalle. SACAR esto una vez resuelto.
  let profile: { id: string; email: string; full_name: string; role: "admin" | "profe" };

  try {
    const supabase = createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      return <DebugError etapa="auth.getUser()" error={userError} />;
    }
    if (!userData.user) {
      redirect("/login");
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", userData.user.id)
      .single();

    if (profileError) {
      return <DebugError etapa="consulta a profiles" error={profileError} />;
    }
    if (!profileData) {
      return <DebugError etapa="perfil no encontrado" error={{ userId: userData.user.id }} />;
    }

    profile = profileData as typeof profile;
  } catch (err: any) {
    return <DebugError etapa="excepción no controlada" error={{ message: err?.message, stack: err?.stack }} />;
  }
  // ── Fin de la versión temporal ──

  const navItems = profile.role === "admin" ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-primary p-4 md:flex">
        <div className="mb-6 px-3">
          <p className="text-lg font-bold text-white">Club Deportivo</p>
          <p className="text-xs text-slate-400">{profile.full_name}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <DesktopNavLink key={item.href} item={item} />
          ))}
        </nav>
        <SignOutButton />
      </aside>

      <div className="flex-1 pb-20 md:pb-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <p className="font-bold text-primary">Club Deportivo</p>
          <p className="text-xs text-slate-500">{profile.full_name}</p>
        </header>
        <main className="mx-auto max-w-4xl p-4">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 flex border-t border-slate-200 bg-white md:hidden">
        {navItems.map((item) => (
          <MobileNavLink key={item.href} item={item} />
        ))}
      </nav>
    </div>
  );
}

function DebugError({ etapa, error }: { etapa: string; error: unknown }) {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-lg font-bold text-red-700">Error de diagnóstico</h1>
      <p className="mb-3 text-sm text-slate-600">
        Falló en: <strong>{etapa}</strong>
      </p>
      <pre className="overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-red-300">
        {JSON.stringify(error, null, 2)}
      </pre>
      <p className="mt-4 text-xs text-slate-400">
        Este es un layout temporal de diagnóstico. Sacalo una vez resuelto el problema.
      </p>
    </div>
  );
}
