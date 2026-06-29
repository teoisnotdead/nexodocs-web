"use client";

import {
  CheckCircle2,
  Download,
  FileCheck2,
  Loader2,
  MessageSquareText,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import {
  DocumentStatusBadge,
  formatDocumentStatus,
} from "@/components/documents/document-status";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api/client";
import type {
  DocumentFile,
  DocumentRequestStatus,
  FileDownloadResponse,
  Observation,
  Review,
  ReviewDecision,
} from "@/lib/api/types";
import {
  MAX_UPLOAD_FILE_SIZE_LABEL,
  validateUploadFileSize,
} from "@/lib/files";

type DocumentFilesPanelProps = {
  requestId: string;
  requestStatus: DocumentRequestStatus;
  documents: DocumentFile[];
};

export function DocumentFilesPanel({
  requestId,
  requestStatus,
  documents,
}: DocumentFilesPanelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState("");
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<
    string | null
  >(null);
  const [reviewingDocumentId, setReviewingDocumentId] = useState<string | null>(
    null,
  );
  const [reviewingDecision, setReviewingDecision] =
    useState<ReviewDecision | null>(null);
  const [optimisticReviewDecisions, setOptimisticReviewDecisions] = useState<
    Record<string, ReviewDecision>
  >({});
  const [resolvingObservationId, setResolvingObservationId] = useState<
    string | null
  >(null);
  const [observationDrafts, setObservationDrafts] = useState<
    Record<string, string>
  >({});
  const [error, setError] = useState<string | null>(null);
  const canUploadToRequest = !["APPROVED", "CANCELLED"].includes(
    requestStatus,
  );

  async function uploadFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const fileSizeError = validateUploadFileSize(file);
    if (fileSizeError) {
      setError(fileSizeError);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const note = uploadNote.trim();
      if (note) {
        body.append("notes", note);
      }

      await apiFetch<DocumentFile>(`/document-requests/${requestId}/upload`, {
        method: "POST",
        body,
      });
      setUploadNote("");
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos enviar el archivo.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function downloadDocument(documentId: string) {
    setDownloadingDocumentId(documentId);
    setError(null);

    try {
      const data = await apiFetch<FileDownloadResponse>(
        `/documents/${documentId}/download`,
      );
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos preparar la descarga.",
      );
    } finally {
      setDownloadingDocumentId(null);
    }
  }

  async function createReview(documentId: string, decision: ReviewDecision) {
    const comment = observationDrafts[documentId]?.trim();

    setReviewingDocumentId(documentId);
    setReviewingDecision(decision);
    setError(null);

    try {
      await apiFetch<Review>(`/documents/${documentId}/reviews`, {
        method: "POST",
        body: { decision, comment: comment || undefined },
      });
      setOptimisticReviewDecisions((current) => ({
        ...current,
        [documentId]: decision,
      }));
      setObservationDrafts((current) => ({ ...current, [documentId]: "" }));
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos guardar la revision.",
      );
    } finally {
      setReviewingDocumentId(null);
      setReviewingDecision(null);
    }
  }

  async function resolveObservation(observationId: string) {
    setResolvingObservationId(observationId);
    setError(null);

    try {
      await apiFetch<Observation>(`/observations/${observationId}/resolve`, {
        method: "PATCH",
        body: {},
      });
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos cerrar la observacion.",
      );
    } finally {
      setResolvingObservationId(null);
    }
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_minmax(18rem,24rem)] lg:items-start">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-white/45">
            Documentos recibidos
          </p>
          <p className="mt-1 text-sm text-white/60">
            {documents.length > 0
              ? `${documents.length} registro${documents.length === 1 ? "" : "s"} disponible${documents.length === 1 ? "" : "s"}`
            : "Sin documentos registrados"}
          </p>
        </div>

        {canUploadToRequest ? (
          <div className="grid gap-2">
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase text-white/45">
                Comentario
              </span>
              <Textarea
                className="min-h-20 w-full rounded-md border border-white/12 bg-white/[0.045] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
                placeholder="Nota opcional para el cliente"
                value={uploadNote}
                onChange={(event) => setUploadNote(event.target.value)}
              />
            </label>
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              onChange={(event) => uploadFile(event.target.files?.[0])}
            />
            <p className="text-xs text-white/40">
              Maximo {MAX_UPLOAD_FILE_SIZE_LABEL} por archivo.
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-md border-white/12 bg-white/[0.045] text-white hover:bg-white/[0.1]"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadCloud className="size-4" />
              )}
              Enviar archivo
            </Button>
          </div>
        ) : null}
      </div>

      {documents.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {documents.map((document) => {
            const currentVersion = document.versions[0];
            const optimisticReviewDecision =
              optimisticReviewDecisions[document.id];
            const effectiveStatus = optimisticReviewDecision ?? document.status;
            const isReviewing = reviewingDocumentId === document.id;
            const isApproving =
              isReviewing && reviewingDecision === "APPROVED";
            const isRejecting =
              isReviewing && reviewingDecision === "REJECTED";
            const isDownloading = downloadingDocumentId === document.id;
            const isClientUpload = Boolean(document.uploadedByClientContact);
            const canReview =
              isClientUpload &&
              ["UPLOADED", "UNDER_REVIEW", "OBSERVED"].includes(
                effectiveStatus,
              );
            const openObservations = document.observations.filter(
              (observation) => !observation.resolvedAt,
            );
            const visibleObservations = document.observations.slice(0, 3);
            const hiddenObservations =
              document.observations.length - visibleObservations.length;
            const uploader = formatUploader(document);

            return (
              <div
                key={document.id}
                className="rounded-md border border-white/[0.08] bg-white/[0.03] p-3"
              >
                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileCheck2 className="size-4 text-cyan-100/70" />
                      <span className="truncate text-sm font-medium text-white">
                        {currentVersion?.fileAsset.fileName ?? document.title}
                      </span>
                      {isClientUpload ? (
                        <DocumentStatusBadge status={effectiveStatus} />
                      ) : (
                        <span className="rounded-md border border-emerald-200/20 bg-emerald-200/10 px-2 py-0.5 text-xs font-medium text-emerald-100">
                          Equipo
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-white/45">
                      {currentVersion
                        ? `${formatBytes(currentVersion.fileAsset.sizeBytes)} - v${currentVersion.versionNumber} - ${formatDate(document.createdAt)}`
                        : formatDate(document.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-white/45">{uploader}</p>
                    {currentVersion?.notes ? (
                      <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-white/65">
                        <MessageSquareText className="mt-1 size-4 shrink-0 text-cyan-100/70" />
                        {currentVersion.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-md border-white/12 bg-white/[0.045] text-white hover:bg-white/[0.1]"
                      disabled={isDownloading}
                      onClick={() => downloadDocument(document.id)}
                    >
                      {isDownloading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Download className="size-4" />
                      )}
                      Descargar
                    </Button>
                    {canReview ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          className="h-9 rounded-md"
                          disabled={isReviewing}
                          onClick={() => createReview(document.id, "APPROVED")}
                        >
                          {isApproving ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          Aprobar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-md border-rose-200/20 bg-rose-200/10 text-rose-100 hover:bg-rose-200/15"
                          disabled={isReviewing}
                          onClick={() => createReview(document.id, "REJECTED")}
                        >
                          {isRejecting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <XCircle className="size-4" />
                          )}
                          Rechazar
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>

                {canReview ? (
                  <div className="mt-3 grid gap-2">
                    <label className="grid gap-2">
                      <span className="text-xs font-medium uppercase text-white/45">
                        Observacion
                      </span>
                      <Textarea
                        className="min-h-20 w-full rounded-md border border-white/12 bg-white/[0.045] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
                        placeholder="Nota opcional al aprobar o rechazar"
                        disabled={isReviewing}
                        value={observationDrafts[document.id] ?? ""}
                        onChange={(event) =>
                          setObservationDrafts((current) => ({
                            ...current,
                            [document.id]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                ) : null}

                {document.observations.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium uppercase text-white/45">
                      Comentarios
                    </p>
                    {visibleObservations.map((observation) => (
                      <ObservationItem
                        key={observation.id}
                        observation={observation}
                        isResolving={resolvingObservationId === observation.id}
                        onResolve={resolveObservation}
                      />
                    ))}
                    {hiddenObservations > 0 ? (
                      <p className="text-xs text-white/40">
                        {hiddenObservations} comentario
                        {hiddenObservations === 1 ? "" : "s"} mas en el
                        historial.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {optimisticReviewDecision ? (
                  <p className="mt-3 text-xs text-white/45">
                    Ultima revision:{" "}
                    {formatReviewDecision(optimisticReviewDecision)}
                  </p>
                ) : document.reviews.length > 0 ? (
                  <div className="mt-3 grid gap-2">
                    <p className="text-xs text-white/45">
                      Ultima revision:{" "}
                      {formatReviewDecision(document.reviews[0].decision)}{" "}
                      por {document.reviews[0].createdBy.name}
                    </p>
                    {document.reviews[0].comment ? (
                      <p className="flex items-start gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-6 text-white/65">
                        <MessageSquareText className="mt-1 size-4 shrink-0 text-cyan-100/70" />
                        {document.reviews[0].comment}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-white/40">
                    {formatDocumentStatus(effectiveStatus)}
                    {openObservations.length > 0
                      ? ` - ${openObservations.length} observacion${openObservations.length === 1 ? "" : "es"} abierta${openObservations.length === 1 ? "" : "s"}`
                      : ""}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-rose-100">{error}</p> : null}
    </div>
  );
}

function ObservationItem({
  observation,
  isResolving,
  onResolve,
}: {
  observation: Observation;
  isResolving: boolean;
  onResolve: (id: string) => void;
}) {
  return (
    <div className="rounded-md border border-orange-200/15 bg-orange-200/[0.06] p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm leading-6 text-orange-50">
            {observation.comment}
          </p>
          <p className="mt-1 text-xs text-white/45">
            {observation.createdBy.name} - {formatDate(observation.createdAt)}
          </p>
        </div>
        {observation.resolvedAt ? (
          <span className="shrink-0 rounded-md border border-emerald-200/20 bg-emerald-200/10 px-2 py-1 text-xs text-emerald-100">
            Cerrada
          </span>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
            disabled={isResolving}
            onClick={() => onResolve(observation.id)}
          >
            {isResolving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Cerrar
          </Button>
        )}
      </div>
    </div>
  );
}

function formatUploader(document: DocumentFile) {
  const currentVersion = document.versions[0];
  const clientName =
    document.uploadedByClientContact?.name ??
    currentVersion?.uploadedByClientContact?.name;

  if (clientName) {
    return `Subido por cliente: ${clientName}`;
  }

  const userName = document.createdBy?.name ?? currentVersion?.createdBy?.name;

  if (userName) {
    return `Subido por equipo: ${userName}`;
  }

  return "Origen sin registrar";
}

function formatReviewDecision(decision: ReviewDecision) {
  return decision === "APPROVED" ? "Aprobado" : "Rechazado";
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
