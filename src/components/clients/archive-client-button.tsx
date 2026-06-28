"use client";

import { Archive, Loader2 } from "lucide-react";
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

export function ArchiveClientButton({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function archiveClient() {
    setIsLoading(true);
    try {
      await apiFetch(`/clients/${clientId}`, { method: "DELETE" });
      setOpen(false);
      toast.success("Cliente archivado.");
      router.replace("/dashboard/clients");
      router.refresh();
    } catch (caught) {
      toast.error(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos archivar el cliente.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
            disabled={isLoading}
          />
        }
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Archive className="size-4" />}
        Archivar
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archivar cliente</AlertDialogTitle>
          <AlertDialogDescription>
            El cliente dejara de estar activo y volveras al listado de clientes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={isLoading} onClick={archiveClient}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            Archivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
