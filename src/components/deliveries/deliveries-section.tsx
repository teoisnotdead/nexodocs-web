"use client";

import {
  CheckCircle2,
  FilePlus2,
  Loader2,
  MessageSquareWarning,
  PackageCheck,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DeliveryStatusBadge } from "@/components/deliveries/delivery-status";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApiError, apiFetch } from "@/lib/api/client";
import type {
  Approval,
  ApprovalStatus,
  Delivery,
  DeliveryItem,
  DeliveryListResponse,
} from "@/lib/api/types";

type DeliveriesSectionProps = {
  workspaceId: string;
  data: DeliveryListResponse;
};

export function DeliveriesSection({ workspaceId, data }: DeliveriesSectionProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [itemDrafts, setItemDrafts] = useState<Record<string, string>>({});
  const [approvalDrafts, setApprovalDrafts] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  async function createDelivery() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Escribe un nombre para la entrega.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      await apiFetch<Delivery>(`/workspaces/${workspaceId}/deliveries`, {
        method: "POST",
        body: {
          title: trimmedTitle,
          description: description.trim() || undefined,
        },
      });
      setTitle("");
      setDescription("");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos crear la entrega.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function addItem(delivery: Delivery) {
    setAddingItemId(delivery.id);
    setError(null);

    const fileName =
      itemDrafts[delivery.id]?.trim() ||
      `${delivery.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;

    try {
      await apiFetch<DeliveryItem>(`/deliveries/${delivery.id}/items`, {
        method: "POST",
        body: {
          title: fileName,
          fileName,
          mimeType: "application/pdf",
        },
      });
      setItemDrafts((current) => ({ ...current, [delivery.id]: "" }));
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos agregar el archivo.",
      );
    } finally {
      setAddingItemId(null);
    }
  }

  async function sendDelivery(deliveryId: string) {
    setSendingId(deliveryId);
    setError(null);

    try {
      await apiFetch<Delivery>(`/deliveries/${deliveryId}/status`, {
        method: "PATCH",
        body: { status: "SENT" },
      });
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos marcar la entrega como enviada.",
      );
    } finally {
      setSendingId(null);
    }
  }

  async function createApproval(deliveryId: string, status: ApprovalStatus) {
    setApprovingId(deliveryId);
    setError(null);

    try {
      await apiFetch<Approval>(`/deliveries/${deliveryId}/approval`, {
        method: "POST",
        body: {
          status,
          comment: approvalDrafts[deliveryId]?.trim() || undefined,
        },
      });
      setApprovalDrafts((current) => ({ ...current, [deliveryId]: "" }));
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos guardar la respuesta.",
      );
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-5">
        <Summary label="Borrador" value={data.summary.draft} />
        <Summary label="Enviadas" value={data.summary.sent} />
        <Summary label="Aprobadas" value={data.summary.approved} />
        <Summary label="Observadas" value={data.summary.observed} />
        <Summary label="Cerradas" value={data.summary.completed} />
      </div>

      <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase text-white/45">
              Entrega
            </span>
            <input
              className="h-10 rounded-md border border-white/12 bg-white/[0.06] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
              placeholder="Informe final de cierre"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase text-white/45">
              Nota
            </span>
            <input
              className="h-10 rounded-md border border-white/12 bg-white/[0.06] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
              placeholder="Documentos preparados para revision"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <Button
            type="button"
            className="mt-5 h-10 rounded-md"
            disabled={creating}
            onClick={createDelivery}
          >
            {creating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <PackageCheck className="size-4" />
            )}
            Crear entrega
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-white/10 bg-white/[0.04]">
        {data.items.map((delivery, index) => (
          <div key={delivery.id}>
            <div className="grid gap-4 p-4 xl:grid-cols-[1fr_0.8fr]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {delivery.title}
                  </h3>
                  <DeliveryStatusBadge status={delivery.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
                  {delivery.description ??
                    "Entrega preparada para compartir documentos con el cliente."}
                </p>
                <p className="mt-2 text-xs text-white/45">
                  {delivery.items.length} archivo
                  {delivery.items.length === 1 ? "" : "s"} preparado
                  {delivery.sentAt ? ` - enviada ${formatDate(delivery.sentAt)}` : ""}
                </p>

                <div className="mt-4 rounded-md border border-white/10 bg-white/[0.035] p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      className="h-9 rounded-md border border-white/12 bg-white/[0.06] px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
                      placeholder="Nombre del archivo a entregar"
                      value={itemDrafts[delivery.id] ?? ""}
                      onChange={(event) =>
                        setItemDrafts((current) => ({
                          ...current,
                          [delivery.id]: event.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
                      disabled={addingItemId === delivery.id}
                      onClick={() => addItem(delivery)}
                    >
                      {addingItemId === delivery.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <FilePlus2 className="size-4" />
                      )}
                      Agregar archivo
                    </Button>
                  </div>

                  {delivery.items.length > 0 ? (
                    <div className="mt-3 grid gap-2">
                      {delivery.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-md bg-white/[0.04] px-3 py-2"
                        >
                          <p className="truncate text-sm font-medium text-white">
                            {item.fileAsset.fileName}
                          </p>
                          <p className="mt-1 text-xs text-white/45">
                            {formatBytes(item.fileAsset.sizeBytes)} -{" "}
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid content-start gap-3">
                <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 rounded-md"
                    disabled={
                      sendingId === delivery.id ||
                      delivery.items.length === 0 ||
                      (delivery.status !== "DRAFT" &&
                        delivery.status !== "OBSERVED")
                    }
                    onClick={() => sendDelivery(delivery.id)}
                  >
                    {sendingId === delivery.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Enviar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-md border-emerald-200/20 bg-emerald-200/10 text-emerald-100 hover:bg-emerald-200/15"
                    disabled={
                      approvingId === delivery.id ||
                      (delivery.status !== "SENT" &&
                        delivery.status !== "VIEWED")
                    }
                    onClick={() => createApproval(delivery.id, "APPROVED")}
                  >
                    <CheckCircle2 className="size-4" />
                    Aprobar
                  </Button>
                </div>

                <label className="grid gap-2">
                  <span className="text-xs font-medium uppercase text-white/45">
                    Observacion
                  </span>
                  <textarea
                    className="min-h-20 w-full rounded-md border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
                    placeholder="Describe el ajuste solicitado"
                    value={approvalDrafts[delivery.id] ?? ""}
                    onChange={(event) =>
                      setApprovalDrafts((current) => ({
                        ...current,
                        [delivery.id]: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-md border-orange-200/20 bg-orange-200/10 text-orange-100 hover:bg-orange-200/15"
                    disabled={
                      approvingId === delivery.id ||
                      (delivery.status !== "SENT" &&
                        delivery.status !== "VIEWED")
                    }
                    onClick={() => createApproval(delivery.id, "OBSERVED")}
                  >
                    {approvingId === delivery.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MessageSquareWarning className="size-4" />
                    )}
                    Observar entrega
                  </Button>
                </div>

                {delivery.approvals.length > 0 ? (
                  <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-xs font-medium uppercase text-white/45">
                      Ultima respuesta
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {formatApproval(delivery.approvals[0].status)} por{" "}
                      {delivery.approvals[0].createdBy.name}
                    </p>
                    {delivery.approvals[0].comment ? (
                      <p className="mt-2 text-sm leading-6 text-white/60">
                        {delivery.approvals[0].comment}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            {index < data.items.length - 1 ? (
              <Separator className="bg-white/10" />
            ) : null}
          </div>
        ))}

        {data.items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-white">Sin entregas aun</p>
            <p className="mt-2 text-sm text-white/60">
              Prepara una entrega cuando los documentos esten listos para el
              cliente.
            </p>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-rose-100">{error}</p> : null}
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

function formatApproval(status: ApprovalStatus) {
  const labels: Record<ApprovalStatus, string> = {
    PENDING: "Pendiente",
    APPROVED: "Aprobada",
    OBSERVED: "Observada",
    REJECTED: "Rechazada",
  };

  return labels[status];
}

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
