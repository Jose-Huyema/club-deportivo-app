import { requireAdmin } from "@/lib/data/profile";
import { AdminTabs } from "@/components/layout/AdminTabs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div>
      <AdminTabs />
      {children}
    </div>
  );
}
