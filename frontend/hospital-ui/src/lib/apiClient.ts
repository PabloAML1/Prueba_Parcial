const RAW_BASE_URL = "http://localhost:8080/api";
const BASE_URL = RAW_BASE_URL.replace(/\/?$/, "");

export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
  parseJson?: boolean;
}

const buildUrl = (path: string) => {
  const normalizedPath = path.replace(/^\//, "");
  return `${BASE_URL}/${normalizedPath}`;
};

const buildHeaders = (headers: HeadersInit | undefined, hasBody: boolean, skipAuth: boolean): HeadersInit => {
  const merged = new Headers(headers ?? {});

  if (hasBody && !merged.has("Content-Type")) {
    merged.set("Content-Type", "application/json");
  }

  if (!skipAuth && !merged.has("Authorization")) {
    const token = localStorage.getItem("token");
    if (token) {
      merged.set("Authorization", `Bearer ${token}`);
    }
  }

  return merged;
};

export async function apiRequest<TResponse = unknown>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  
  const { skipAuth = false, parseJson = true, headers, body, ...rest } = options;
  const hasBody = Boolean(body);
  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: buildHeaders(headers, hasBody, skipAuth),
    body,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data && typeof data.error === "string") {
        errorMessage = data.error;
      } else if (data && typeof data.message === "string") {
        errorMessage = data.message;
      }
    } catch (error) {
      // ignore JSON parse errors
      console.warn('Failed to parse error response JSON:', error);
    }

    const error = new Error(errorMessage);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  if (!parseJson) {
    return undefined as TResponse;
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export { BASE_URL as ADMIN_API_BASE_URL };
