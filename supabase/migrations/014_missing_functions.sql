-- Estas dos funciones existen en producción (confirmadas con
-- pg_get_functiondef) pero nunca se versionaron. Las agrego tal cual están
-- en vivo, y de paso corrijo 3 políticas que en el repo (migración 008)
-- quedaron desactualizadas: usan is_admin() ahí, pero en producción alguien
-- las cambió a is_editor()/is_profe_de_disciplina() sin dejar migración.
-- Esta migración deja el repo 1:1 con lo que ya corre en tu base real.

CREATE OR REPLACE FUNCTION public.is_editor()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','operador')
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_profe_de_disciplina(p_discipline_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.professor_categories pc
    JOIN public.categories c ON c.id = pc.category_id
    WHERE pc.professor_id = auth.uid() AND c.discipline_id = p_discipline_id
  );
$function$;

-- enrollments_write y students_write: la 008 los dejó en is_admin(), en
-- producción son is_editor() (admin u operador).
DROP POLICY IF EXISTS "enrollments_write" ON public.enrollments;
CREATE POLICY "enrollments_write" ON public.enrollments FOR ALL USING (public.is_editor());

DROP POLICY IF EXISTS "students_write" ON public.students;
CREATE POLICY "students_write" ON public.students FOR ALL USING (public.is_editor());

-- inventory_movements_insert: en la 008 solo pedía estar autenticado. En
-- producción es más fino: admin/operador siempre, y profe solo puede
-- registrar egresos/bajas (nunca ingresos) de artículos de su propia
-- disciplina.
DROP POLICY IF EXISTS "inventory_movements_insert" ON public.inventory_movements;
CREATE POLICY "inventory_movements_insert" ON public.inventory_movements FOR INSERT
  WITH CHECK (
    public.is_editor() OR
    (
      type = ANY (ARRAY['egreso'::movement_type, 'baja_desgaste'::movement_type]) AND
      EXISTS (
        SELECT 1 FROM public.inventory_items i
        WHERE i.id = inventory_movements.item_id
          AND i.discipline_id IS NOT NULL
          AND public.is_profe_de_disciplina(i.discipline_id)
      )
    )
  );
