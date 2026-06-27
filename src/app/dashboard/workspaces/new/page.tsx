import { DashboardShell } from "@/components/dashboard-shell";
import { WorkspaceForm } from "@/components/workspaces/workspace-form";
import { getCurrentUser, serverApiFetch } from "@/lib/api/server";
import type { ClientListResponse } from "@/lib/api/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewWorkspacePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const clients = await serverApiFetch<ClientListResponse>("/clients");

  return (
    <DashboardShell
      organizationName={user.organization.name}
      userName={user.name}
      userEmail={user.email}
      activePath="/dashboard/workspaces"
    >
      <section className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-medium text-cyan-100">Casos / Procesos</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-balance md:text-3xl">
            Nuevo proceso
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Crea un espacio asociado a un cliente para ordenar seguimiento,
            fechas y responsables.
          </p>
        </div>

        <WorkspaceForm mode="create" clients={clients.items} />
      </section>
    </DashboardShell>
  );
}
