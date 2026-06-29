import { Badge } from "@/components/ui/badge";
import type { DocumentRequestStatus } from "@/lib/api/types";

const labels: Record<DocumentRequestStatus, string> = {
  DRAFT: "Pendiente",
  PENDING: "Pendiente",
  SUBMITTED: "Recibido",
  IN_REVIEW: "Recibido",
  OBSERVED: "Rechazado",
  RESUBMITTED: "Recibido",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  OVERDUE: "Pendiente",
  CANCELLED: "Rechazado",
};

const classes: Record<DocumentRequestStatus, string> = {
  DRAFT: "bg-amber-200/[0.12] text-amber-100 hover:bg-amber-200/[0.12]",
  PENDING: "bg-amber-200/[0.12] text-amber-100 hover:bg-amber-200/[0.12]",
  SUBMITTED: "bg-cyan-200/[0.12] text-cyan-100 hover:bg-cyan-200/[0.12]",
  IN_REVIEW: "bg-cyan-200/[0.12] text-cyan-100 hover:bg-cyan-200/[0.12]",
  OBSERVED: "bg-rose-200/[0.12] text-rose-100 hover:bg-rose-200/[0.12]",
  RESUBMITTED: "bg-cyan-200/[0.12] text-cyan-100 hover:bg-cyan-200/[0.12]",
  APPROVED: "bg-emerald-200/[0.12] text-emerald-100 hover:bg-emerald-200/[0.12]",
  REJECTED: "bg-rose-200/[0.12] text-rose-100 hover:bg-rose-200/[0.12]",
  OVERDUE: "bg-amber-200/[0.12] text-amber-100 hover:bg-amber-200/[0.12]",
  CANCELLED: "bg-rose-200/[0.12] text-rose-100 hover:bg-rose-200/[0.12]",
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
