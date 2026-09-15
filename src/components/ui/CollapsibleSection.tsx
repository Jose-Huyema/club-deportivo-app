"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

/**
 * Sección plegable para formularios largos. Pensada para celular: agrupa
 * campos secundarios/opcionales bajo un título tocable, así la pantalla
 * no se siente eterna al scrollear. El contenido sigue montado (solo se
 * oculta con CSS), así que el valor de los inputs de adentro no se pierde
 * al plegar/desplegar.
 */
export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [abierta, setAbierta] = useState(defaultOpen);

  return (
    <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        className="mb-3 flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</span>
        <ChevronDown className={clsx("h-4 w-4 text-slate-400 transition-transform", abierta && "rotate-180")} />
      </button>
      <div className={clsx(abierta ? "block" : "hidden")}>{children}</div>
    </div>
  );
}
