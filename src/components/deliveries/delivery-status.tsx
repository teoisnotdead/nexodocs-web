import type { DeliveryStatus } from "@/lib/api/types";

const labels: Record<DeliveryStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  VIEWED: "Vista",
  APPROVED: "Aprobada",
  OBSERVED: "Observada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const styles: Record<DeliveryStatus, string> = {
  DRAFT: "border-white/12 bg-white/[0.06] text-white/70",
  SENT: "border-cyan-200/20 bg-cyan-200/10 text-cyan-100",
  VIEWED: "border-sky-200/20 bg-sky-200/10 text-sky-100",
  APPROVED: "border-emerald-200/20 bg-emerald-200/10 text-emerald-100",
  OBSERVED: "border-orange-200/20 bg-orange-200/10 text-orange-100",
  COMPLETED: "border-lime-200/20 bg-lime-200/10 text-lime-100",
  CANCELLED: "border-rose-200/20 bg-rose-200/10 text-rose-100",
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function formatDeliveryStatus(status: DeliveryStatus) {
  return labels[status];
}
