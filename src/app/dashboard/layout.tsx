import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Separator } from "@/components/ui/separator";
import { CommandPalette } from "@/components/search/CommandPalette";

/**
 * Dashboard layout - UNICO punto di controllo autenticazione per /dashboard/*
 *
 * Questo layout protegge TUTTE le route sotto /dashboard/ con una singola verifica.
 * Le singole pages NON devono ricontrollare la sessione - è garantita qui.
 *
 * Sicurezza:
 * - Chiama getSession() che valida completamente la sessione Better Auth
 * - Verifica firma del cookie, scadenza, e integrità del token
 * - Redirect a /login se la sessione non è valida
 * - RBAC (controllo ruoli) gestito nei singoli componenti tramite RoleGate
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <DashboardNav />
          </aside>

          <Separator className="md:hidden" />

          {/* Main content */}
          <main className="md:col-span-3">{children}</main>
        </div>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette />
    </>
  );
}
