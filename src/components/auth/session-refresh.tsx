"use client";

import { useEffect, useRef } from "react";

import { apiFetch } from "@/lib/api/client";
import type { AuthResponse } from "@/lib/api/types";

const refreshIntervalMs = 10 * 60 * 1000;

export function SessionRefresh() {
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    let cancelled = false;
    lastRefreshAt.current = Date.now();

    async function refresh() {
      try {
        await apiFetch<AuthResponse>("/auth/refresh", { method: "POST" });
        if (!cancelled) {
          lastRefreshAt.current = Date.now();
        }
      } catch {
        // The next authenticated request will handle an expired session.
      }
    }

    function refreshIfStale() {
      if (Date.now() - lastRefreshAt.current >= refreshIntervalMs) {
        void refresh();
      }
    }

    const intervalId = window.setInterval(refresh, refreshIntervalMs);
    window.addEventListener("focus", refreshIfStale);
    document.addEventListener("visibilitychange", refreshIfStale);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshIfStale);
      document.removeEventListener("visibilitychange", refreshIfStale);
    };
  }, []);

  return null;
}
