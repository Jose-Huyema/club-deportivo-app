"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Algo salió mal</p>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Probá de nuevo. Si el problema sigue, avisale a un administrador.
      </p>
      <Button onClick={reset} className="mt-2">
        Reintentar
      </Button>
    </div>
  );
}
