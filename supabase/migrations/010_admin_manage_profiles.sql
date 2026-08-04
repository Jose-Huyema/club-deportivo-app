-- La policy original solo dejaba a cada usuario editar su propio perfil.
-- Esta la complementa: un admin puede editar (ej: cambiar rol) cualquier perfil.
-- Postgres combina policies del mismo comando con OR, así que no reemplaza
-- a "profiles_update_own", la complementa.
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE
  USING (public.is_admin());
