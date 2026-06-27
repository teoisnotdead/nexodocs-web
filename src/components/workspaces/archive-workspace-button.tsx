"use client";

import { Archive, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

export function ArchiveWorkspaceButton({ workspaceId }: { workspaceId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function archiveWorkspace() {
    setIsLoading(true);
    try {
      await apiFetch(`/workspaces/${workspaceId}`, { method: "DELETE" });
      router.replace("/dashboard/workspaces");
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
      onClick={archiveWorkspace}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Archive className="size-4" />}
      Archivar
    </Button>
  );
}
