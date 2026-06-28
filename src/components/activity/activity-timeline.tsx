"use client";

import {
  CheckCircle2,
  FileCheck2,
  FileText,
  Loader2,
  PackageCheck,
  Send,
  TimerReset,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { ActivityLog, ActivityLogListResponse } from "@/lib/api/types";

type ActivityTimelineProps = {
  workspaceId: string;
  initialData: ActivityLogListResponse;
};

const activityPageSize = 10;

export function ActivityTimeline({
  workspaceId,
  initialData,
}: ActivityTimelineProps) {
  const [items, setItems] = useState(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = await apiFetch<ActivityLogListResponse>(
        `/workspaces/${workspaceId}/activity?limit=${activityPageSize}&offset=${items.length}`,
      );

      setItems((current) => [...current, ...nextPage.items]);
      setTotal(nextPage.total);
      setHasMore(nextPage.hasMore);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos cargar mas historial.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-start gap-3">
          <TimerReset className="mt-0.5 size-5 shrink-0 text-cyan-100" />
          <p className="text-sm leading-6 text-white/60">
            Los movimientos importantes apareceran aqui a medida que avance el
            proceso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative ml-4 space-y-0 sm:ml-5">
        {items.map((item) => {
          const Icon = activityIcon(item.action);

          return (
            <div
              key={item.id}
              className="relative border-l border-white/10 pb-5 pl-6 last:pb-0"
            >
              <div className="absolute -left-[17px] top-0 flex size-8 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] backdrop-blur">
                <Icon className="size-4 text-white/65" />
              </div>
              <div className="flex items-start gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-white">
                    {activityTitle(item)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/60">
                    {activityDescription(item)}
                  </p>
                  <p className="mt-2 text-xs text-white/45">
                    <LocalDateTime value={item.createdAt} />
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/45">
          Mostrando {items.length} de {total} movimientos
        </p>
        {hasMore ? (
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
            disabled={isLoadingMore}
            onClick={loadMore}
          >
            {isLoadingMore ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Ver mas
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
    </div>
  );
}

function activityIcon(action: string) {
  if (action.startsWith("DELIVERY")) {
    return action === "DELIVERY_SENT" ? Send : PackageCheck;
  }

  if (action.includes("APPROVED")) {
    return CheckCircle2;
  }

  if (action.includes("DOCUMENT")) {
    return FileCheck2;
  }

  return FileText;
}

function activityTitle(item: ActivityLog) {
  const named =
    text(item.metadata, "title") ??
    text(item.metadata, "workspaceName") ??
    text(item.metadata, "clientName");

  const labels: Record<string, string> = {
    CLIENT_CREATED: "Cliente creado",
    WORKSPACE_CREATED: "Proceso creado",
    WORKSPACE_STATUS_CHANGED: "Proceso actualizado",
    DOCUMENT_REQUEST_CREATED: "Solicitud creada",
    DOCUMENT_REQUEST_STATUS_CHANGED: "Solicitud actualizada",
    DOCUMENT_MOCK_UPLOADED: "Documento recibido",
    DOCUMENT_UPLOADED: "Documento subido",
    CLIENT_DOCUMENT_UPLOADED: "Documento recibido del cliente",
    DOCUMENT_APPROVED: "Documento aprobado",
    DOCUMENT_OBSERVED: "Documento observado",
    DOCUMENT_REJECTED: "Documento rechazado",
    DELIVERY_CREATED: "Entrega creada",
    DELIVERY_SENT: "Entrega enviada",
    DELIVERY_APPROVED: "Entrega aprobada",
    DELIVERY_OBSERVED: "Entrega observada",
    DELIVERY_STATUS_CHANGED: "Entrega actualizada",
  };

  return `${labels[item.action] ?? "Movimiento registrado"}${
    named ? `: ${named}` : ""
  }`;
}

function activityDescription(item: ActivityLog) {
  const from = text(item.metadata, "from");
  const to = text(item.metadata, "to");

  if (from && to) {
    return `Cambio de estado: ${from} a ${to}`;
  }

  const descriptions: Record<string, string> = {
    DOCUMENT_MOCK_UPLOADED: "Archivo registrado para revision.",
    DOCUMENT_UPLOADED: "Archivo subido por el equipo.",
    CLIENT_DOCUMENT_UPLOADED: "Archivo subido desde el portal cliente.",
    DOCUMENT_APPROVED: "Documento listo para continuar.",
    DOCUMENT_OBSERVED: "Hay puntos por corregir o aclarar.",
    DELIVERY_SENT: "Documentos compartidos con el cliente.",
    DELIVERY_APPROVED: "Entrega aceptada correctamente.",
    DELIVERY_OBSERVED: "Entrega con ajustes solicitados.",
  };

  return descriptions[item.action] ?? "Movimiento relevante registrado.";
}

function text(metadata: ActivityLog["metadata"], key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}

function LocalDateTime({ value }: { value: string }) {
  return <span suppressHydrationWarning>{formatDate(value)}</span>;
}

function formatDate(value: string) {
  const browserTimeZone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined;

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: browserTimeZone,
  }).format(new Date(value));
}
