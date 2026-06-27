"use client";

import { useRouter } from "next/navigation";

export function useAuthRedirect() {
  const router = useRouter();

  return async () => {
    router.replace("/dashboard");
    router.refresh();
  };
}
