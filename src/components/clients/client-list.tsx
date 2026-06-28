"use client";

import { buttonVariants } from "@/components/ui/button";
import { ClientStatusBadge } from "@/components/clients/client-status";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Client, ClientListResponse } from "@/lib/api/types";
import {
  Building2,
  Mail,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type ClientListProps = {
  data: ClientListResponse;
};

export function ClientList({ data }: ClientListProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const clients = useMemo(
    () =>
      normalizedQuery
        ? data.items.filter((client) => matchesClient(client, normalizedQuery))
        : data.items,
    [data.items, normalizedQuery],
  );

  return (
    <div className="space-y-4">
      <div className="glass-panel flex flex-col gap-3 rounded-md p-4 md:flex-row md:items-center md:justify-between">
        <div className="grid gap-3 sm:grid-cols-3">
          <Summary label="Activos" value={data.summary.active} />
          <Summary label="Pausados" value={data.summary.paused} />
          <Summary label="Archivados" value={data.summary.archived} />
        </div>
        <label className="relative block md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/45" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cliente o contacto"
            className="!h-10 w-full rounded-md border border-white/12 bg-white/[0.07] pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
          />
        </label>
      </div>

      <div className="grid gap-3">
        {clients.map((client) => {
          const primary = client.contacts.find((contact) => contact.isPrimary);

          return (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="glass-card group grid gap-4 rounded-md p-4 transition hover:border-cyan-200/35 hover:bg-white/[0.08] md:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-semibold text-white">
                    {client.name}
                  </h2>
                  <ClientStatusBadge status={client.status} />
                </div>
                <div className="mt-2 grid gap-2 text-sm text-white/60 md:grid-cols-2">
                  <Info icon={Building2} text={client.industry ?? "Sin industria"} />
                  <Info icon={UserRound} text={primary?.name ?? "Sin contacto principal"} />
                  <Info icon={Mail} text={primary?.email ?? client.email ?? "Sin correo"} />
                  <Info icon={Phone} text={primary?.phone ?? client.phone ?? "Sin telefono"} />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 md:flex-col md:items-end md:justify-center">
                <span className="text-xs text-white/45">
                  {client._count.contacts} contacto
                  {client._count.contacts === 1 ? "" : "s"}
                </span>
                <span
                  className={cn(
                    buttonVariants({ size: "sm", variant: "outline" }),
                    "rounded-md border-white/12 bg-white/[0.06] text-white group-hover:bg-white/[0.12]",
                  )}
                >
                  Ver cliente
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {clients.length === 0 ? (
        <div className="glass-card rounded-md p-8 text-center">
          <p className="text-sm font-medium text-white">No encontramos clientes</p>
          <p className="mt-2 text-sm text-white/60">
            Ajusta la busqueda o crea un nuevo cliente para continuar.
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
  icon: typeof Building2;
  text: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-cyan-100/70" />
      <span className="truncate">{text}</span>
    </div>
  );
}

function matchesClient(client: Client, query: string) {
  const values = [
    client.name,
    client.legalName,
    client.taxId,
    client.industry,
    client.email,
    client.phone,
    ...client.contacts.flatMap((contact) => [
      contact.name,
      contact.email,
      contact.phone,
      contact.role,
    ]),
  ];

  return values.some((value) => value?.toLowerCase().includes(query));
}
