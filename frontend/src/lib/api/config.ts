/** URL base da API do backend (FastAPI). Configurável via `NEXT_PUBLIC_API_BASE_URL`
 * para apontar para outros ambientes (ex.: staging, produção); o padrão é o
 * servidor local do backend (`uvicorn app.main:app --reload`, porta 8000). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "http://localhost:8000";
