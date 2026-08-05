import { requireProfile } from "@/lib/data/profile";
import { NAV_ITEMS, ADMIN_NAV_ITEM } from "@/lib/nav-items";
import { DesktopNavLink, MobileNavLink } from "@/components/layout/NavLinks";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { Watermark } from "@/components/layout/Watermark";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const navItems = profile.role === "admin" ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 md:flex">
      <Watermark />

      <aside className="relative z-10 hidden w-64 shrink-0 flex-col bg-primary p-4 md:flex">
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

      <div className="relative z-10 flex-1 pb-20 md:pb-0">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <p className="font-bold text-primary">Club Deportivo</p>
          <p className="text-xs text-slate-500">{profile.full_name}</p>
        </header>
        <main className="mx-auto max-w-4xl p-4">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white md:hidden">
        {navItems.map((item) => (
          <MobileNavLink key={item.href} item={item} />
        ))}
      </nav>
    </div>
  );
}
