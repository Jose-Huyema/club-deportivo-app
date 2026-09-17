-- V0.5.9: Portero tiene una única superficie operativa: Control de ingreso.
UPDATE public.profiles
SET allowed_views = ARRAY['ingreso']::text[]
WHERE role = 'portero';

UPDATE public.invited_emails
SET allowed_views = ARRAY['ingreso']::text[]
WHERE role = 'portero';
