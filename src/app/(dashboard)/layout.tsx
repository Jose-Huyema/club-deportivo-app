import { requireProfile } from "@/lib/data/profile";
import { DesktopNavLink, NAV_ITEMS, ADMIN_NAV_ITEM } from "@/components/layout/NavLinks";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const navItems = profile.role === "admin" ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <div>
      <p>Hola, {profile.full_name} (rol: {profile.role})</p>
      <nav>
        {navItems.map((item) => (
          <DesktopNavLink key={item.href} item={item} />
        ))}
      </nav>
      <hr />
      {children}
    </div>
  );
}
