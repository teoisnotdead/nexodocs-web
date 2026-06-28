import { ApplyChecklistTemplateForm } from "@/components/checklist-templates/apply-checklist-template-form";
import { DocumentFilesPanel } from "@/components/documents/document-files-panel";
import { DocumentRequestDeleteAction } from "@/components/document-requests/document-request-delete-action";
import { DocumentRequestForm } from "@/components/document-requests/document-request-form";
import { DocumentRequestStatusAction } from "@/components/document-requests/document-request-status-action";
import type {
  ChecklistTemplate,
  ClientContact,
  DocumentFile,
  DocumentRequestListResponse,
} from "@/lib/api/types";
import { CalendarDays, CheckCircle2, UserRound } from "lucide-react";

type DocumentRequestsSectionProps = {
  workspaceId: string;
  contacts: ClientContact[];
  templates: ChecklistTemplate[];
  data: DocumentRequestListResponse;
  documentsByRequestId: Record<string, DocumentFile[]>;
};

export function DocumentRequestsSection({
  workspaceId,
  contacts,
  templates,
  data,
  documentsByRequestId,
}: DocumentRequestsSectionProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-5">
        <Summary label="Pendientes" value={data.summary.pending} />
        <Summary label="Recibidas" value={data.summary.submitted} />
        <Summary label="Revision" value={data.summary.inReview} />
        <Summary label="Observadas" value={data.summary.observed} />
        <Summary label="Aprobadas" value={data.summary.approved} />
      </div>

      <ApplyChecklistTemplateForm
        workspaceId={workspaceId}
        templates={templates}
        contacts={contacts}
      />

      <DocumentRequestForm workspaceId={workspaceId} contacts={contacts} />

      <div className="space-y-3">
        {data.items.map((request) => (
          <div
            key={request.id}
            className="rounded-md border border-white/10 bg-white/[0.035] p-4"
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {request.title}
                  </h3>
                  {request.required ? (
                    <span className="rounded-md border border-cyan-200/20 bg-cyan-200/10 px-2 py-0.5 text-xs text-cyan-100">
                      Requerido
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
                  {request.description ??
                    "Solicitud preparada para recibir informacion del cliente."}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/55">
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-4 text-cyan-100/70" />
                    {request.assignedClientContact?.name ?? "Sin contacto asignado"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4 text-cyan-100/70" />
                    {formatDate(request.dueDate)}
                  </span>
                  {request.status === "APPROVED" ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-100">
                      <CheckCircle2 className="size-4" />
                      Listo para continuar
                    </span>
                  ) : null}
                </div>
                <DocumentFilesPanel
                  requestId={request.id}
                  requestTitle={request.title}
                  documents={documentsByRequestId[request.id] ?? []}
                />
              </div>
              <div className="flex items-start gap-2 lg:justify-end">
                <DocumentRequestStatusAction request={request} />
                <DocumentRequestDeleteAction
                  requestId={request.id}
                  requestTitle={request.title}
                />
              </div>
            </div>
          </div>
        ))}
        {data.items.length === 0 ? (
          <div className="rounded-md border border-white/10 bg-white/[0.035] p-8 text-center">
            <p className="text-sm font-medium text-white">
              Aun no hay solicitudes
            </p>
            <p className="mt-2 text-sm text-white/60">
              Crea la primera solicitud para ordenar lo que necesitas recibir.
            </p>
          </div>
        ) : null}
      </div>
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

function formatDate(value: string | null) {
  if (!value) {
    return "Sin fecha limite";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
