import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const VIEW_BY_PREFIX: Record<string, string> = {
  "/asistencia": "asistencia",
  "/alumnos": "alumnos",
  "/inventario": "inventario",
  "/documentos": "documentos",
  "/reportes": "reportes",
};

const ADMIN_ONLY_PREFIXES = ["/admin", "/usuarios"];
const PROTECTED_PREFIXES = [...Object.keys(VIEW_BY_PREFIX), ...ADMIN_ONLY_PREFIXES];

export async function middleware(request: NextRequest) {
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

  const { data, error: userError } = await supabase.auth.getUser();
  const user = userError ? null : data.user;

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isProtected && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, allowed_views")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const allowedViews: string[] = profile?.allowed_views ?? [];

    const esRutaAdminOnly = ADMIN_ONLY_PREFIXES.some((p) => path.startsWith(p));
    if (esRutaAdminOnly && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    const matchedPrefix = Object.keys(VIEW_BY_PREFIX).find((p) => path.startsWith(p));
    if (matchedPrefix && role !== "admin" && !allowedViews.includes(VIEW_BY_PREFIX[matchedPrefix])) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|logo.png|watermark.png).*)",
  ],
};
