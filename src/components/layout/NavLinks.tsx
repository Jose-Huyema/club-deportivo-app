"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CalendarCheck, Users, Package, FileText, BarChart3, Settings } from "lucide-react";
import type { NavItem, NavIconName } from "@/lib/nav-items";

const ICONS: Record<NavIconName, typeof CalendarCheck> = {
  asistencia: CalendarCheck,
  alumnos: Users,
  inventario: Package,
  documentos: FileText,
  reportes: BarChart3,
};

export function HorizontalNavLink({ item }: { item: NavItem & { icon?: undefined } }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = ICONS[item.iconName];

  return (
    <Link
      href={item.href}
      className={clsx(
        "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        isActive ? "bg-accent/20 text-accent" : "text-slate-300 hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

export function ConfiguracionNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/admin");
  return (
    <Link
      href={href}
      className={clsx(
        "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        isActive ? "bg-accent/20 text-accent" : "text-slate-300 hover:bg-white/10 hover:text-white"
      )}
    >
      <Settings className="h-4 w-4" />
      {label}
    </Link>
  );
}
