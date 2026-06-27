import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, serverApiFetch } from "@/lib/api/server";
import type { CurrentPlanResponse } from "@/lib/api/types";
import {
  Boxes,
  Building2,
  CheckCircle2,
  Database,
  FolderKanban,
  Gauge,
  Send,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const usageItems = [
  {
    key: "clients",
    label: "Clientes",
    description: "Cartera activa",
    icon: Building2,
  },
  {
    key: "activeWorkspaces",
    label: "Procesos",
    description: "Procesos abiertos",
    icon: FolderKanban,
  },
  {
    key: "storageGb",
    label: "Almacenamiento",
    description: "Archivos registrados",
    icon: Database,
  },
  {
    key: "internalUsers",
    label: "Usuarios",
    description: "Equipo interno",
    icon: Users,
  },
  {
    key: "templates",
    label: "Plantillas",
    description: "Listas reutilizables",
    icon: Boxes,
  },
  {
    key: "reminders",
    label: "Recordatorios",
    description: "Capacidad disponible",
    icon: Send,
  },
] as const;

export default async function PlanSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const planData = await getPlanData();

  return (
    <DashboardShell
      organizationName={user.organization.name}
      userName={user.name}
      userEmail={user.email}
      activePath="/dashboard/settings/plan"
    >
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Configuracion</Badge>
              <Badge className="bg-cyan-200/[0.12] text-cyan-100 hover:bg-cyan-200/[0.12]">
                Plan comercial
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-normal text-balance md:text-3xl">
              Plan y uso
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              Revisa la capacidad disponible para clientes, procesos y recursos
              principales de tu cuenta.
            </p>
          </div>

          <div className="glass-card flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-300" />
            <span className="font-medium">Cuenta operativa</span>
          </div>
        </div>

        {planData ? (
          <>
            <Card className="glass-card rounded-md">
              <CardHeader className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                <div>
                  <CardTitle className="text-xl tracking-normal text-white">
                    {planData.plan.name}
                  </CardTitle>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                    {planData.plan.description ??
                      "Plan activo para operar tu espacio documental."}
                  </p>
                </div>
                <Badge className="bg-emerald-200/[0.12] text-emerald-100 hover:bg-emerald-200/[0.12]">
                  {formatSubscriptionStatus(planData.subscription.status)}
                </Badge>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <PlanLimit label="Clientes" value={planData.limits.clients} />
                <PlanLimit
                  label="Procesos activos"
                  value={planData.limits.activeWorkspaces}
                />
                <PlanLimit
                  label="Almacenamiento"
                  value={`${planData.limits.storageGb} GB`}
                />
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              {usageItems.map((item) => (
                <UsageCard
                  key={item.key}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  used={planData.usage[item.key]}
                  limit={planData.limits[item.key]}
                  suffix={item.key === "storageGb" ? " GB" : ""}
                />
              ))}
            </div>
          </>
        ) : (
          <Card className="glass-card rounded-md">
            <CardContent className="flex items-start gap-3 p-4">
              <Gauge className="mt-0.5 size-5 shrink-0 text-cyan-100" />
              <p className="text-sm leading-6 text-white/60">
                No pudimos cargar la informacion del plan en este momento.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </DashboardShell>
  );
}

async function getPlanData() {
  try {
    return await serverApiFetch<CurrentPlanResponse>("/plans/current");
  } catch {
    return null;
  }
}

function PlanLimit({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-xs uppercase text-white/45">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function UsageCard({
  label,
  description,
  icon: Icon,
  used,
  limit,
  suffix = "",
}: {
  label: string;
  description: string;
  icon: typeof Building2;
  used: number;
  limit: number;
  suffix?: string;
}) {
  const percentage = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

  return (
    <Card className="glass-card rounded-md">
      <CardHeader className="grid grid-cols-[1fr_auto] gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base tracking-normal text-white">
            {label}
          </CardTitle>
          <p className="mt-1 text-sm text-white/60">{description}</p>
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-cyan-200/20 bg-cyan-200/10">
          <Icon className="size-4 text-cyan-100" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <p className="text-2xl font-semibold text-white">
            {used}
            {suffix}
          </p>
          <p className="text-sm text-white/55">
            de {limit}
            {suffix}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-cyan-200"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function formatSubscriptionStatus(status: CurrentPlanResponse["subscription"]["status"]) {
  const labels: Record<CurrentPlanResponse["subscription"]["status"], string> = {
    ACTIVE: "Activo",
    PAUSED: "Pausado",
    CANCELLED: "Cancelado",
  };

  return labels[status];
}
