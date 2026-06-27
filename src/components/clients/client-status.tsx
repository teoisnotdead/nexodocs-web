import { Badge } from "@/components/ui/badge";
import type { ClientStatus } from "@/lib/api/types";

const labels: Record<ClientStatus, string> = {
  ACTIVE: "Activo",
  PAUSED: "Pausado",
  ARCHIVED: "Archivado",
};

const classes: Record<ClientStatus, string> = {
  ACTIVE: "bg-emerald-200/[0.12] text-emerald-100 hover:bg-emerald-200/[0.12]",
  PAUSED: "bg-amber-200/[0.12] text-amber-100 hover:bg-amber-200/[0.12]",
  ARCHIVED: "bg-white/[0.08] text-white/70 hover:bg-white/[0.08]",
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return <Badge className={classes[status]}>{labels[status]}</Badge>;
}

export function formatClientStatus(status: ClientStatus) {
  return labels[status];
}
