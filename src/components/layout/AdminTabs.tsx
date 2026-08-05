"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const ADMIN_TABS = [
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/disciplinas", label: "Disciplinas" },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-5 flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
      {ADMIN_TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-accent bg-accent/15 text-accent"
                : "border-slate-300 text-slate-600 hover:border-accent hover:text-accent"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
