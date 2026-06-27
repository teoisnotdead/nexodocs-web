import { DashboardShell } from "@/components/dashboard-shell";
import { WorkspaceForm } from "@/components/workspaces/workspace-form";
import { getCurrentUser, serverApiFetch } from "@/lib/api/server";
import type {
  ClientListResponse,
  Workspace,
} from "@/lib/api/types";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type EditWorkspacePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditWorkspacePage({
  params,
}: EditWorkspacePageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const [workspace, clients] = await Promise.all([
    getWorkspace(id),
    serverApiFetch<ClientListResponse>("/clients"),
  ]);

  if (!workspace) {
    notFound();
  }

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
            Editar {workspace.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
            Actualiza cliente, estado, fechas y contexto del proceso.
          </p>
        </div>

        <WorkspaceForm
          mode="edit"
          clients={clients.items}
          workspace={workspace}
        />
      </section>
    </DashboardShell>
  );
}

async function getWorkspace(id: string) {
  try {
    return await serverApiFetch<Workspace>(`/workspaces/${id}`);
  } catch {
    return null;
  }
}
