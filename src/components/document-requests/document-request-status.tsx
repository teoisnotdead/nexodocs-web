import { Badge } from "@/components/ui/badge";
import type { DocumentRequestStatus } from "@/lib/api/types";

export const documentRequestStatusOptions: Array<{
  value: DocumentRequestStatus;
  label: string;
}> = [
  { value: "DRAFT", label: "Borrador" },
  { value: "PENDING", label: "Pendiente" },
  { value: "SUBMITTED", label: "Recibido" },
  { value: "IN_REVIEW", label: "En revision" },
  { value: "OBSERVED", label: "Observado" },
  { value: "RESUBMITTED", label: "Reenviado" },
  { value: "APPROVED", label: "Aprobado" },
  { value: "REJECTED", label: "Rechazado" },
  { value: "OVERDUE", label: "Vencido" },
  { value: "CANCELLED", label: "Cancelado" },
];

const labels = Object.fromEntries(
  documentRequestStatusOptions.map((option) => [option.value, option.label]),
) as Record<DocumentRequestStatus, string>;

const classes: Record<DocumentRequestStatus, string> = {
  DRAFT: "bg-white/[0.08] text-white/70 hover:bg-white/[0.08]",
  PENDING: "bg-amber-200/[0.12] text-amber-100 hover:bg-amber-200/[0.12]",
  SUBMITTED: "bg-cyan-200/[0.12] text-cyan-100 hover:bg-cyan-200/[0.12]",
  IN_REVIEW: "bg-sky-200/[0.12] text-sky-100 hover:bg-sky-200/[0.12]",
  OBSERVED: "bg-orange-200/[0.12] text-orange-100 hover:bg-orange-200/[0.12]",
  RESUBMITTED: "bg-fuchsia-200/[0.12] text-fuchsia-100 hover:bg-fuchsia-200/[0.12]",
  APPROVED: "bg-emerald-200/[0.12] text-emerald-100 hover:bg-emerald-200/[0.12]",
  REJECTED: "bg-rose-200/[0.12] text-rose-100 hover:bg-rose-200/[0.12]",
  OVERDUE: "bg-red-200/[0.12] text-red-100 hover:bg-red-200/[0.12]",
  CANCELLED: "bg-white/[0.08] text-white/55 hover:bg-white/[0.08]",
};

export function DocumentRequestStatusBadge({
  status,
}: {
  status: DocumentRequestStatus;
}) {
  return <Badge className={classes[status]}>{labels[status]}</Badge>;
}

export function formatDocumentRequestStatus(status: DocumentRequestStatus) {
  return labels[status];
}
