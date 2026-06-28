"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteRequest() {
    setIsDeleting(true);

    try {
      await apiFetch<{ success: true }>(`/document-requests/${requestId}`, {
        method: "DELETE",
      });
      setOpen(false);
      toast.success("Solicitud eliminada.");
      router.refresh();
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos eliminar la solicitud.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-9 rounded-md border-rose-200/20 bg-rose-200/10 text-rose-100 hover:bg-rose-200/15"
            disabled={isDeleting}
            aria-label={`Eliminar ${requestTitle}`}
            title="Eliminar solicitud"
          />
        }
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar solicitud</AlertDialogTitle>
          <AlertDialogDescription>
            Esta accion eliminara &quot;{requestTitle}&quot; y no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={deleteRequest}>
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : null}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
