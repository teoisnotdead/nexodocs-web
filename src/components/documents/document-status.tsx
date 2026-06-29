import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/lib/api/types";

export const documentReviewStatusOptions: Array<{
  value: Extract<
    DocumentStatus,
    "UNDER_REVIEW" | "APPROVED" | "OBSERVED" | "REJECTED"
  >;
  label: string;
}> = [
  { value: "UNDER_REVIEW", label: "En revision" },
  { value: "APPROVED", label: "Aprobado" },
  { value: "OBSERVED", label: "Rechazado" },
  { value: "REJECTED", label: "Rechazado" },
];

const labels: Record<DocumentStatus, string> = {
  UPLOADED: "Recibido",
  UNDER_REVIEW: "En revision",
  APPROVED: "Aprobado",
  OBSERVED: "Rechazado",
  REJECTED: "Rechazado",
  REPLACED: "Reemplazado",
  ARCHIVED: "Archivado",
};

const classes: Record<DocumentStatus, string> = {
  UPLOADED: "bg-cyan-200/[0.12] text-cyan-100 hover:bg-cyan-200/[0.12]",
  UNDER_REVIEW: "bg-sky-200/[0.12] text-sky-100 hover:bg-sky-200/[0.12]",
  APPROVED: "bg-emerald-200/[0.12] text-emerald-100 hover:bg-emerald-200/[0.12]",
  OBSERVED: "bg-orange-200/[0.12] text-orange-100 hover:bg-orange-200/[0.12]",
  REJECTED: "bg-rose-200/[0.12] text-rose-100 hover:bg-rose-200/[0.12]",
  REPLACED: "bg-fuchsia-200/[0.12] text-fuchsia-100 hover:bg-fuchsia-200/[0.12]",
  ARCHIVED: "bg-white/[0.08] text-white/55 hover:bg-white/[0.08]",
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return <Badge className={classes[status]}>{labels[status]}</Badge>;
}

export function formatDocumentStatus(status: DocumentStatus) {
  return labels[status];
}
