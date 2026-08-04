"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CalendarCheck, Users, Package, Shield } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof CalendarCheck;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/asistencia", label: "Asistencia", icon: CalendarCheck },
  { href: "/alumnos", label: "Alumnos", icon: Users },
  { href: "/inventario", label: "Inventario", icon: Package },
];

export const ADMIN_NAV_ITEM: NavItem = {
  href: "/admin/usuarios",
  label: "Admin",
  icon: Shield,
};

export function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

export function DesktopNavLink({ item }: { item: NavItem }) {
  const isActive = useIsActive()(item.href);
  const Icon = item.icon;
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
  const Icon = item.icon;
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
