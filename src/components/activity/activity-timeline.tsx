import {
  CheckCircle2,
  FileCheck2,
  FileText,
  PackageCheck,
  Send,
  TimerReset,
} from "lucide-react";

import type { ActivityLog } from "@/lib/api/types";

type ActivityTimelineProps = {
  items: ActivityLog[];
};

export function ActivityTimeline({ items }: ActivityTimelineProps) {
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
    <div className="space-y-3">
      {items.map((item) => {
        const Icon = activityIcon(item.action);

        return (
          <div
            key={item.id}
            className="rounded-md border border-white/10 bg-white/[0.04] p-3"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.06]">
                <Icon className="size-4 text-white/65" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-white">
                  {activityTitle(item)}
                </p>
                <p className="mt-1 text-sm leading-6 text-white/60">
                  {activityDescription(item)}
                </p>
                <p className="mt-2 text-xs text-white/45">
                  {formatDate(item.createdAt)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
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

  if (action.startsWith("DOCUMENT")) {
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
