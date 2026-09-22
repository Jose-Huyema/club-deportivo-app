import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  ChevronRight,
  FileText,
  Package,
  ScanLine,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { requireProfile, labelRol } from "@/lib/data/profile";
import { getCategoriasParaAsistencia } from "@/lib/data/asistencia";
import { getDashboardData } from "@/lib/data/dashboard";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
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
  ingreso: "/ingreso",
};

function saludo() {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 20) return "Buenas tardes";
  return "Buenas noches";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function metricToneClass(tone?: "neutral" | "success" | "warning" | "danger") {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30";
  if (tone === "warning") return "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30";
  if (tone === "danger") return "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30";
  return "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800";
}

export default async function HomePage() {
  const profile = await requireProfile();

  if (profile.role === "portero") {
    return (
      <div>
        <Card className="mb-6 bg-primary text-white dark:bg-slate-950">
          <p className="text-sm text-slate-300">{saludo()},</p>
          <p className="text-lg font-bold">{profile.full_name}</p>
          <p className="text-sm text-slate-300">{labelRol(profile.role, profile.genero)}</p>
        </Card>
        <Link href="/ingreso">
          <Button className="flex w-full flex-col items-center gap-2 py-8 text-base">
            <ScanLine className="h-8 w-8" />
            Registrar ingreso
          </Button>
        </Link>
      </div>
    );
  }

  if (profile.role === "profe") {
    const [categorias, dashboard] = await Promise.all([
      getCategoriasParaAsistencia(profile.id, profile.role),
      getDashboardData(profile.id, profile.role, profile.allowed_views),
    ]);
    const porDisciplina = new Map<string, typeof categorias>();
    categorias.forEach((c) => {
      const arr = porDisciplina.get(c.discipline_name) ?? [];
      arr.push(c);
      porDisciplina.set(c.discipline_name, arr);
    });

    return (
      <div className="space-y-6">
        <Card className="bg-primary text-white dark:bg-slate-950">
          <p className="text-sm text-slate-300">{saludo()},</p>
          <p className="text-lg font-bold">{profile.full_name}</p>
          <p className="text-sm text-slate-300">{labelRol(profile.role, profile.genero)}</p>
        </Card>

        <section>
          <div className="grid grid-cols-3 gap-3">
            {dashboard.metrics.map((metric) => (
              <Link key={metric.label} href={metric.href ?? "#"} className="block">
                <Card className={`h-full ${metricToneClass(metric.tone)}`}>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{metric.value}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {categorias.length === 0 ? (
          <EmptyState
            title="No tenés categorías asignadas todavía"
            description="Pedile a un administrador que te asigne una desde Usuarios."
          />
        ) : (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Tus disciplinas y categorías</h2>
            <div className="space-y-4">
              {Array.from(porDisciplina.entries()).map(([disciplina, cats]) => (
                <div key={disciplina}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{disciplina}</p>
                  <div className="space-y-2">
                    {cats.map((c) => (
                      <Link key={c.id} href={`/asistencia/${c.id}`}>
                        <Card
                          className="flex items-center justify-between rounded-l-none border-l-4 hover:shadow-md"
                          style={{ borderLeftColor: colorForDisciplina(disciplina) }}
                        >
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</p>
                            {c.schedule && <p className="text-sm text-slate-500 dark:text-slate-400">{c.schedule}</p>}
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
          </section>
        )}

        {dashboard.activities.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Actividad de hoy</h2>
            </div>
            <Card className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {dashboard.activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{activity.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{activity.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{formatTime(activity.at)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}
      </div>
    );
  }

  const dashboard = await getDashboardData(profile.id, profile.role, profile.allowed_views);
  const accesos = [
    ...profile.allowed_views.map((key) => ({ href: HREFS[key] ?? `/${key}`, label: LABELS[key] ?? key, icon: ICONOS[key] ?? CalendarCheck })),
    ...(profile.role === "admin"
      ? [
          { href: "/usuarios", label: "Usuarios", icon: UserCog },
          { href: "/admin/general", label: "Configuración", icon: Settings },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-primary text-white dark:bg-slate-950">
        <p className="text-sm text-slate-300">{saludo()},</p>
        <p className="text-lg font-bold">{profile.full_name}</p>
        <p className="text-sm text-slate-300">{labelRol(profile.role, profile.genero)}</p>
      </Card>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Resumen de hoy</h2>
          <span className="text-xs text-slate-400">Actualizado al abrir</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {dashboard.metrics.map((metric) => {
            const content = (
              <Card className={`h-full ${metricToneClass(metric.tone)}`}>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{metric.label}</p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{metric.value}</p>
              </Card>
            );
            return metric.href ? <Link key={metric.label} href={metric.href}>{content}</Link> : <div key={metric.label}>{content}</div>;
          })}
        </div>
      </section>

      {dashboard.alerts.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Alertas</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {dashboard.alerts.map((alert) => (
              <Link key={alert.label} href={alert.href}>
                <Card className="flex items-center justify-between border-amber-200 bg-amber-50 hover:shadow-md dark:border-amber-900 dark:bg-amber-950/30">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{alert.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Requiere atención</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={alert.tone}>{alert.value}</Badge>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Actividad reciente</h2>
        </div>
        {dashboard.activities.length === 0 ? (
          <EmptyState title="Todavía no hay actividad" description="Los ingresos y asistencias aparecerán aquí a medida que se registren." />
        ) : (
          <Card className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {dashboard.activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{activity.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activity.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatTime(activity.at)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Accesos rápidos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {accesos.map((a) => (
            <Link key={a.href} href={a.href}>
              <Card className="flex flex-col items-center gap-2 py-6 text-center hover:shadow-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light dark:bg-primary/20">
                  <a.icon className="h-5 w-5 text-primary dark:text-primary-light" />
                </span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{a.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
