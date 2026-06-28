"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  DocumentRequestStatusBadge,
  documentRequestStatusOptions,
} from "@/components/document-requests/document-request-status";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const isTerminalStatus = ["APPROVED", "CANCELLED"].includes(request.status);

  if (isTerminalStatus) {
    return (
      <div className="flex min-h-9 items-start">
        <DocumentRequestStatusBadge status={request.status} />
      </div>
    );
  }

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
        <Select
          items={documentRequestStatusOptions}
          value={value}
          disabled={isSaving}
          onValueChange={(nextStatus) => {
            if (nextStatus) {
              updateStatus(nextStatus as DocumentRequestStatus);
            }
          }}
        >
          <SelectTrigger
            aria-label={`Estado de ${request.title}`}
            className="h-9 w-fit min-w-36 rounded-md border-cyan-200/20 bg-cyan-200/[0.09] px-3 font-medium text-cyan-50 hover:bg-cyan-200/[0.13] focus-visible:border-cyan-300/60 focus-visible:ring-cyan-300/20 disabled:opacity-60"
          >
            <SelectValue className="flex-none" placeholder="Estado" />
          </SelectTrigger>
          <SelectContent align="start">
            {documentRequestStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isSaving ? (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-white/60" />
        ) : null}
      </div>
      {error ? (
        <span className="text-xs text-rose-200">{error}</span>
      ) : null}
    </div>
  );
}
