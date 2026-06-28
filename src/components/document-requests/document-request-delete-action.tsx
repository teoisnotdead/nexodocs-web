"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ApiError, apiFetch } from "@/lib/api/client";

type DocumentRequestDeleteActionProps = {
  requestId: string;
  requestTitle: string;
};

export function DocumentRequestDeleteAction({
  requestId,
  requestTitle,
}: DocumentRequestDeleteActionProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteRequest() {
    const confirmed = window.confirm(
      `Eliminar la solicitud "${requestTitle}"? Esta accion no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await apiFetch<{ success: true }>(`/document-requests/${requestId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos eliminar la solicitud.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="grid gap-1 justify-items-end">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="size-9 rounded-md border-rose-200/20 bg-rose-200/10 text-rose-100 hover:bg-rose-200/15"
        disabled={isDeleting}
        onClick={deleteRequest}
        aria-label={`Eliminar ${requestTitle}`}
        title="Eliminar solicitud"
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </Button>
      {error ? <span className="max-w-48 text-right text-xs text-rose-200">{error}</span> : null}
    </div>
  );
}
