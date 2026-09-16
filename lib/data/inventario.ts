import { createClient } from "@/lib/supabase/server";

export type ItemInventario = {
  id: string;
  name: string;
  discipline_id: string | null;
  discipline_name: string | null;
  total_quantity: number;
  min_warning_quantity: number;
  stock_bajo: boolean;
};

export async function getInventario(): Promise<ItemInventario[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("inventory_items")
    .select("id, name, discipline_id, total_quantity, min_warning_quantity, disciplines(name)")
    .order("name");

  if (error || !data) return [];

  return data.map((i: any) => ({
    id: i.id,
    name: i.name,
    discipline_id: i.discipline_id,
    discipline_name: i.disciplines?.name ?? null,
    total_quantity: i.total_quantity,
    min_warning_quantity: i.min_warning_quantity,
    stock_bajo: i.total_quantity <= i.min_warning_quantity,
  }));
}

/** Disciplinas a las que pertenece el profe, vía sus categorías asignadas. */
export async function getDisciplinasDelProfe(userId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("professor_categories")
    .select("categories(discipline_id)")
    .eq("professor_id", userId);

  const ids = (data ?? []).map((d: any) => d.categories?.discipline_id).filter(Boolean);
  return Array.from(new Set(ids));
}

export type MovimientoReciente = {
  id: string;
  item_name: string;
  type: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  user_name: string | null;
};

export async function getMovimientosRecientes(limit = 15): Promise<MovimientoReciente[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("inventory_movements")
    .select("id, type, quantity, notes, created_at, inventory_items(name), profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((m: any) => ({
    id: m.id,
    item_name: m.inventory_items?.name ?? "—",
    type: m.type,
    quantity: m.quantity,
    notes: m.notes,
    created_at: m.created_at,
    user_name: m.profiles?.full_name ?? null,
  }));
}
