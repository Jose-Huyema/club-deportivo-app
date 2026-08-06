import { getAppSettings } from "@/lib/data/settings";
import { LogoImage } from "@/components/layout/LogoImage";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await getAppSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <LogoImage alt={settings.club_name} />
          <h1 className="text-2xl font-bold text-white">{settings.club_name}</h1>
          <p className="mt-1 text-sm text-slate-300">{settings.club_subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
