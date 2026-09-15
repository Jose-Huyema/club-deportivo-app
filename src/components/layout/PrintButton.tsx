"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Botón genérico de impresión. Client Component chico y sin props tipo
 * función, solo dispara window.print() — así se puede usar dentro de
 * cualquier Server Component sin problemas de límite servidor/cliente.
 */
export function PrintButton({ label = "Imprimir" }: { label?: string }) {
  return (
    <Button variant="secondary" onClick={() => window.print()} className="print:hidden">
      <Printer className="h-4 w-4" />
      {label}
    </Button>
  );
}
