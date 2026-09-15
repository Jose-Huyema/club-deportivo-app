import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireEditor } from "@/lib/data/profile";
import { getDisciplinas } from "@/lib/data/admin";
import { NuevoArticuloForm } from "./NuevoArticuloForm";

export default async function NuevoArticuloPage() {
  await requireEditor();
  const disciplinas = await getDisciplinas();

  return (
    <div>
      <Link href="/inventario" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Volver a inventario
      </Link>
      <h1 className="mb-5 text-xl font-bold text-primary">Nuevo artículo</h1>
      <NuevoArticuloForm disciplinas={disciplinas} />
    </div>
  );
}
