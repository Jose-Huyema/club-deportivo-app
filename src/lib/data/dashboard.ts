import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/roles";

export type DashboardMetric = {
  label: string;
  value: number | string;
  href?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export type DashboardActivity = {
  id: string;
  kind: "ingreso" | "asistencia";
  title: string;
  detail: string;
  at: string;
};

export type DashboardAlert = {
  label: string;
  value: number;
  href: string;
  tone: "warning" | "danger" | "neutral";
};

export type DashboardData = {
  metrics: DashboardMetric[];
  activities: DashboardActivity[];
  alerts: DashboardAlert[];
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function canView(allowedViews: string[], key: string) {
  return allowedViews.includes(key);
}

export async function getDashboardData(
  profileId: string,
  role: Role,
  allowedViews: string[]
): Promise<DashboardData> {
  const supabase = createClient();
  const today = todayIso();

  if (role === "profe") {
    const { data: assigned } = await supabase
      .from("professor_categories")
      .select("category_id")
      .eq("professor_id", profileId);
    const categoryIds = (assigned ?? []).map((x) => x.category_id);

    if (categoryIds.length === 0) {
      return {
        metrics: [
          { label: "Categorías asignadas", value: 0, href: canView(allowedViews, "asistencia") ? "/asistencia" : undefined },
          { label: "Alumnos", value: 0 },
          { label: "Asistencias de hoy", value: 0, href: canView(allowedViews, "asistencia") ? "/asistencia" : undefined, tone: "warning" },
        ],
        activities: [],
        alerts: [],
      };
    }

    const [{ count: assignedStudents }, { count: teacherAttendances }, { data: teacherActivities }] = await Promise.all([
      supabase.from("enrollments").select("student_id", { count: "exact", head: true }).in("category_id", categoryIds),
      supabase.from("attendances").select("id", { count: "exact", head: true }).eq("date", today).in("category_id", categoryIds),
      supabase.from("attendances").select("id, date, finalized, categories(name)").eq("date", today).in("category_id", categoryIds).order("created_at", { ascending: false }).limit(8),
    ]);

    return {
      metrics: [
        { label: "Categorías asignadas", value: categoryIds.length, href: canView(allowedViews, "asistencia") ? "/asistencia" : undefined },
        { label: "Alumnos", value: assignedStudents ?? 0 },
        { label: "Asistencias de hoy", value: teacherAttendances ?? 0, href: canView(allowedViews, "asistencia") ? "/asistencia" : undefined, tone: teacherAttendances ? "success" : "warning" },
      ],
      activities: (teacherActivities ?? []).map((a: any) => ({
        id: a.id,
        kind: "asistencia" as const,
        title: a.categories?.name ?? "Categoría",
        detail: `Asistencia · ${a.finalized ? "finalizada" : "en progreso"}`,
        at: `${a.date}T12:00:00`,
      })),
      alerts: [],
    };
  }

  const [{ count: activeStudents }, { count: checkinsToday }, { count: attendancesToday }, { data: recentCheckins }, { data: todayAttendances }] =
    await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("checkins").select("id", { count: "exact", head: true }).gte("checked_in_at", `${today}T00:00:00`).lt("checked_in_at", `${today}T23:59:59.999`),
      supabase.from("attendances").select("id", { count: "exact", head: true }).eq("date", today),
      supabase.from("checkins").select("id, checked_in_at, method, students(full_name)").order("checked_in_at", { ascending: false }).limit(6),
      supabase.from("attendances").select("id, date, finalized, categories(name), profiles(full_name)").eq("date", today).order("created_at", { ascending: false }).limit(6),
    ]);

  const activities: DashboardActivity[] = [
    ...(recentCheckins ?? []).map((c: any) => ({
      id: `ingreso-${c.id}`,
      kind: "ingreso" as const,
      title: c.students?.full_name ?? "Alumno",
      detail: `Ingreso · ${String(c.method ?? "manual").toUpperCase()}`,
      at: c.checked_in_at,
    })),
    ...(todayAttendances ?? []).map((a: any) => ({
      id: `asistencia-${a.id}`,
      kind: "asistencia" as const,
      title: a.categories?.name ?? "Categoría",
      detail: `Asistencia · ${a.finalized ? "finalizada" : "en progreso"}`,
      at: `${a.date}T12:00:00`,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  const alerts: DashboardAlert[] = [];

  if (canView(allowedViews, "inventario")) {
    const { count } = await supabase
      .from("inventory_items")
      .select("id", { count: "exact", head: true })
      .lte("total_quantity", 0);
    if ((count ?? 0) > 0) alerts.push({ label: "Stock agotado", value: count ?? 0, href: "/inventario", tone: "danger" });
  }

  if (role === "admin" || canView(allowedViews, "usuarios")) {
    const { data: categories } = await supabase.from("categories").select("id, professor_categories(id)");
    const withoutProfessor = (categories ?? []).filter((c: any) => (c.professor_categories ?? []).length === 0).length;
    if (withoutProfessor > 0) alerts.push({ label: "Categorías sin profesor", value: withoutProfessor, href: "/usuarios", tone: "warning" });
  }

  return {
    metrics: [
      { label: "Alumnos activos", value: activeStudents ?? 0, href: canView(allowedViews, "alumnos") ? "/alumnos" : undefined, tone: "success" },
      { label: "Ingresos hoy", value: checkinsToday ?? 0, href: canView(allowedViews, "ingreso") ? "/ingreso" : undefined },
      { label: "Asistencias hoy", value: attendancesToday ?? 0, href: canView(allowedViews, "asistencia") ? "/asistencia" : undefined },
    ],
    activities,
    alerts,
  };
}
