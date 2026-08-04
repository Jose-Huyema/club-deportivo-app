export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Club Deportivo</h1>
          <p className="mt-1 text-sm text-slate-300">Asistencia e inventario</p>
        </div>
        {children}
      </div>
    </div>
  );
}
