import type { ApiError, ApiSuccess } from "../../types";

const API_BASE = "";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      },
      ...init
    });
  } catch {
    throw new ApiRequestError(0, "NETWORK_ERROR", "Cannot reach the SOLA API");
  }

  const text = await res.text();
  let body: ApiSuccess<T> | ApiError;
  try {
    body = JSON.parse(text) as ApiSuccess<T> | ApiError;
  } catch {
    throw new ApiRequestError(
      res.status,
      "API_UNAVAILABLE",
      "The SOLA API is not running. In the project folder run npm run dev and wait until both api and web have started."
    );
  }

  if (!res.ok || !body.success) {
    const err = !body.success
      ? body.error
      : { code: "REQUEST_FAILED", message: "Request failed" };
    throw new ApiRequestError(res.status, err.code, err.message);
  }
  return body.data;
}
