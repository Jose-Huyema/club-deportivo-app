import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_ONLY_PREFIXES = ["/admin"];
const PROTECTED_PREFIXES = ["/asistencia", "/alumnos", "/inventario", "/admin"];

export async function middleware(request: NextRequest) {
  // ── Versión temporal de diagnóstico ──
  // Envuelve todo en try/catch y devuelve el error como JSON plano en vez
  // de dejar que explote sin detalle. SACAR esto una vez resuelto.
  try {
    let response = NextResponse.next({ request: { headers: request.headers } });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      return debugJson("supabase.auth.getUser()", userError, request);
    }

    const path = request.nextUrl.pathname;
    const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
    const isAdminOnly = ADMIN_ONLY_PREFIXES.some((p) => path.startsWith(p));

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (isAdminOnly && user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        return debugJson("consulta a profiles desde middleware", profileError, request);
      }

      if (profile?.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/asistencia";
        return NextResponse.redirect(url);
      }
    }

    return response;
  } catch (err: any) {
    return debugJson("excepción no controlada en middleware", { message: err?.message, stack: err?.stack }, request);
  }
  // ── Fin de la versión temporal ──
}

function debugJson(etapa: string, error: unknown, request: NextRequest) {
  return new NextResponse(
    JSON.stringify({ etapa, path: request.nextUrl.pathname, error }, null, 2),
    { status: 500, headers: { "content-type": "application/json" } }
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json).*)",
  ],
};
