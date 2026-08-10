import Link from "next/link";
import {
  CalendarCheck, Users, Package, FileText, BarChart3, UserCog, Settings,
} from "lucide-react";
import { requireProfile, labelRol } from "@/lib/data/profile";
import { getCategoriasParaAsistencia } from "@/lib/data/asistencia";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const ICONOS: Record<string, typeof CalendarCheck> = {
  asistencia: CalendarCheck,
  alumnos: Users,
  inventario: Package,
  documentos: FileText,
  reportes: BarChart3,
};

const LABELS: Record<string, string> = {
  asistencia: "Asistencia",
  alumnos: "Alumnos",
  inventario: "Inventario",
  documentos: "Documentos",
  reportes: "Reportes",
};

function saludo() {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 20) return "Buenas tardes";
  return "Buenas noches";
}

export default async function HomePage() {
  const profile = await requireProfile();

  // El profe tiene una home distinta: perfil + sus disciplinas/categorías,
  // como acceso directo a tomar asistencia (que es su tarea principal).
  if (profile.role === "profe") {
    const categorias = await getCategoriasParaAsistencia(profile.id, profile.role);
    const porDisciplina = new Map<string, typeof categorias>();
    categorias.forEach((c) => {
      const arr = porDisciplina.get(c.discipline_name) ?? [];
      arr.push(c);
      porDisciplina.set(c.discipline_name, arr);
    });

    return (
      <div>
        <Card className="mb-5 bg-primary text-white">
          <p className="text-sm text-slate-300">{saludo()},</p>
          <p className="text-lg font-bold">{profile.full_name}</p>
          <p className="text-sm text-slate-300">{labelRol(profile.role, profile.genero)}</p>
        </Card>

        <h2 className="mb-3 text-sm font-semibold text-slate-700">Tus disciplinas y categorías</h2>

        {categorias.length === 0 ? (
          <EmptyState
            title="No tenés categorías asignadas todavía"
            description="Pedile a un administrador que te asigne una desde Usuarios."
          />
        ) : (
          <div className="space-y-4">
            {Array.from(porDisciplina.entries()).map(([disciplina, cats]) => (
              <div key={disciplina}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{disciplina}</p>
                <div className="space-y-2">
                  {cats.map((c) => (
                    <Link key={c.id} href={`/asistencia/${c.id}`}>
                      <Card className="flex items-center justify-between hover:shadow-md">
                        <div>
                          <p className="font-semibold text-slate-900">{c.name}</p>
                          {c.schedule && <p className="text-sm text-slate-500">{c.schedule}</p>}
                        </div>
                        {c.ya_registrada_hoy ? (
                          <Badge tone="success">Hoy: registrada</Badge>
                        ) : (
                          <Badge tone="warning">Hoy: pendiente</Badge>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Admin y operador: bienvenida + accesos directos a lo que tienen permitido.
  const accesos = [
    ...profile.allowed_views.map((key) => ({ href: `/${key}`, label: LABELS[key], icon: ICONOS[key] })),
    ...(profile.role === "admin"
      ? [
          { href: "/usuarios", label: "Usuarios", icon: UserCog },
          { href: "/admin/general", label: "Configuración", icon: Settings },
        ]
      : []),
  ];

  return (
    <div>
      <Card className="mb-6 bg-primary text-white">
        <p className="text-sm text-slate-300">{saludo()},</p>
        <p className="text-lg font-bold">{profile.full_name}</p>
        <p className="text-sm text-slate-300">{labelRol(profile.role, profile.genero)}</p>
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-slate-700">Accesos directos</h2>
      <div className="grid grid-cols-2 gap-3">
        {accesos.map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="flex flex-col items-center gap-2 py-6 text-center hover:shadow-md">
              <a.icon className="h-6 w-6 text-accent" />
              <span className="text-sm font-medium text-slate-900">{a.label}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
