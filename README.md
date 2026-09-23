# Club Deportivo — App

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
- `supabase/migrations/` — el esquema SQL completo, versionado en orden numérico (001 a 010).

## Regenerar tipos de TypeScript (opcional)

Si en algún momento corrés esto localmente:
```bash
npx supabase gen types typescript --project-id TU_PROJECT_ID > src/types/database.types.ts
```

## Íconos PWA

Faltan los archivos reales en `public/icons/`: `icon-192.png` (192x192) e `icon-512.png` (512x512). Podés generarlos con cualquier herramienta online de favicon/PWA icon a partir del logo del club y subirlos directo por la interfaz web de GitHub.

## V0.5.5 — Control de ingreso

Se incorpora la pantalla inicial de operación rápida para portería. Esta iteración no modifica el esquema de Supabase.


## V0.5.8 — Confirmación visual de ingreso

La pantalla de ingreso muestra una confirmación operativa con nombre, DNI, categorías y hora. La búsqueda manual, DNI y QR comparten el mismo registro de ingreso y almacenan el método utilizado.

## V0.5.9 — Rendimiento de ingreso

La búsqueda y el registro de ingreso usan funciones RPC de Supabase para reducir viajes entre navegador, servidor y base de datos. Se agregan índices para nombre/DNI y una caché de búsqueda en la interfaz.

## V0.5.10 — Portero operativo

El rol portero queda limitado a Control de ingreso. No muestra Alumnos, Asistencia ni otras secciones y las rutas se bloquean también por middleware.

## V0.5.11 — Búsqueda global

Se agrega una búsqueda global en la cabecera para usuarios con acceso a Alumnos. Permite buscar por nombre o DNI y abrir directamente el legajo existente. Portero no ve ni utiliza esta búsqueda.

Aplicar la migración `017_busqueda_global_alumnos.sql`.

## V0.5.12 — Header responsive

Se reorganiza el encabezado para que la búsqueda global forme parte del flujo normal del layout y sus resultados no se superpongan al saludo o la navegación.

## V0.5.14 — Legajo operativo

La ficha del alumno incorpora resumen de actividad, últimos ingresos, cantidad de documentos y accesos rápidos a documentación, asistencia e ingreso.

## V0.6.0 — Legajo operativo completo

Se agrupa el módulo de legajo en una única experiencia de trabajo: resumen de asistencia, categorías editables, documentos recientes, últimos ingresos, historial de asistencia y acciones rápidas.

No requiere migraciones nuevas de Supabase.

## V0.7.0 — Dashboard y operación diaria

Se incorpora un dashboard operativo por rol, con métricas del día, actividad reciente, alertas y accesos rápidos. No agrega migraciones nuevas.

## V0.7.1 — Alertas y operación diaria avanzada

- Centro de operación diaria en el dashboard.
- Alertas para asistencias sin registrar, asistencias en progreso, stock agotado/bajo y categorías sin profesor.
- Vista de estado de categorías para profesores.
- Botón de actualización manual del dashboard sin cambiar de página.
- Se mantienen los roles y flujos aprobados en V0.7.0.
- No se agregan migraciones de Supabase.


### Corrección V0.7.1.1
Se ajustó el tipo de `DashboardDailyOperation.value` para permitir estados textuales y valores numéricos.


## V0.8.0 — Usuarios y permisos

- El profesor puede guardar y finalizar asistencia de sus categorías asignadas.
- El operador solo puede gestionar asistencia si tiene la vista `asistencia` habilitada.
- El portero nunca puede gestionar asistencia.
- La categoría de un profesor se valida también en la acción del servidor y en RLS.
- Una asistencia finalizada no puede ser modificada/reabierta por un no-admin.
- La pantalla de Usuarios muestra los permisos efectivos.
- Nueva migración: `018_permisos_asistencia_profesor.sql`.


## V0.9.0 — Cuotas y cobranzas

Se incorpora un módulo administrativo preparado para el futuro del club:

- Planes y membresías.
- Plan inicial **Gratis / Comunitario** con monto $0.
- Asignación de plan por alumno.
- Generación manual de cuotas.
- Registro de pagos y saldo pendiente.
- Medios de pago: efectivo, transferencia, Mercado Pago, tarjeta y otros.
- Control de permisos: solo admin/operador con la vista `cuotas`.
- Resumen económico en el legajo para admin/operador.

La versión no obliga a cobrar cuotas hoy: el club puede utilizar el plan gratuito y dejar el circuito de cobranzas preparado para activarlo más adelante.
