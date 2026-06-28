"use client";

import {
  CheckCircle2,
  Download,
  FileCheck2,
  Loader2,
  MessageSquareWarning,
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
import { ApiError, apiFetch } from "@/lib/api/client";
import type {
  DocumentFile,
  FileDownloadResponse,
  Observation,
  Review,
  ReviewDecision,
} from "@/lib/api/types";

type DocumentFilesPanelProps = {
  requestId: string;
  requestTitle: string;
  documents: DocumentFile[];
};

export function DocumentFilesPanel({
  requestId,
  requestTitle,
  documents,
}: DocumentFilesPanelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<
    string | null
  >(null);
  const [reviewingDocumentId, setReviewingDocumentId] = useState<string | null>(
    null,
  );
  const [observingDocumentId, setObservingDocumentId] = useState<string | null>(
    null,
  );
  const [resolvingObservationId, setResolvingObservationId] = useState<
    string | null
  >(null);
  const [observationDrafts, setObservationDrafts] = useState<
    Record<string, string>
  >({});
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);

      await apiFetch<DocumentFile>(`/document-requests/${requestId}/upload`, {
        method: "POST",
        body,
      });
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos subir el documento.",
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
    setReviewingDocumentId(documentId);
    setError(null);

    try {
      await apiFetch<Review>(`/documents/${documentId}/reviews`, {
        method: "POST",
        body: { decision },
      });
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos guardar la revision.",
      );
    } finally {
      setReviewingDocumentId(null);
    }
  }

  async function createObservation(documentId: string) {
    const comment = observationDrafts[documentId]?.trim();

    if (!comment) {
      setError("Escribe una observacion antes de guardarla.");
      return;
    }

    setObservingDocumentId(documentId);
    setError(null);

    try {
      await apiFetch<Observation>(`/documents/${documentId}/observations`, {
        method: "POST",
        body: { comment },
      });
      setObservationDrafts((current) => ({ ...current, [documentId]: "" }));
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos guardar la observacion.",
      );
    } finally {
      setObservingDocumentId(null);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={(event) => uploadFile(event.target.files?.[0])}
        />
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
          Subir documento
        </Button>
      </div>

      {documents.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {documents.map((document) => {
            const currentVersion = document.versions[0];
            const isReviewing = reviewingDocumentId === document.id;
            const isObserving = observingDocumentId === document.id;
            const isDownloading = downloadingDocumentId === document.id;
            const canReview = [
              "UPLOADED",
              "UNDER_REVIEW",
              "OBSERVED",
            ].includes(document.status);
            const canObserve = ![
              "APPROVED",
              "REJECTED",
              "REPLACED",
              "ARCHIVED",
            ].includes(document.status);
            const openObservations = document.observations.filter(
              (observation) => !observation.resolvedAt,
            );

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
                      <DocumentStatusBadge status={document.status} />
                    </div>
                    <p className="mt-2 text-xs text-white/45">
                      {currentVersion
                        ? `${formatBytes(currentVersion.fileAsset.sizeBytes)} - v${currentVersion.versionNumber} - ${formatDate(document.createdAt)}`
                        : formatDate(document.createdAt)}
                    </p>
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
                          {isReviewing ? (
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
                          <XCircle className="size-4" />
                          Rechazar
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>

                {canObserve ? (
                  <div className="mt-3 grid gap-2">
                    <label className="grid gap-2">
                      <span className="text-xs font-medium uppercase text-white/45">
                        Observacion
                      </span>
                      <textarea
                        className="min-h-20 w-full rounded-md border border-white/12 bg-white/[0.045] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
                        placeholder="Describe lo que debe corregirse o aclararse"
                        value={observationDrafts[document.id] ?? ""}
                        onChange={(event) =>
                          setObservationDrafts((current) => ({
                            ...current,
                            [document.id]: event.target.value,
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
                        disabled={isObserving}
                        onClick={() => createObservation(document.id)}
                      >
                        {isObserving ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <MessageSquareWarning className="size-4" />
                        )}
                        Guardar observacion
                      </Button>
                    </div>
                  </div>
                ) : null}

                {document.observations.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {document.observations.map((observation) => (
                      <ObservationItem
                        key={observation.id}
                        observation={observation}
                        isResolving={resolvingObservationId === observation.id}
                        onResolve={resolveObservation}
                      />
                    ))}
                  </div>
                ) : null}

                {document.reviews.length > 0 ? (
                  <p className="mt-3 text-xs text-white/45">
                    Ultima revision:{" "}
                    {document.reviews[0].decision === "APPROVED"
                      ? "Aprobado"
                      : "Rechazado"}{" "}
                    por {document.reviews[0].createdBy.name}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-white/40">
                    {formatDocumentStatus(document.status)}
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
