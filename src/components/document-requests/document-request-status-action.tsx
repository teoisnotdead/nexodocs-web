"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  documentRequestStatusOptions,
  formatDocumentRequestStatus,
} from "@/components/document-requests/document-request-status";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { DocumentRequest, DocumentRequestStatus } from "@/lib/api/types";

type DocumentRequestStatusActionProps = {
  request: DocumentRequest;
};

export function DocumentRequestStatusAction({
  request,
}: DocumentRequestStatusActionProps) {
  const router = useRouter();
  const [value, setValue] = useState<DocumentRequestStatus>(request.status);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(nextStatus: DocumentRequestStatus) {
    setValue(nextStatus);
    setError(null);
    setIsSaving(true);

    try {
      await apiFetch<DocumentRequest>(`/document-requests/${request.id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      router.refresh();
    } catch (caught) {
      setValue(request.status);
      setError(
        caught instanceof ApiError
          ? "Ese cambio de estado no esta disponible."
          : "No pudimos actualizar el estado.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-1">
      <div className="relative">
        <select
          value={value}
          disabled={isSaving}
          onChange={(event) =>
            updateStatus(event.target.value as DocumentRequestStatus)
          }
          className="h-9 w-full rounded-md border border-white/12 bg-white/[0.07] px-3 pr-8 text-sm text-white outline-none focus:border-cyan-300/60 focus:ring-3 focus:ring-cyan-300/20 disabled:opacity-60 md:w-48"
          aria-label={`Estado de ${request.title}`}
        >
          {documentRequestStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isSaving ? (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-white/60" />
        ) : null}
      </div>
      {error ? (
        <span className="text-xs text-rose-200">{error}</span>
      ) : (
        <span className="text-xs text-white/40">
          {formatDocumentRequestStatus(value)}
        </span>
      )}
    </div>
  );
}
