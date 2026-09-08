# Club Deportivo — App

**Versión de trabajo: 0.5.0 — saneamiento técnico y consolidación de esquema**

Gestión de asistencia, alumnos, usuarios e inventario para el club. Next.js 14 (App Router) + Tailwind + Supabase, desplegado como PWA en Vercel.

Este repo está pensado para desplegarse **directo desde GitHub + Vercel**, sin correr nada localmente.

## Variables de entorno necesarias (en Vercel)

| Variable | De dónde sale | Pública/Secreta |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | **Secreta** — nunca la pongas con prefijo `NEXT_PUBLIC_` |

La `service_role` key se usa solo del lado del servidor (Server Actions) para invitar usuarios nuevos vía la Admin API de Supabase. `src/lib/supabase/admin.ts` importa `server-only`, lo que hace fallar el build si alguna vez se intenta usar desde un componente de cliente.

## Estructura

- `src/app/(auth)/login` — login.
- `src/app/(dashboard)/asistencia` — listado de categorías y toma de asistencia (un toque por alumno).
- `src/app/(dashboard)/alumnos` — listado, alta y detalle (incluye activar/desactivar e inscripciones).
- `src/app/(dashboard)/inventario` — stock con alertas y registro de movimientos.
- `src/app/(dashboard)/admin` — disciplinas, categorías, usuarios (invitar, cambiar rol, asignar categorías).
- `src/lib/supabase/` — `client.ts` (browser), `server.ts` (server components/actions), `admin.ts` (service role, solo server).
- `src/lib/data/` — funciones de lectura reutilizables por página.
- `supabase/migrations/` — el esquema SQL versionado. V0.5 agrega `011_v05_roles.sql` y `012_v05_schema_consolidation.sql` para alinear la base con el código actual.

## V0.5 — cambios importantes

- Se consolidaron los roles `admin`, `profe`, `operador` y `portero`.
- Se agregaron al esquema los campos de alumnos que ya usa la aplicación (`dni`, `phone`, `address`, medidas y talle).
- Se agregaron `checkins`, `student_documents`, `app_settings` e `invited_emails`.
- Se incorporó `autorizado`, `genero` y `allowed_views` en `profiles`.
- El acceso por Google requiere una autorización previa del administrador.
- El inventario rechaza egresos superiores al stock disponible.
- El bucket `documentos-alumnos` queda privado.
- Se corrigió el middleware duplicado y la prioridad de `/asistencia/scanner`.
- Los clientes Supabase quedan tipados con `Database`.

> **Importante:** aplicar primero `011_v05_roles.sql` y luego `012_v05_schema_consolidation.sql` en el proyecto Supabase. Si la base remota ya tiene cambios manuales, conviene revisar el estado antes de ejecutar migraciones.

## Regenerar tipos de TypeScript (opcional)

Si en algún momento corrés esto localmente:
```bash
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.types.ts
```

## Íconos PWA

Faltan los archivos reales en `public/icons/`: `icon-192.png` (192x192) e `icon-512.png` (512x512). Podés generarlos con cualquier herramienta online de favicon/PWA icon a partir del logo del club y subirlos directo por la interfaz web de GitHub.
