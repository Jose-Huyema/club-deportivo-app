import Link from "next/link";

import {
  CalendarCheck,
  Users,
  Package,
  FileText,
  BarChart3,
  ScanLine,
  UserCog,
  Settings,
} from "lucide-react";

import { requireProfile, labelRol } from "@/lib/data/profile";
import { getCategoriasParaAsistencia } from "@/lib/data/asistencia";

import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { EmptyState } from "@/components/ui";

import { colorForDisciplina } from "@/lib/ui/disciplineColor";

const ICONOS: Record<string, typeof CalendarCheck> = {
  asistencia: CalendarCheck,
  alumnos: Users,
  inventario: Package,
  documentos: FileText,
  reportes: BarChart3,
  ingreso: ScanLine,
};

const LABELS: Record<string, string> = {
  asistencia: "Asistencia",
  alumnos: "Alumnos",
  inventario: "Inventario",
  documentos: "Documentos",
  reportes: "Reportes",
  ingreso: "Control de ingreso",
};

const HREFS: Record<string, string> = {
  asistencia: "/asistencia",
  alumnos: "/alumnos",
  inventario: "/inventario",
  documentos: "/documentos",
  reportes: "/reportes",
  ingreso: "/asistencia/scanner",
};

function saludo() {
  const hora = new Date().getHours();

  if (hora < 12) return "Buenos días";
  if (hora < 20) return "Buenas tardes";

  return "Buenas noches";
}

export default async function HomePage() {
  const profile = await requireProfile();

  // Portero: solo le interesa el scanner de ingreso.
  if (profile.role === "portero") {
    return (
      <div>
        <Card className="mb-6 bg-slate-800 text-white dark:bg-slate-950">
          <p className="text-sm font-medium text-white">
            {saludo()},
          </p>

          <p className="text-lg font-bold text-white">
            {profile.full_name}
          </p>

          <p className="text-sm font-medium text-slate-200">
            {labelRol(profile.role, profile.genero)}
          </p>
        </Card>

        <Link href="/asistencia/scanner">
          <Button className="flex w-full flex-col items-center gap-2 py-8 text-base">
            <ScanLine className="h-8 w-8" />
            Registrar ingreso
          </Button>
        </Link>
      </div>
    );
  }

  // El profe tiene una home distinta: perfil + sus disciplinas/categorías.
  if (profile.role === "profe") {
    const categorias = await getCategoriasParaAsistencia(
      profile.id,
      profile.role
    );

    const porDisciplina = new Map<string, typeof categorias>();

    categorias.forEach((c) => {
      const arr = porDisciplina.get(c.discipline_name) ?? [];

      arr.push(c);
      porDisciplina.set(c.discipline_name, arr);
    });

    return (
      <div>
        <Card className="mb-5 bg-slate-800 text-white dark:bg-slate-950">
          <p className="text-sm font-medium text-white">
            {saludo()},
          </p>

          <p className="text-lg font-bold text-white">
            {profile.full_name}
          </p>

          <p className="text-sm font-medium text-slate-200">
            {labelRol(profile.role, profile.genero)}
          </p>
        </Card>

        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Tus disciplinas y categorías
        </h2>

        {categorias.length === 0 ? (
          <EmptyState
            title="No tenés categorías asignadas todavía"
            description="Pedile a un administrador que te asigne una desde Usuarios."
          />
        ) : (
          <div className="space-y-4">
            {Array.from(porDisciplina.entries()).map(
              ([disciplina, cats]) => (
                <div key={disciplina}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {disciplina}
                  </p>

                  <div className="space-y-2">
                    {cats.map((c) => (
                      <Link key={c.id} href={`/asistencia/${c.id}`}>
                        <Card
                          className="flex items-center justify-between rounded-l-none border-l-4 hover:shadow-md"
                          style={{
                            borderLeftColor:
                              colorForDisciplina(disciplina),
                          }}
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {c.name}
                            </p>

                            {c.schedule && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {c.schedule}
                              </p>
                            )}
                          </div>

                          {c.ya_registrada_hoy ? (
                            <Badge tone="success">
                              Hoy: registrada
                            </Badge>
                          ) : (
                            <Badge tone="warning">
                              Hoy: pendiente
                            </Badge>
                          )}
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  // Admin y operador: bienvenida + accesos directos.
  const accesos = [
    ...profile.allowed_views.map((key) => ({
      href: HREFS[key] ?? `/${key}`,
      label: LABELS[key] ?? key,
      icon: ICONOS[key] ?? CalendarCheck,
    })),

    ...(profile.role === "admin"
      ? [
          {
            href: "/usuarios",
            label: "Usuarios",
            icon: UserCog,
          },
          {
            href: "/admin/general",
            label: "Configuración",
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <div>
      <Card className="mb-6 bg-slate-800 text-white dark:bg-slate-950">
        <p className="text-sm font-medium text-white">
          {saludo()},
        </p>

        <p className="text-lg font-bold text-white">
          {profile.full_name}
        </p>

        <p className="text-sm font-medium text-slate-200">
          {labelRol(profile.role, profile.genero)}
        </p>
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
        Accesos directos
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {accesos.map((a) => (
          <Link key={a.href} href={a.href}>
            <Card className="flex flex-col items-center gap-2 py-6 text-center hover:shadow-md">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light dark:bg-primary/20">
                <a.icon className="h-5 w-5 text-primary dark:text-primary-light" />
              </span>

              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {a.label}
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
