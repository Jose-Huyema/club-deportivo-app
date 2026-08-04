ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "disciplines_read" ON public.disciplines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "disciplines_write" ON public.disciplines FOR ALL USING (public.is_admin());

CREATE POLICY "categories_read" ON public.categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "categories_write" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "students_read" ON public.students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "students_write" ON public.students FOR ALL USING (public.is_admin());

CREATE POLICY "enrollments_read" ON public.enrollments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "enrollments_write" ON public.enrollments FOR ALL USING (public.is_admin());

CREATE POLICY "attendances_profe_scope" ON public.attendances FOR ALL
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.professor_categories pc
      WHERE pc.category_id = attendances.category_id AND pc.professor_id = auth.uid()
    )
  );

CREATE POLICY "attendance_details_scope" ON public.attendance_details FOR ALL
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.attendances a
      JOIN public.professor_categories pc ON pc.category_id = a.category_id
      WHERE a.id = attendance_details.attendance_id AND pc.professor_id = auth.uid()
    )
  );

CREATE POLICY "inventory_items_read" ON public.inventory_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "inventory_items_write" ON public.inventory_items FOR ALL USING (public.is_admin());

CREATE POLICY "inventory_movements_read" ON public.inventory_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "inventory_movements_insert" ON public.inventory_movements FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
