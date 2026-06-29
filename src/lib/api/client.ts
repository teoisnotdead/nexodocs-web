export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const browserBaseUrl = "/api/backend";
let refreshPromise: Promise<void> | null = null;

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const response = await makeRequest(path, options);

  if (response.status === 401 && shouldAttemptRefresh(path)) {
    try {
      await refreshSession();
      return parseApiResponse<T>(await makeRequest(path, options));
    } catch {
      return parseApiResponse<T>(response);
    }
  }

  return parseApiResponse<T>(response);
}

async function makeRequest(path: string, options: ApiFetchOptions) {
  return fetch(`${browserBaseUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    body:
      options.body instanceof FormData
        ? options.body
        : options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
  });
}

function shouldAttemptRefresh(path: string) {
  return !path.startsWith("/auth/");
}

async function refreshSession() {
  refreshPromise ??= fetch(`${browserBaseUrl}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to refresh session");
      }
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? safeJson(text) : null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? Array.isArray(payload.message)
          ? payload.message.join(", ")
          : String(payload.message)
        : `Error ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
