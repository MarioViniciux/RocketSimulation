import { API_BASE_URL } from "./config";
import { ApiError, type ApiErrorDetail } from "./errors";

// `object` (não `Record<string, unknown>`): interfaces concretas como
// `RocketConfig` não têm assinatura de índice, então não seriam aceitas
// pelo tipo mais estrito, mesmo sendo perfeitamente serializáveis.
type JsonBody = object;

async function parseErrorDetail(response: Response): Promise<ApiErrorDetail> {
  try {
    const body = (await response.json()) as { detail?: ApiErrorDetail };
    return body.detail ?? response.statusText;
  } catch {
    return response.statusText || "Erro desconhecido na API.";
  }
}

async function request<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (cause) {
    throw new Error(`Não foi possível conectar à API em ${API_BASE_URL}${path}.`, { cause });
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorDetail(response));
  }

  return (await response.json()) as TResponse;
}

/** Requisição `GET` tipada contra a API do backend. */
export function apiGet<TResponse>(path: string): Promise<TResponse> {
  return request<TResponse>(path, { method: "GET" });
}

/** Requisição `POST` tipada contra a API do backend, com corpo JSON. */
export function apiPost<TResponse>(path: string, payload: JsonBody): Promise<TResponse> {
  return request<TResponse>(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type HealthCheckResponse = {
  status: string;
};

/** Verifica se a API do backend está no ar (`GET /health`). */
export function getHealthCheck(): Promise<HealthCheckResponse> {
  return apiGet<HealthCheckResponse>("/health");
}
