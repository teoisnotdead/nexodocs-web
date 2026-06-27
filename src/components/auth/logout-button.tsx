"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function logout() {
    setIsLoading(true);
    try {
      await apiFetch<{ success: true }>("/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      size="icon"
      variant="outline"
      className="size-9 rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
      aria-label="Cerrar sesion"
      disabled={isLoading}
      onClick={logout}
    >
      <LogOut className="size-4" />
    </Button>
  );
}
