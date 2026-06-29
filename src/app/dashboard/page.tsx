import { DocumentRequestStatusBadge } from "@/components/document-requests/document-request-status";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatWorkspaceType } from "@/components/workspaces/workspace-status";
import { getCurrentUser, serverApiFetch } from "@/lib/api/server";
import type { DashboardSummary, Organization } from "@/lib/api/types";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  FolderKanban,
  TimerReset,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getCurrentOrganization(): Promise<{
  data: Organization | null;
  error: string | null;
}> {
  try {
    return {
      data: await serverApiFetch<Organization>("/organizations/current"),
      error: null,
    };
  } catch {
    return {
      data: null,
      error: "No pudimos cargar la informacion de la organizacion",
    };
  }
}

async function getDashboardSummary(): Promise<{
  data: DashboardSummary | null;
  error: string | null;
}> {
  try {
    return {
      data: await serverApiFetch<DashboardSummary>("/dashboard/summary"),
      error: null,
    };
  } catch {
    return {
      data: null,
      error: "No pudimos cargar el resumen del panel",
    };
  }
}

const emptySummary: DashboardSummary = {
  totalClients: 0,
  activeWorkspaces: 0,
  pendingRequests: 0,
  overdueRequests: 0,
  completedRequests: 0,
  recentWorkspaces: [],
  dueSoonRequests: [],
  recentActivity: [],
};

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const metrics = [
  {
    label: "Clientes",
    key: "totalClients",
    detail: "Cartera disponible",
    icon: Building2,
    tone: "border-cyan-200/20 bg-cyan-200/10 text-cyan-100",
  },
  {
    label: "Procesos",
    key: "activeWorkspaces",
    detail: "En movimiento",
    icon: FolderKanban,
    tone: "border-emerald-200/20 bg-emerald-200/10 text-emerald-100",
  },
  {
    label: "Pendientes",
    key: "pendingRequests",
    detail: "Por recibir o resolver",
    icon: FileText,
    tone: "border-amber-200/20 bg-amber-200/10 text-amber-100",
  },
  {
    label: "Vencidas",
    key: "overdueRequests",
    detail: "Necesitan atencion",
    icon: TriangleAlert,
    tone: "border-rose-200/20 bg-rose-200/10 text-rose-100",
  },
  {
    label: "Aprobadas",
    key: "completedRequests",
    detail: "Cerradas correctamente",
    icon: FileCheck2,
    tone: "border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-100",
  },
] as const;

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: organization, error: organizationError },
    { data: summaryData, error: summaryError },
  ] = await Promise.all([getCurrentOrganization(), getDashboardSummary()]);

  const summary = summaryData ?? emptySummary;
  const organizationName = organization?.name ?? user.organization.name;

  return (
    <DashboardShell
      organizationName={organizationName}
      userName={user.name}
      userEmail={user.email}
    >
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Panel</Badge>
              <Badge className="bg-emerald-200/[0.12] text-emerald-100 hover:bg-emerald-200/[0.12]">
                Cuenta activa
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-normal text-balance md:text-3xl">
              Panel documental de {organizationName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              Vista central para revisar clientes, procesos, solicitudes y
              vencimientos sin perder el foco comercial.
            </p>
          </div>

          <div className="glass-card flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
            <span className="font-medium">Espacio listo para operar</span>
          </div>
        </div>

        {organizationError || summaryError ? (
          <div className="rounded-md border border-amber-200/25 bg-amber-200/10 px-4 py-3 text-sm text-amber-100 backdrop-blur-xl">
            {[organizationError, summaryError].filter(Boolean).join(". ")}.
            Intenta nuevamente en unos minutos.
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <Card key={metric.key} className="glass-card rounded-md">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardDescription className="text-white/60">
                    {metric.label}
                  </CardDescription>
                  <CardTitle className="mt-2 text-3xl tracking-normal text-white">
                    {summary[metric.key]}
                  </CardTitle>
                </div>
                <div className={`shrink-0 rounded-md border p-2 ${metric.tone}`}>
                  <metric.icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent className="text-sm text-white/60">
                {metric.detail}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="glass-card rounded-md">
            <CardHeader>
              <CardTitle className="text-base tracking-normal text-white">
                Procesos recientes
              </CardTitle>
              <CardDescription className="text-white/60">
                Clientes y procesos con movimiento reciente.
              </CardDescription>
              <CardAction>
                <Link
                  className="inline-flex size-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-white/60 transition hover:bg-white/[0.1] hover:text-white"
                  href="/dashboard/workspaces"
                  title="Ver procesos"
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.recentWorkspaces.length ? (
                summary.recentWorkspaces.map((workspace, index) => (
                  <div key={workspace.id}>
                    <Link
                      className="group grid gap-3 rounded-md p-1 transition hover:bg-white/[0.04] sm:grid-cols-[1fr_auto]"
                      href={`/dashboard/workspaces/${workspace.id}`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="min-w-0 truncate font-medium text-white">
                            {workspace.name}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-white/60">
                          {workspace.client.name} -{" "}
                          {formatWorkspaceType(workspace.workspaceType)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-white/55 sm:justify-end">
                        <Badge variant="outline">
                          {workspace._count.documentRequests} solicitudes
                        </Badge>
                        <span>
                          {workspace.dueDate
                            ? formatDate(workspace.dueDate)
                            : "Sin fecha"}
                        </span>
                      </div>
                    </Link>
                    {index < summary.recentWorkspaces.length - 1 ? (
                      <Separator className="mt-4 bg-white/10" />
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={FolderKanban}
                  text="Cuando abras procesos para tus clientes, apareceran aqui."
                />
              )}
            </CardContent>
          </Card>

          <Card className="glass-card rounded-md">
            <CardHeader>
              <CardTitle className="text-base tracking-normal text-white">
                Solicitudes criticas
              </CardTitle>
              <CardDescription className="text-white/60">
                Vencidas y prioridades de los proximos dias.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.dueSoonRequests.length ? (
                summary.dueSoonRequests.map((request, index) => (
                  <div key={request.id}>
                    <Link
                      className="group block rounded-md p-1 transition hover:bg-white/[0.04]"
                      href={`/dashboard/workspaces/${request.workspace.id}`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="min-w-0 truncate font-medium text-white">
                          {request.title}
                        </p>
                        <DocumentRequestStatusBadge status={request.status} />
                      </div>
                      <p className="mt-1 text-sm text-white/60">
                        {request.workspace.client.name} -{" "}
                        {request.workspace.name}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/55">
                        <Clock3 className="size-4 text-cyan-100" />
                        <span>
                          {request.dueDate
                            ? formatDate(request.dueDate)
                            : "Sin fecha"}
                        </span>
                        {request.assignedClientContact ? (
                          <span className="truncate">
                            {request.assignedClientContact.name}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                    {index < summary.dueSoonRequests.length - 1 ? (
                      <Separator className="mt-4 bg-white/10" />
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Clock3}
                  text="No hay vencimientos criticos por ahora."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="glass-card rounded-md">
            <CardHeader>
              <CardTitle className="text-base tracking-normal text-white">
                Organizacion activa
              </CardTitle>
              <CardDescription className="text-white/60">
                Informacion principal de tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  label="Nombre"
                  value={organization?.name ?? user.organization.name}
                />
                <InfoItem
                  label="Razon social"
                  value={organization?.legalName ?? "No definida"}
                />
                <InfoItem
                  label="Industria"
                  value={organization?.industry ?? "No definida"}
                />
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase text-white/50">
                    Puesta en marcha
                  </dt>
                  <dd className="mt-1">
                    <Badge
                      variant={
                        organization?.onboardingCompleted
                          ? "default"
                          : "secondary"
                      }
                    >
                      {organization?.onboardingCompleted
                        ? "Completado"
                        : "Pendiente"}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-md">
            <CardHeader>
              <CardTitle className="text-base tracking-normal text-white">
                Actividad reciente
              </CardTitle>
              <CardDescription className="text-white/60">
                Ultimos movimientos relevantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.recentActivity.length ? (
                summary.recentActivity.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06]">
                        <FileText className="size-4 text-white/60" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">
                          {activity.title}
                        </p>
                        <p className="mt-1 text-sm text-white/60">
                          {activity.description}
                        </p>
                        <p className="mt-2 text-xs text-white/45">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                    {index < summary.recentActivity.length - 1 ? (
                      <Separator className="mt-4 bg-white/10" />
                    ) : null}
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={TimerReset}
                  text="A medida que avance tu operacion, veras novedades aqui."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardShell>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase text-white/50">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-white">{value}</dd>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: typeof FolderKanban;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.04] p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-cyan-100" />
      <p className="text-sm leading-6 text-white/60">{text}</p>
    </div>
  );
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
