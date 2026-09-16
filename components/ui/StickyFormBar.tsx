import type { ReactNode } from "react";

/**
 * Barra FIJA abajo de toda la pantalla (no depende de scroll) para el
 * botón principal de un formulario largo. Así en el celular el botón de
 * guardar siempre está a mano, sin tener que llegar hasta el final.
 * Se coloca DENTRO del <form>, en reemplazo del botón que iba suelto al
 * final. El formulario que la usa necesita un padding-bottom extra
 * (ver <FormBottomSpacer />) para que el último campo no quede tapado.
 */
export function StickyFormBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <div className="mx-auto max-w-4xl">{children}</div>
    </div>
  );
}

/** Espacio reservado al final del formulario para que StickyFormBar no tape el último campo. */
export function FormBottomSpacer() {
  return <div className="h-20" aria-hidden="true" />;
}
