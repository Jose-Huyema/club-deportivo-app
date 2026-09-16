"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { ScanLine } from "lucide-react";

/**
 * Campo pensado para lectores físicos tipo Zebex (emulan teclado): el
 * lector "tipea" el código escaneado y termina con Enter, sin que nadie
 * toque el teclado. Este input se mantiene siempre enfocado para
 * capturar eso automáticamente, sin necesidad de cámara.
 */
export function ScannerInput({
  onScan,
  placeholder = "Escaneá el carnet…",
  disabled = false,
}: {
  onScan: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = value.trim();
      setValue("");
      if (code) onScan(code);
    }
  }

  function handleBlur() {
    // Si el foco se pierde (por ejemplo al tocar otra cosa en pantalla),
    // lo recupera solo para que el próximo escaneo siga funcionando.
    if (!disabled) setTimeout(() => inputRef.current?.focus(), 150);
  }

  return (
    <div className="relative">
      <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-center text-base tracking-wide focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
      />
    </div>
  );
}
