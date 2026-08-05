export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* Logo del club — subí tu imagen a /public/logo.png con ese nombre exacto */}
          <img
            src="/logo.png"
            alt="Club Deportivo"
            className="mx-auto mb-3 h-20 w-20 object-contain"
          />
          <h1 className="text-2xl font-bold text-white">Club Deportivo</h1>
          <p className="mt-1 text-sm text-slate-300">Asistencia e inventario</p>
        </div>
        {children}
      </div>
    </div>
  );
}
