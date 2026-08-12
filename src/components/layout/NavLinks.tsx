"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CalendarCheck, Users, Package, FileText, BarChart3, ScanLine, UserCog, Settings, Home } from "lucide-react";
import type { NavItem, NavIconName } from "@/lib/nav-items";

const ICONS: Record<NavIconName, typeof CalendarCheck> = {
  asistencia: CalendarCheck,
  alumnos: Users,
  inventario: Package,
  documentos: FileText,
  reportes: BarChart3,
  ingreso: ScanLine,
};

function useActivo(href: string) {
  const pathname = usePathname();
  return pathname === href || pathname.startsWith(href + "/");
}

const clasesLink = (activo: boolean) =>
  clsx(
    "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
    activo ? "bg-accent/20 text-accent" : "text-slate-300 hover:bg-white/10 hover:text-white"
  );

export function HomeNavLink() {
  const pathname = usePathname();
  return (
    <Link href="/" className={clasesLink(pathname === "/")}>
      <Home className="h-4 w-4" />
      Inicio
    </Link>
  );
}

export function HorizontalNavLink({ item }: { item: NavItem }) {
  const activo = useActivo(item.href);
  const Icon = ICONS[item.iconName];
  return (
    <Link href={item.href} className={clasesLink(activo)}>
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

export function UsuariosNavLink({ href, label }: { href: string; label: string }) {
  const activo = useActivo(href);
  return (
    <Link href={href} className={clasesLink(activo)}>
      <UserCog className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function ConfiguracionNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const activo = pathname.startsWith("/admin");
  return (
    <Link href={href} className={clasesLink(activo)}>
      <Settings className="h-4 w-4" />
      {label}
    </Link>
  );
}
