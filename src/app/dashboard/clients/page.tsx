import { DashboardShell } from "@/components/dashboard-shell";
import { ClientList } from "@/components/clients/client-list";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, serverApiFetch } from "@/lib/api/server";
import type { ClientListResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const data = await serverApiFetch<ClientListResponse>("/clients");

  return (
    <DashboardShell
      organizationName={user.organization.name}
      userName={user.name}
      userEmail={user.email}
      activePath="/dashboard/clients"
    >
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-cyan-100">Clientes</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-balance md:text-3xl">
              Cartera de clientes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              Organiza empresas, contactos y datos clave para operar cada
              solicitud documental con claridad.
            </p>
          </div>
          <Link
            href="/dashboard/clients/new"
            className={cn(buttonVariants(), "rounded-md")}
          >
            <Plus className="size-4" />
            Nuevo cliente
          </Link>
        </div>

        <ClientList data={data} />
      </section>
    </DashboardShell>
  );
}
