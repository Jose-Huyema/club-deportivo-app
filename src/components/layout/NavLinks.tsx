"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CalendarCheck, Users, Package, Shield } from "lucide-react";
import type { NavItem, NavIconName } from "@/lib/nav-items";

// Los componentes de ícono (funciones) se resuelven ACÁ ADENTRO, en el
// archivo cliente. Nunca se reciben como prop desde el servidor: solo
// llega un string (iconName), que es serializable.
const ICONS: Record<NavIconName, typeof CalendarCheck> = {
  asistencia: CalendarCheck,
  alumnos: Users,
  inventario: Package,
  admin: Shield,
};

function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

export function DesktopNavLink({ item }: { item: NavItem }) {
  const isActive = useIsActive()(item.href);
  const Icon = ICONS[item.iconName];
  return (
    <Link
      href={item.href}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isActive ? "bg-accent/15 text-accent" : "text-slate-300 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}

export function MobileNavLink({ item }: { item: NavItem }) {
  const isActive = useIsActive()(item.href);
  const Icon = ICONS[item.iconName];
  return (
    <Link
      href={item.href}
      className={clsx(
        "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium",
        isActive ? "text-accent" : "text-slate-400"
      )}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}
