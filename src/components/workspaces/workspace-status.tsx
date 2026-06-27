import { Badge } from "@/components/ui/badge";
import type { WorkspaceStatus, WorkspaceType } from "@/lib/api/types";

export const workspaceStatusOptions: Array<{
  value: WorkspaceStatus;
  label: string;
}> = [
  { value: "DRAFT", label: "Borrador" },
  { value: "ACTIVE", label: "Activo" },
  { value: "WAITING_CLIENT", label: "Esperando cliente" },
  { value: "IN_REVIEW", label: "En revision" },
  { value: "WAITING_APPROVAL", label: "Esperando aprobacion" },
  { value: "COMPLETED", label: "Completado" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "ARCHIVED", label: "Archivado" },
];

export const workspaceTypeOptions: Array<{
  value: WorkspaceType;
  label: string;
}> = [
  { value: "GENERIC_PROCESS", label: "Proceso general" },
  { value: "MONTHLY_CLOSURE", label: "Cierre mensual" },
  { value: "LEGAL_CASE", label: "Caso legal" },
  { value: "ONBOARDING", label: "Ingreso de cliente" },
  { value: "DOCUMENT_REVIEW", label: "Revision documental" },
];

const statusLabels = Object.fromEntries(
  workspaceStatusOptions.map((option) => [option.value, option.label]),
) as Record<WorkspaceStatus, string>;

const typeLabels = Object.fromEntries(
  workspaceTypeOptions.map((option) => [option.value, option.label]),
) as Record<WorkspaceType, string>;

const classes: Record<WorkspaceStatus, string> = {
  DRAFT: "bg-white/[0.08] text-white/70 hover:bg-white/[0.08]",
  ACTIVE: "bg-emerald-200/[0.12] text-emerald-100 hover:bg-emerald-200/[0.12]",
  WAITING_CLIENT: "bg-amber-200/[0.12] text-amber-100 hover:bg-amber-200/[0.12]",
  IN_REVIEW: "bg-cyan-200/[0.12] text-cyan-100 hover:bg-cyan-200/[0.12]",
  WAITING_APPROVAL: "bg-fuchsia-200/[0.12] text-fuchsia-100 hover:bg-fuchsia-200/[0.12]",
  COMPLETED: "bg-lime-200/[0.12] text-lime-100 hover:bg-lime-200/[0.12]",
  CANCELLED: "bg-rose-200/[0.12] text-rose-100 hover:bg-rose-200/[0.12]",
  ARCHIVED: "bg-white/[0.08] text-white/55 hover:bg-white/[0.08]",
};

export function WorkspaceStatusBadge({ status }: { status: WorkspaceStatus }) {
  return <Badge className={classes[status]}>{statusLabels[status]}</Badge>;
}

export function formatWorkspaceStatus(status: WorkspaceStatus) {
  return statusLabels[status];
}

export function formatWorkspaceType(type: WorkspaceType) {
  return typeLabels[type];
}
