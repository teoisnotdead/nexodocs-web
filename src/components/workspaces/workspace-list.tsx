"use client";

import { formatWorkspaceType } from "@/components/workspaces/workspace-status";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Workspace, WorkspaceListResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { CalendarDays, FolderKanban, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type WorkspaceListProps = {
  data: WorkspaceListResponse;
};

export function WorkspaceList({ data }: WorkspaceListProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const workspaces = useMemo(
    () =>
      data.items.filter((workspace) => {
        const matchesQuery = normalizedQuery
          ? matchesWorkspace(workspace, normalizedQuery)
          : true;

        return matchesQuery;
      }),
    [data.items, normalizedQuery],
  );
  const requestSummary = useMemo(
    () =>
      workspaces.reduce(
        (summary, workspace) => {
          const itemSummary = workspace.documentRequestSummary ?? {
            pending: 0,
            submitted: 0,
            approved: 0,
            rejected: 0,
          };

          return {
            pending: summary.pending + itemSummary.pending,
            submitted: summary.submitted + itemSummary.submitted,
            approved: summary.approved + itemSummary.approved,
            rejected: summary.rejected + itemSummary.rejected,
          };
        },
        { pending: 0, submitted: 0, approved: 0, rejected: 0 },
      ),
    [workspaces],
  );

  return (
    <div className="space-y-4">
      <div className="glass-panel grid gap-4 rounded-md p-4 xl:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-4">
          <Summary label="Pendientes" value={requestSummary.pending} />
          <Summary label="Recibidas" value={requestSummary.submitted} />
          <Summary label="Aprobadas" value={requestSummary.approved} />
          <Summary label="Rechazadas" value={requestSummary.rejected} />
        </div>
        <div className="flex flex-col gap-3 md:flex-row xl:justify-end">
          <label className="relative block md:w-72">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/45">
              <Search className="size-4" />
            </span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar proceso o cliente"
              className="!h-10 w-full rounded-md border border-white/12 bg-white/[0.07] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        {workspaces.map((workspace) => (
          <Link
            key={workspace.id}
            href={`/dashboard/workspaces/${workspace.id}`}
            className="glass-card group grid gap-4 rounded-md p-4 transition hover:border-cyan-200/35 hover:bg-white/[0.08] md:grid-cols-[1fr_auto]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-semibold text-white">
                  {workspace.name}
                </h2>
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
                {workspace.description ?? "Proceso documental listo para organizar avances y seguimiento."}
              </p>
              <div className="mt-3 grid gap-2 text-sm text-white/60 md:grid-cols-3">
                <Info icon={UserRound} text={workspace.client.name} />
                <Info icon={FolderKanban} text={formatWorkspaceType(workspace.workspaceType)} />
                <Info icon={CalendarDays} text={formatPeriod(workspace)} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
              <span className="text-xs text-white/45">
                {formatDueDate(workspace.dueDate)}
              </span>
              <span
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "rounded-md border-white/12 bg-white/[0.06] text-white group-hover:bg-white/[0.12]",
                )}
              >
                Ver proceso
              </span>
            </div>
          </Link>
        ))}
      </div>

      {workspaces.length === 0 ? (
        <div className="glass-card rounded-md p-8 text-center">
          <p className="text-sm font-medium text-white">No encontramos procesos</p>
          <p className="mt-2 text-sm text-white/60">
            Ajusta los filtros o crea un nuevo proceso para continuar.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.05] px-4 py-3">
      <p className="text-xs uppercase text-white/45">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Info({
  icon: Icon,
  text,
}: {
  icon: typeof CalendarDays;
  text: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-cyan-100/70" />
      <span className="truncate">{text}</span>
    </div>
  );
}

function matchesWorkspace(workspace: Workspace, query: string) {
  return [
    workspace.name,
    workspace.description,
    workspace.client.name,
    workspace.client.industry,
    formatWorkspaceType(workspace.workspaceType),
  ].some((value) => value?.toLowerCase().includes(query));
}

function formatPeriod(workspace: Workspace) {
  if (!workspace.periodYear && !workspace.periodMonth) {
    return "Sin periodo";
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

function formatDueDate(value: string | null) {
  if (!value) {
    return "Sin fecha limite";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
