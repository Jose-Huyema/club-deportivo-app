import { requireProfile } from "@/lib/data/profile";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <div>
      <p>Hola, {profile.full_name} (rol: {profile.role})</p>
      <hr />
      {children}
    </div>
  );
}
