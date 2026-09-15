CREATE VIEW public.v_stock_bajo AS
SELECT i.id, i.name, d.name AS discipline_name, i.total_quantity, i.min_warning_quantity
FROM public.inventory_items i
LEFT JOIN public.disciplines d ON d.id = i.discipline_id
WHERE i.total_quantity <= i.min_warning_quantity;

CREATE VIEW public.v_resumen_asistencia AS
SELECT
  a.id AS attendance_id,
  c.name AS category_name,
  a.date,
  COUNT(*) FILTER (WHERE ad.status = 'presente')   AS presentes,
  COUNT(*) FILTER (WHERE ad.status = 'ausente')    AS ausentes,
  COUNT(*) FILTER (WHERE ad.status = 'justificado') AS justificados
FROM public.attendances a
JOIN public.categories c ON c.id = a.category_id
LEFT JOIN public.attendance_details ad ON ad.attendance_id = a.id
GROUP BY a.id, c.name, a.date;
