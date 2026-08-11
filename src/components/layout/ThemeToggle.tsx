"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [oscuro, setOscuro] = useState(false);

  useEffect(() => {
    setOscuro(document.documentElement.classList.contains("dark"));
  }, []);

  function alternar() {
    const nuevoValor = !oscuro;
    setOscuro(nuevoValor);
    document.documentElement.classList.toggle("dark", nuevoValor);
    localStorage.setItem("theme", nuevoValor ? "dark" : "light");
  }

  return (
    <button
      onClick={alternar}
      aria-label={oscuro ? "Activar modo claro" : "Activar modo oscuro"}
      className="rounded-xl p-2.5 text-slate-300 hover:bg-white/10 hover:text-white"
    >
      {oscuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
