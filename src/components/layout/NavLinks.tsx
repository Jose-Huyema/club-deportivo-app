"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export type NavItem = {
  href: string;
  label: string;
  emoji: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/asistencia", label: "Asistencia", emoji: "📅" },
  { href: "/alumnos", label: "Alumnos", emoji: "👥" },
  { href: "/inventario", label: "Inventario", emoji: "📦" },
];

export const ADMIN_NAV_ITEM: NavItem = {
  href: "/admin/usuarios",
  label: "Admin",
  emoji: "🛡️",
};

export function useIsActive() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(href + "/");
}

export function DesktopNavLink({ item }: { item: NavItem }) {
  const isActive = useIsActive()(item.href);
  return (
    <Link
      href={item.href}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        isActive ? "bg-accent/15 text-accent" : "text-slate-300 hover:bg-white/5 hover:text-white"
      )}
    >
      <span className="text-base leading-none">{item.emoji}</span>
      {item.label}
    </Link>
  );
}

export function MobileNavLink({ item }: { item: NavItem }) {
  const isActive = useIsActive()(item.href);
  return (
    <Link
      href={item.href}
      className={clsx(
        "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium",
        isActive ? "text-accent" : "text-slate-400"
      )}
    >
      <span className="text-base leading-none">{item.emoji}</span>
      {item.label}
    </Link>
  );
}
