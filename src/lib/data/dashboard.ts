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
  value: number | string;
  href: string;
  tone: "warning" | "danger" | "neutral";
};

export type DashboardDailyOperation = {
  id: string;
  label: string;
  detail: string;
  value: number | string;
  href: string;
  tone: "neutral" | "success" | "warning" | "danger";
};

export type DashboardData = {
  metrics: DashboardMetric[];
  activities: DashboardActivity[];
  alerts: DashboardAlert[];
  dailyOperations: DashboardDailyOperation[];
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
        dailyOperations: [],
      };
    }

    const [{ count: assignedStudents }, { count: teacherAttendances }, { data: teacherActivities }, { data: assignedCategories }, { data: todayAttendances }] = await Promise.all([
      supabase.from("enrollments").select("student_id", { count: "exact", head: true }).in("category_id", categoryIds),
      supabase.from("attendances").select("id", { count: "exact", head: true }).eq("date", today).in("category_id", categoryIds),
      supabase.from("attendances").select("id, date, finalized, categories(name)").eq("date", today).in("category_id", categoryIds).order("created_at", { ascending: false }).limit(8),
      supabase.from("categories").select("id, name, schedule, disciplines(name)").in("id", categoryIds).order("name"),
      supabase.from("attendances").select("category_id, finalized").eq("date", today).in("category_id", categoryIds),
    ]);

    const attendanceByCategory = new Map<string, boolean>();
    (todayAttendances ?? []).forEach((row: any) => attendanceByCategory.set(row.category_id, Boolean(row.finalized)));
    const dailyOperations = (assignedCategories ?? []).map((category: any) => {
      const status = attendanceByCategory.has(category.id)
        ? attendanceByCategory.get(category.id)
          ? { label: "Asistencia finalizada", detail: category.schedule || "Registrada hoy", tone: "success" as const }
          : { label: "Asistencia en progreso", detail: category.schedule || "Guardada, falta finalizar", tone: "warning" as const }
        : { label: "Asistencia pendiente", detail: category.schedule || "Todavía no registrada", tone: "danger" as const };

      return {
        id: `categoria-${category.id}`,
        label: category.name,
        detail: status.detail,
        value: status.label === "Asistencia finalizada" ? "OK" : status.label === "Asistencia en progreso" ? "ABIERTO" : "PEND.",
        href: `/asistencia/${category.id}`,
        tone: status.tone,
      };
    });

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
      dailyOperations,
    };
  }

  const [
    { count: activeStudents },
    { count: checkinsToday },
    { count: attendancesToday },
    { data: recentCheckins },
    { data: recentAttendances },
    { data: allTodayAttendances },
    { data: allCategories },
    { data: lowStockItems },
  ] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("checkins").select("id", { count: "exact", head: true }).gte("checked_in_at", `${today}T00:00:00`).lt("checked_in_at", `${today}T23:59:59.999`),
    supabase.from("attendances").select("id", { count: "exact", head: true }).eq("date", today),
    supabase.from("checkins").select("id, checked_in_at, method, students(full_name)").order("checked_in_at", { ascending: false }).limit(6),
    supabase.from("attendances").select("id, date, finalized, categories(name), profiles(full_name)").eq("date", today).order("created_at", { ascending: false }).limit(6),
    canView(allowedViews, "asistencia")
      ? supabase.from("attendances").select("id, category_id, date, finalized").eq("date", today)
      : Promise.resolve({ data: [] as any[] }),
    (canView(allowedViews, "asistencia") || role === "admin")
      ? supabase.from("categories").select("id, name, schedule, professor_categories(id)")
      : Promise.resolve({ data: [] as any[] }),
    canView(allowedViews, "inventario")
      ? supabase.from("inventory_items").select("id, name, total_quantity, min_warning_quantity").limit(250)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const activities: DashboardActivity[] = [
    ...(recentCheckins ?? []).map((c: any) => ({
      id: `ingreso-${c.id}`,
      kind: "ingreso" as const,
      title: c.students?.full_name ?? "Alumno",
      detail: `Ingreso · ${String(c.method ?? "manual").toUpperCase()}`,
      at: c.checked_in_at,
    })),
    ...(recentAttendances ?? []).map((a: any) => ({
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
  const dailyOperations: DashboardDailyOperation[] = [];

  const attendanceCategoryIds = new Set((allTodayAttendances ?? []).map((a: any) => a.category_id));
  const openAttendances = (allTodayAttendances ?? []).filter((a: any) => !a.finalized).length;
  const finalizedAttendances = (allTodayAttendances ?? []).filter((a: any) => a.finalized).length;
  const categoriesWithoutAttendance = (allCategories ?? []).filter((c: any) => !attendanceCategoryIds.has(c.id)).length;

  if (canView(allowedViews, "asistencia")) {
    if (categoriesWithoutAttendance > 0) {
      alerts.push({ label: "Categorías sin asistencia registrada", value: categoriesWithoutAttendance, href: "/asistencia", tone: "warning" });
    }
    if (openAttendances > 0) {
      alerts.push({ label: "Asistencias en progreso", value: openAttendances, href: "/asistencia", tone: "warning" });
    }

    dailyOperations.push(
      { id: "asistencia-pendiente", label: "Sin registrar", detail: "Categorías que todavía no tienen asistencia hoy", value: categoriesWithoutAttendance, href: "/asistencia", tone: categoriesWithoutAttendance ? "danger" : "success" },
      { id: "asistencia-abierta", label: "En progreso", detail: "Asistencias guardadas pero todavía abiertas", value: openAttendances, href: "/asistencia", tone: openAttendances ? "warning" : "success" },
      { id: "asistencia-cerrada", label: "Finalizadas", detail: "Asistencias cerradas hoy", value: finalizedAttendances, href: "/asistencia", tone: "success" },
    );
  }

  if (canView(allowedViews, "inventario")) {
    const lowStock = lowStockItems ?? [];
    const outOfStock = lowStock.filter((item: any) => Number(item.total_quantity) <= 0).length;
    const warningStock = lowStock.filter((item: any) => Number(item.total_quantity) > 0 && Number(item.total_quantity) <= Number(item.min_warning_quantity ?? 5)).length;

    if (outOfStock > 0) alerts.push({ label: "Stock agotado", value: outOfStock, href: "/inventario", tone: "danger" });
    if (warningStock > 0) alerts.push({ label: "Stock bajo", value: warningStock, href: "/inventario", tone: "warning" });

    dailyOperations.push({
      id: "inventario-bajo",
      label: "Stock bajo",
      detail: "Artículos para revisar o reponer",
      value: outOfStock + warningStock,
      href: "/inventario",
      tone: outOfStock > 0 ? "danger" : warningStock > 0 ? "warning" : "success",
    });
  }

  if (role === "admin") {
    const withoutProfessor = (allCategories ?? []).filter((c: any) => (c.professor_categories ?? []).length === 0).length;
    if (withoutProfessor > 0) alerts.push({ label: "Categorías sin profesor", value: withoutProfessor, href: "/usuarios", tone: "warning" });
    dailyOperations.push({
      id: "categorias-sin-profesor",
      label: "Sin profesor",
      detail: "Categorías que requieren asignación",
      value: withoutProfessor,
      href: "/usuarios",
      tone: withoutProfessor ? "warning" : "success",
    });
  }

  return {
    metrics: [
      { label: "Alumnos activos", value: activeStudents ?? 0, href: canView(allowedViews, "alumnos") ? "/alumnos" : undefined, tone: "success" },
      { label: "Ingresos hoy", value: checkinsToday ?? 0, href: canView(allowedViews, "ingreso") ? "/ingreso" : undefined },
      { label: "Asistencias hoy", value: attendancesToday ?? 0, href: canView(allowedViews, "asistencia") ? "/asistencia" : undefined },
    ],
    activities,
    alerts,
    dailyOperations,
  };
}
