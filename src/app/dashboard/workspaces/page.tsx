import { DashboardShell } from "@/components/dashboard-shell";
import { WorkspaceList } from "@/components/workspaces/workspace-list";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser, serverApiFetch } from "@/lib/api/server";
import type { WorkspaceListResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const data = await serverApiFetch<WorkspaceListResponse>("/workspaces");

  return (
    <DashboardShell
      organizationName={user.organization.name}
      userName={user.name}
      userEmail={user.email}
      activePath="/dashboard/workspaces"
    >
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-cyan-100">Casos / Procesos</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-balance md:text-3xl">
              Espacios de trabajo documental
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              Coordina cada flujo con su cliente, estado, fechas y contexto en
              una vista ordenada.
            </p>
          </div>
          <Link
            href="/dashboard/workspaces/new"
            className={cn(buttonVariants(), "rounded-md")}
          >
            <Plus className="size-4" />
            Nuevo proceso
          </Link>
        </div>

        <WorkspaceList data={data} />
      </section>
    </DashboardShell>
  );
}
