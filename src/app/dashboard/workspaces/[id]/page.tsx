import { ArchiveWorkspaceButton } from "@/components/workspaces/archive-workspace-button";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { ClientPortalSharePanel } from "@/components/client-portal/client-portal-share-panel";
import { DocumentRequestsSection } from "@/components/document-requests/document-requests-section";
import {
  WorkspaceStatusBadge,
  formatWorkspaceType,
} from "@/components/workspaces/workspace-status";
import { DashboardShell } from "@/components/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, serverApiFetch } from "@/lib/api/server";
import type {
  ChecklistTemplateListResponse,
  ActivityLogListResponse,
  Client,
  DocumentFile,
  DocumentListResponse,
  DocumentRequestListResponse,
  Workspace,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";
import {
  Building2,
  CalendarDays,
  Edit3,
  FolderKanban,
  TimerReset,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

type WorkspaceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorkspaceDetailPage({
  params,
}: WorkspaceDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const workspace = await getWorkspace(id);

  if (!workspace) {
    notFound();
  }

  const [documentRequests, client, checklistTemplates, activity] =
    await Promise.all([
      getDocumentRequests(workspace.id),
      getClient(workspace.client.id),
      getChecklistTemplates(),
      getWorkspaceActivity(workspace.id),
    ]);
  const documentsByRequestId = await getDocumentsByRequestId(
    documentRequests.items,
  );

  return (
    <DashboardShell
      organizationName={user.organization.name}
      userName={user.name}
      userEmail={user.email}
      activePath="/dashboard/workspaces"
      breadcrumbs={[
        { label: "Inicio", href: "/dashboard" },
        { label: "Clientes", href: "/dashboard/clients" },
        {
          label: workspace.client.name,
          href: `/dashboard/clients/${workspace.client.id}`,
        },
        { label: workspace.name },
      ]}
    >
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-normal text-balance md:text-3xl">
                {workspace.name}
              </h1>
              <WorkspaceStatusBadge status={workspace.status} />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              {workspace.description ??
                "Espacio documental para coordinar avances y mantener el contexto del cliente."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/dashboard/workspaces/${workspace.id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]",
              )}
            >
              <Edit3 className="size-4" />
              Editar
            </Link>
            <ArchiveWorkspaceButton workspaceId={workspace.id} />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <Card className="glass-card rounded-md">
            <CardHeader>
              <CardTitle className="text-base tracking-normal text-white">
                Ficha del proceso
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Detail
                icon={Building2}
                label="Cliente"
                value={
                  <Link
                    href={`/dashboard/clients/${workspace.client.id}`}
                    className="rounded-sm text-cyan-100 transition hover:text-cyan-50 hover:underline"
                  >
                    {workspace.client.name}
                  </Link>
                }
              />
              <Detail
                icon={FolderKanban}
                label="Tipo"
                value={formatWorkspaceType(workspace.workspaceType)}
              />
              <Detail
                icon={CalendarDays}
                label="Periodo"
                value={formatPeriod(workspace)}
              />
              <Detail
                icon={TimerReset}
                label="Fecha limite"
                value={formatDate(workspace.dueDate)}
              />
            </CardContent>
          </Card>

          <Card className="glass-card rounded-md">
            <CardHeader>
              <CardTitle className="text-base tracking-normal text-white">
                Seguimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Detail
                icon={UserRound}
                label="Creado por"
                value={workspace.createdBy.name}
              />
              <Detail
                icon={CalendarDays}
                label="Ultima actualizacion"
                value={formatDate(workspace.updatedAt)}
              />
              <div>
                <p className="text-xs font-medium uppercase text-white/50">
                  Estado actual
                </p>
                <div className="mt-2">
                  <WorkspaceStatusBadge status={workspace.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ClientPortalSharePanel
          workspaceId={workspace.id}
          contacts={client?.contacts ?? []}
        />

        <Card className="glass-card rounded-md">
          <CardHeader>
            <CardTitle className="text-base tracking-normal text-white">
              Solicitudes de documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentRequestsSection
              workspaceId={workspace.id}
              contacts={client?.contacts ?? []}
              templates={checklistTemplates.items}
              data={documentRequests}
              documentsByRequestId={documentsByRequestId}
            />
          </CardContent>
        </Card>

        <Card className="glass-card rounded-md">
          <CardHeader>
            <CardTitle className="text-base tracking-normal text-white">
              Historial del proceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityTimeline
              workspaceId={workspace.id}
              initialData={activity}
            />
          </CardContent>
        </Card>
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

async function getDocumentRequests(
  workspaceId: string,
): Promise<DocumentRequestListResponse> {
  try {
    return await serverApiFetch<DocumentRequestListResponse>(
      `/workspaces/${workspaceId}/document-requests`,
    );
  } catch {
    return {
      items: [],
      summary: {
        pending: 0,
        submitted: 0,
        inReview: 0,
        observed: 0,
        approved: 0,
      },
    };
  }
}

async function getClient(id: string) {
  try {
    return await serverApiFetch<Client>(`/clients/${id}`);
  } catch {
    return null;
  }
}

async function getChecklistTemplates(): Promise<ChecklistTemplateListResponse> {
  try {
    return await serverApiFetch<ChecklistTemplateListResponse>(
      "/checklist-templates",
    );
  } catch {
    return { items: [] };
  }
}

async function getWorkspaceActivity(
  workspaceId: string,
): Promise<ActivityLogListResponse> {
  try {
    return await serverApiFetch<ActivityLogListResponse>(
      `/workspaces/${workspaceId}/activity?limit=10&offset=0`,
    );
  } catch {
    return { items: [], total: 0, limit: 10, offset: 0, hasMore: false };
  }
}

async function getDocumentsByRequestId(
  requests: DocumentRequestListResponse["items"],
): Promise<Record<string, DocumentFile[]>> {
  const entries = await Promise.all(
    requests.map(async (request) => {
      try {
        const data = await serverApiFetch<DocumentListResponse>(
          `/document-requests/${request.id}/documents`,
        );

        return [request.id, data.items] as const;
      } catch {
        return [request.id, []] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value?: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-white/50">
        <Icon className="size-3.5 shrink-0" />
        <span>{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-medium text-white">
        {value ?? "No definido"}
      </p>
    </div>
  );
}

function formatPeriod(workspace: Workspace) {
  if (!workspace.periodYear && !workspace.periodMonth) {
    return "No definido";
  }

  if (workspace.periodYear && workspace.periodMonth) {
    return `${monthName(workspace.periodMonth)} ${workspace.periodYear}`;
  }

  return workspace.periodYear ? String(workspace.periodYear) : monthName(workspace.periodMonth!);
}

function monthName(month: number) {
  return new Intl.DateTimeFormat("es-CL", { month: "long" }).format(
    new Date(Date.UTC(2026, month - 1, 1)),
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "No definido";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
