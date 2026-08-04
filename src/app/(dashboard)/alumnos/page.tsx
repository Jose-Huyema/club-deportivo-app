import Link from "next/link";
import { getAlumnos } from "@/lib/data/alumnos";
import { AlumnosList } from "./AlumnosList";
import { Button } from "@/components/ui/Button";

export default async function AlumnosPage() {
  const alumnos = await getAlumnos();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-primary">Alumnos</h1>
          <p className="text-sm text-slate-500">{alumnos.length} alumnos registrados</p>
        </div>
        <Link href="/alumnos/nuevo">
          <Button>Nuevo alumno</Button>
        </Link>
      </div>
      <AlumnosList alumnos={alumnos} />
    </div>
  );
}
