import Link from "next/link";
import { requireProfile, puedeEditar } from "@/lib/data/profile";
import { getAlumnos } from "@/lib/data/alumnos";
import { AlumnosList } from "./AlumnosList";
import { Button } from "@/components/ui/Button";

export default async function AlumnosPage() {
  const profile = await requireProfile();
  const alumnos = await getAlumnos();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-primary">Alumnos</h1>
          <p className="text-sm text-slate-500">{alumnos.length} alumnos registrados</p>
        </div>
        {puedeEditar(profile.role) && (
          <div className="flex gap-2">
            <Link href="/alumnos/importar">
              <Button variant="secondary">Importar</Button>
            </Link>
            <Link href="/alumnos/nuevo">
              <Button>Nuevo alumno</Button>
            </Link>
          </div>
        )}
      </div>
      <AlumnosList alumnos={alumnos} />
    </div>
  );
}
