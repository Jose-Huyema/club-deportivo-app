import { requireProfile } from "@/lib/data/profile";
import { getAppSettings } from "@/lib/data/settings";
import { ALL_NAV_ITEMS, USUARIOS_ITEM, CONFIGURACION_ITEM } from "@/lib/nav-items";
import { HomeNavLink, HorizontalNavLink, UsuariosNavLink, ConfiguracionNavLink } from "@/components/layout/NavLinks";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Watermark } from "@/components/layout/Watermark";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const settings = await getAppSettings();
  const navItems = ALL_NAV_ITEMS.filter((item) => profile.allowed_views.includes(item.key));

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900">
      <Watermark />

      <header className="relative z-10 bg-primary dark:bg-slate-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="font-bold text-white">{settings.club_name}</p>
            <p className="text-xs text-slate-400">{profile.full_name}</p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-3">
          <HomeNavLink />
          {navItems.map((item) => (
            <HorizontalNavLink key={item.href} item={item} />
          ))}
          {profile.role === "admin" && (
            <>
              <UsuariosNavLink href={USUARIOS_ITEM.href} label={USUARIOS_ITEM.label} />
              <ConfiguracionNavLink href={CONFIGURACION_ITEM.href} label={CONFIGURACION_ITEM.label} />
            </>
          )}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl p-4">{children}</main>
    </div>
  );
}
