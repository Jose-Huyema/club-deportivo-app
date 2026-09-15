-- professor_categories tiene RLS activado (migración 008) pero nunca se le
-- crearon políticas. Sin políticas, Postgres deniega TODO acceso por default
-- (incluso al admin), lo que rompe:
--   1) la asignación/desasignación de categorías a profes (INSERT/DELETE bloqueados)
--   2) la lectura de "categoria_ids" en Usuarios (SELECT bloqueado -> siempre vacío)
--   3) la política "attendance_details_scope" (008), que hace un JOIN contra
--      esta tabla y por lo tanto también quedaba bloqueada para los profes.

CREATE POLICY "professor_categories_read" ON public.professor_categories FOR SELECT
  USING (
    public.is_admin() OR professor_id = auth.uid()
  );

CREATE POLICY "professor_categories_write" ON public.professor_categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
