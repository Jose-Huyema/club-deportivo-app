import { requireAdmin } from "@/lib/data/profile";
import { getAppSettings } from "@/lib/data/settings";
import { ConfiguracionGeneralForm } from "./ConfiguracionGeneralForm";

export default async function ConfiguracionGeneralPage() {
  await requireAdmin();
  const settings = await getAppSettings();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-primary">Configuración general</h1>
      <p className="mb-5 text-sm text-slate-500">
        Estos datos se muestran en la pantalla de inicio de sesión y en el resto de la app.
      </p>
      <ConfiguracionGeneralForm settings={settings} />
    </div>
  );
}
