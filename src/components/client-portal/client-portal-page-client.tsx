"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileCheck2,
  KeyRound,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, parseApiResponse } from "@/lib/api/client";
import type {
  ClientPortalAccessResponse,
  ClientPortalDocumentRequest,
  ClientPortalDocumentRequestListResponse,
  DocumentFile,
  DocumentRequestStatus,
  FileDownloadResponse,
} from "@/lib/api/types";
import {
  MAX_UPLOAD_FILE_SIZE_LABEL,
  validateUploadFileSize,
} from "@/lib/files";

type ClientPortalPageClientProps = {
  token: string;
};

const uploadableStatuses: DocumentRequestStatus[] = [
  "PENDING",
  "SUBMITTED",
  "IN_REVIEW",
  "OVERDUE",
  "OBSERVED",
  "RESUBMITTED",
  "REJECTED",
];

export function ClientPortalPageClient({ token }: ClientPortalPageClientProps) {
  const [access, setAccess] = useState<ClientPortalAccessResponse | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : window.sessionStorage.getItem(sessionStorageKey(token)),
  );
  const [code, setCode] = useState("");
  const [requests, setRequests] = useState<ClientPortalDocumentRequest[]>([]);
  const [summary, setSummary] =
    useState<ClientPortalDocumentRequestListResponse["summary"] | null>(null);
  const [isInspecting, setIsInspecting] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [uploadingRequestId, setUploadingRequestId] = useState<string | null>(
    null,
  );
  const [uploadNotes, setUploadNotes] = useState<Record<string, string>>({});
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (sessionToken) {
      void loadRequests(sessionToken);
    }

    void inspectAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, sessionToken]);

  async function inspectAccess() {
    setIsInspecting(true);
    setError(null);

    try {
      const data = await portalFetch<ClientPortalAccessResponse>(token, "");
      setAccess(data);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos abrir este portal.",
      );
    } finally {
      setIsInspecting(false);
    }
  }

  async function verifyCode() {
    setIsVerifying(true);
    setError(null);

    try {
      const data = await portalFetch<ClientPortalAccessResponse>(
        token,
        "/verify",
        {
          method: "POST",
          body: { code },
        },
      );

      if (!data.portalSessionToken) {
        throw new Error("Missing portal session token");
      }

      window.sessionStorage.setItem(
        sessionStorageKey(token),
        data.portalSessionToken,
      );
      setSessionToken(data.portalSessionToken);
      setAccess(data);
      await loadRequests(data.portalSessionToken);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos validar el codigo.",
      );
    } finally {
      setIsVerifying(false);
    }
  }

  async function loadRequests(nextSessionToken = sessionToken) {
    if (!nextSessionToken) {
      return;
    }

    try {
      const data = await portalFetch<ClientPortalDocumentRequestListResponse>(
        token,
        "/document-requests",
        {
          headers: {
            Authorization: `Bearer ${nextSessionToken}`,
          },
        },
      );
      setAccess(data.access);
      setRequests(data.items);
      setSummary(data.summary);
      setError(null);
    } catch (caught) {
      window.sessionStorage.removeItem(sessionStorageKey(token));
      setSessionToken(null);
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos cargar las solicitudes.",
      );
    }
  }

  async function uploadFile(
    request: ClientPortalDocumentRequest,
    file: File | undefined,
  ) {
    if (!file || !sessionToken) {
      return;
    }

    const fileSizeError = validateUploadFileSize(file);
    if (fileSizeError) {
      setError(fileSizeError);
      const input = fileInputs.current[request.id];
      if (input) {
        input.value = "";
      }
      return;
    }

    setUploadingRequestId(request.id);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const notes = uploadNotes[request.id]?.trim();
      if (notes) {
        body.append("notes", notes);
      }

      await portalFetch<DocumentFile>(
        token,
        `/document-requests/${request.id}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
          body,
        },
      );
      setUploadNotes((current) => ({ ...current, [request.id]: "" }));
      await loadRequests(sessionToken);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos enviar el archivo.",
      );
    } finally {
      setUploadingRequestId(null);
      if (fileInputs.current[request.id]) {
        fileInputs.current[request.id]!.value = "";
      }
    }
  }

  async function downloadDocument(document: DocumentFile) {
    if (!sessionToken) {
      return;
    }

    setDownloadingDocumentId(document.id);
    setError(null);

    try {
      const data = await portalFetch<FileDownloadResponse>(
        token,
        `/documents/${document.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        },
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

  const isReady = Boolean(sessionToken && summary);

  return (
    <main className="min-h-screen bg-[#071113] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 md:px-8 md:py-10">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium uppercase text-cyan-100/70">
              NexoDocs
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">
              {access?.workspace.name ?? "Portal del cliente"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              {access
                ? `${access.client.name} - ${access.organization.name}`
                : "Carga segura de documentos para tu proceso."}
            </p>
          </div>

          {access ? (
            <div className="rounded-md border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/65">
              <p className="font-medium text-white">{access.clientContact.name}</p>
              <p className="mt-1">{access.clientContact.email ?? "Contacto cliente"}</p>
              <p className="mt-2 text-xs uppercase text-white/40">
                Expira {formatDate(access.expiresAt)}
              </p>
            </div>
          ) : null}
        </header>

        {isInspecting ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-cyan-100" />
          </div>
        ) : !isReady ? (
          <section className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-md rounded-md border border-white/10 bg-white/[0.06] p-5">
              <div className="flex items-center gap-2">
                <LockKeyhole className="size-5 text-cyan-100" />
                <h2 className="text-lg font-semibold tracking-normal">
                  Ingresa tu codigo
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Usa el codigo de 6 digitos enviado por tu contador para abrir
                las solicitudes de documentos.
              </p>
              <label className="mt-5 grid gap-2">
                <span className="text-xs font-medium uppercase text-white/45">
                  Codigo
                </span>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="h-11 rounded-md border border-white/12 bg-white/[0.08] px-3 text-center font-mono text-lg tracking-[0.28em] text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
                  placeholder="000000"
                />
              </label>
              <Button
                type="button"
                className="mt-4 h-10 w-full rounded-md"
                disabled={code.length !== 6 || isVerifying}
                onClick={verifyCode}
              >
                {isVerifying ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}
                Entrar
              </Button>
            </div>
          </section>
        ) : (
          <section className="grid gap-5 py-6">
            {summary ? (
              <div className="grid gap-3 sm:grid-cols-4">
                <Summary label="Pendientes" value={summary.pending} />
                <Summary label="Enviadas" value={summary.submitted} />
                <Summary label="Aprobadas" value={summary.approved} />
                <Summary label="Rechazadas" value={summary.rejected} />
              </div>
            ) : null}

            <div className="grid gap-3">
              {requests.map((request) => {
                const canUpload = uploadableStatuses.includes(request.status);
                const isUploading = uploadingRequestId === request.id;

                return (
                  <article
                    key={request.id}
                    className="rounded-md border border-white/10 bg-white/[0.045] p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold tracking-normal">
                            {request.title}
                          </h2>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-xs font-medium ${statusClassName(request.status)}`}
                          >
                            {formatStatus(request.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/60">
                          {request.description ??
                            "Tu contador necesita este documento para avanzar."}
                        </p>
                        <p className="mt-2 text-xs uppercase text-white/40">
                          Fecha limite: {formatDate(request.dueDate)}
                        </p>
                      </div>

                      <div className="grid gap-2 lg:min-w-80">
                        {canUpload ? (
                          <label className="grid gap-2">
                            <span className="text-xs font-medium uppercase text-white/45">
                              Comentario
                            </span>
                            <Textarea
                              className="min-h-20 w-full rounded-md border border-white/12 bg-white/[0.06] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20"
                              placeholder="Nota opcional para el contador"
                              value={uploadNotes[request.id] ?? ""}
                              onChange={(event) =>
                                setUploadNotes((current) => ({
                                  ...current,
                                  [request.id]: event.target.value,
                                }))
                              }
                            />
                          </label>
                        ) : null}
                        <input
                          ref={(node) => {
                            fileInputs.current[request.id] = node;
                          }}
                          type="file"
                          className="sr-only"
                          onChange={(event) =>
                            uploadFile(request, event.target.files?.[0])
                          }
                        />
                        {canUpload ? (
                          <p className="text-xs text-white/40">
                            Maximo {MAX_UPLOAD_FILE_SIZE_LABEL} por archivo.
                          </p>
                        ) : null}
                        <Button
                          type="button"
                          className="h-9 rounded-md"
                          disabled={!canUpload || isUploading}
                          onClick={() => fileInputs.current[request.id]?.click()}
                        >
                          {isUploading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : canUpload ? (
                            <UploadCloud className="size-4" />
                          ) : (
                            <CheckCircle2 className="size-4" />
                          )}
                          {canUpload ? "Enviar archivo" : "Cerrado"}
                        </Button>
                      </div>
                    </div>

                    {request.documents.length > 0 ? (
                      <div className="mt-4 grid gap-2">
                        {request.documents.map((document) => {
                          const currentVersion = document.versions[0];
                          const isDownloading =
                            downloadingDocumentId === document.id;

                          return (
                            <div
                              key={document.id}
                              className="flex flex-col gap-3 rounded-md border border-white/10 bg-black/15 p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <FileCheck2 className="size-4 text-cyan-100/70" />
                                  <p className="truncate text-sm font-medium text-white">
                                    {currentVersion?.fileAsset.fileName ??
                                      document.title}
                                  </p>
                                </div>
                                <p className="mt-1 text-xs text-white/45">
                                  {currentVersion
                                    ? `${formatBytes(currentVersion.fileAsset.sizeBytes)} - ${formatDate(document.createdAt)}`
                                    : formatDate(document.createdAt)}
                                </p>
                                {currentVersion?.notes ? (
                                  <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-white/65">
                                    <MessageSquareText className="mt-1 size-4 shrink-0 text-cyan-100/70" />
                                    {currentVersion.notes}
                                  </p>
                                ) : null}
                                {document.observations.length > 0 ? (
                                  <div className="mt-3 grid gap-2">
                                    <p className="text-xs font-medium uppercase text-white/40">
                                      Comentarios
                                    </p>
                                    {document.observations.map((observation) => (
                                      <div
                                        key={observation.id}
                                        className="rounded-md border border-orange-200/15 bg-orange-200/[0.06] p-3"
                                      >
                                        <p className="text-sm leading-6 text-orange-50">
                                          {observation.comment}
                                        </p>
                                        <p className="mt-1 text-xs text-white/45">
                                          {observation.createdBy.name} -{" "}
                                          {formatDate(observation.createdAt)}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-9 rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
                                disabled={isDownloading}
                                onClick={() => downloadDocument(document)}
                              >
                                {isDownloading ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Download className="size-4" />
                                )}
                                Descargar
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {error ? (
          <div className="mt-auto rounded-md border border-rose-200/20 bg-rose-200/10 p-3 text-sm text-rose-50">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

async function portalFetch<T>(
  token: string,
  path: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {},
) {
  const response = await fetch(`/api/backend/client-portal/access/${token}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    body:
      options.body instanceof FormData
        ? options.body
        : options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
  });

  return parseApiResponse<T>(response);
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.05] px-4 py-3">
      <p className="text-xs uppercase text-white/45">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function sessionStorageKey(token: string) {
  return `nexodocs:client-portal:${token}`;
}

function formatStatus(status: DocumentRequestStatus) {
  const labels: Record<DocumentRequestStatus, string> = {
    DRAFT: "Pendiente",
    PENDING: "Pendiente",
    SUBMITTED: "Enviado",
    IN_REVIEW: "Enviado",
    OBSERVED: "Rechazado",
    RESUBMITTED: "Enviado",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
    OVERDUE: "Pendiente",
    CANCELLED: "Rechazado",
  };

  return labels[status];
}

function statusClassName(status: DocumentRequestStatus) {
  if (["SUBMITTED", "IN_REVIEW", "RESUBMITTED"].includes(status)) {
    return "border-cyan-200/25 bg-cyan-200/12 text-cyan-100";
  }

  if (status === "APPROVED") {
    return "border-emerald-200/25 bg-emerald-200/12 text-emerald-100";
  }

  if (["OBSERVED", "REJECTED", "CANCELLED"].includes(status)) {
    return "border-rose-200/25 bg-rose-200/12 text-rose-100";
  }

  return "border-amber-200/25 bg-amber-200/12 text-amber-100";
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

function formatBytes(value: number) {
  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }

  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
