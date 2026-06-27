import "server-only";

import { cookies } from "next/headers";

import { ApiError, parseApiResponse } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/types";

type ServerApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const apiBaseUrl =
  process.env.API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:3001";

export async function serverApiFetch<T>(
  path: string,
  options: ServerApiFetchOptions = {},
): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      ...(options.body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  return parseApiResponse<T>(response);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await serverApiFetch<AuthUser>("/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}
