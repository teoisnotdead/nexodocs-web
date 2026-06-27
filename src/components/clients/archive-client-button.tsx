"use client";

import { Archive, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

export function ArchiveClientButton({ clientId }: { clientId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function archiveClient() {
    setIsLoading(true);
    try {
      await apiFetch(`/clients/${clientId}`, { method: "DELETE" });
      router.replace("/dashboard/clients");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
      disabled={isLoading}
      onClick={archiveClient}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Archive className="size-4" />}
      Archivar
    </Button>
  );
}
