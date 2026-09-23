/** Um erro de validação de campo, no formato padrão do FastAPI/Pydantic. */
export type FieldValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
};

/** O corpo de erro do FastAPI é uma string (erros de simulação, ver
 * `app.simulation.exceptions.SimulationError` no backend) ou uma lista de
 * erros de campo (validação de payload pelo Pydantic). */
export type ApiErrorDetail = string | FieldValidationError[];

/** Erro lançado pelo cliente HTTP para qualquer resposta HTTP fora da faixa 2xx. */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: ApiErrorDetail;

  constructor(status: number, detail: ApiErrorDetail) {
    super(ApiError.messageFor(detail));
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }

  /** `true` se a API rejeitou uma configuração fisicamente inválida/instável
   * (`SimulationError` no backend, HTTP 422 com `detail` textual). */
  get isSimulationError(): boolean {
    return this.status === 422 && typeof this.detail === "string";
  }

  private static messageFor(detail: ApiErrorDetail): string {
    if (typeof detail === "string") {
      return detail;
    }
    return detail.map((error) => `${error.loc.join(".")}: ${error.msg}`).join("; ");
  }
}
