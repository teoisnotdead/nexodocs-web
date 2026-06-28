import { ArchiveClientButton } from "@/components/clients/archive-client-button";
import { ClientStatusBadge } from "@/components/clients/client-status";
import { ContactForm } from "@/components/clients/contact-form";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  WorkspaceStatusBadge,
  formatWorkspaceType,
} from "@/components/workspaces/workspace-status";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser, serverApiFetch } from "@/lib/api/server";
import type { Client, WorkspaceListResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Edit3,
  FolderKanban,
  Globe,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const [client, workspaces] = await Promise.all([
    getClient(id),
    getClientWorkspaces(id),
  ]);

  if (!client) {
    notFound();
  }

  const primary = client.contacts.find((contact) => contact.isPrimary);

  return (
    <DashboardShell
      organizationName={user.organization.name}
      userName={user.name}
      userEmail={user.email}
      activePath="/dashboard/clients"
      breadcrumbs={[
        { label: "Inicio", href: "/dashboard" },
        { label: "Clientes", href: "/dashboard/clients" },
        { label: client.name },
      ]}
    >
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <Link
              href="/dashboard/clients"
              className="mb-4 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Volver a clientes
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-normal text-balance md:text-3xl">
                {client.name}
              </h1>
              <ClientStatusBadge status={client.status} />
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              {client.notes ??
                "Informacion del cliente y contactos disponibles para coordinar solicitudes."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/dashboard/clients/${client.id}/edit`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]",
              )}
            >
              <Edit3 className="size-4" />
              Editar
            </Link>
            <ArchiveClientButton clientId={client.id} />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="glass-card rounded-md">
            <CardHeader>
              <CardTitle className="text-base tracking-normal text-white">
                Informacion comercial
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Detail icon={Building2} label="Razon social" value={client.legalName} />
              <Detail icon={Building2} label="RUT / identificador" value={client.taxId} />
              <Detail icon={Building2} label="Industria" value={client.industry} />
              <Detail icon={Mail} label="Correo general" value={client.email} />
              <Detail icon={Phone} label="Telefono general" value={client.phone} />
              <Detail icon={Globe} label="Sitio web" value={client.website} />
            </CardContent>
          </Card>

          <Card className="glass-card rounded-md">
            <CardHeader>
              <CardTitle className="text-base tracking-normal text-white">
                Contacto principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {primary ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail icon={UserRound} label="Nombre" value={primary.name} />
                  <Detail icon={Building2} label="Rol" value={primary.role} />
                  <Detail icon={Mail} label="Correo" value={primary.email} />
                  <Detail icon={Phone} label="Telefono" value={primary.phone} />
                </div>
              ) : (
                <p className="text-sm text-white/60">
                  Este cliente aun no tiene contacto principal.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card rounded-md">
          <CardHeader>
            <CardTitle className="text-base tracking-normal text-white">
              Procesos asociados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workspaces.items.slice(0, 4).map((workspace, index) => (
              <div key={workspace.id}>
                <Link
                  href={`/dashboard/workspaces/${workspace.id}`}
                  className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-200/35 hover:bg-white/[0.08] md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-white">
                        {workspace.name}
                      </p>
                      <WorkspaceStatusBadge status={workspace.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/60">
                      <span className="inline-flex items-center gap-1.5">
                        <FolderKanban className="size-4 text-cyan-100/70" />
                        {formatWorkspaceType(workspace.workspaceType)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-4 text-cyan-100/70" />
                        {formatWorkspacePeriod(workspace.periodYear, workspace.periodMonth)}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-cyan-100">Ver proceso</span>
                </Link>
                {index < Math.min(workspaces.items.length, 4) - 1 ? (
                  <Separator className="mt-4 bg-white/10" />
                ) : null}
              </div>
            ))}
            {workspaces.items.length === 0 ? (
              <p className="text-sm text-white/60">
                Este cliente aun no tiene procesos asociados.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass-card rounded-md">
          <CardHeader>
            <CardTitle className="text-base tracking-normal text-white">
              Contactos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.contacts.map((contact, index) => (
              <div key={contact.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{contact.name}</p>
                      {contact.isPrimary ? <Badge>Principal</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      {[contact.role, contact.email, contact.phone]
                        .filter(Boolean)
                        .join(" · ") || "Sin datos de contacto"}
                    </p>
                  </div>
                </div>
                {index < client.contacts.length - 1 ? (
                  <Separator className="mt-4 bg-white/10" />
                ) : null}
              </div>
            ))}
            {client.contacts.length === 0 ? (
              <p className="text-sm text-white/60">
                Agrega contactos para facilitar la coordinacion con este cliente.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <ContactForm clientId={client.id} />
      </section>
    </DashboardShell>
  );
}

async function getClient(id: string) {
  try {
    return await serverApiFetch<Client>(`/clients/${id}`);
  } catch {
    return null;
  }
}

async function getClientWorkspaces(id: string): Promise<WorkspaceListResponse> {
  try {
    return await serverApiFetch<WorkspaceListResponse>(
      `/clients/${id}/workspaces`,
    );
  } catch {
    return {
      items: [],
      summary: {
        draft: 0,
        active: 0,
        waitingClient: 0,
        inReview: 0,
        completed: 0,
      },
    };
  }
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-white/50">
        <Icon className="size-3.5 shrink-0" />
        <span>{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-medium text-white">
        {value || "No definido"}
      </p>
    </div>
  );
}

function formatWorkspacePeriod(year: number | null, month: number | null) {
  if (!year && !month) {
    return "Sin periodo";
  }

  if (year && month) {
    return `${new Intl.DateTimeFormat("es-CL", { month: "long" }).format(
      new Date(Date.UTC(2026, month - 1, 1)),
    )} ${year}`;
  }

  return year ? String(year) : `Mes ${month}`;
}
