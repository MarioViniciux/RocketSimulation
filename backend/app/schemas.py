from typing import Any

from pydantic import BaseModel, Field

from app.avionics.schemas import Avionics
from app.environment.schemas import Environment
from app.payload.schemas import Payload
from app.propulsion.schemas import Propulsion
from app.recovery.schemas import Recovery
from app.structure.schemas import Structure


class RocketConfig(BaseModel):
    """Payload de entrada agregando todos os módulos do foguete."""

    propulsion: Propulsion = Field(..., description="Motor: câmara, grão, bocal e impulso.")
    avionics: Avionics = Field(..., description="Sistema de aviônica.")
    payload: Payload = Field(..., description="Satélite / carga útil.")
    structure: Structure = Field(
        ..., description="Estrutura: geometria global, coifa, aletas e rail buttons."
    )
    recovery: Recovery = Field(..., description="Sistema de recuperação (paraquedas).")
    environment: Environment = Field(
        ..., description="Local de lançamento, vento e trilho de lançamento."
    )


class HealthCheckResponse(BaseModel):
    """Resposta de `GET /health`."""

    status: str = Field(..., description='Sempre "ok" quando a API está no ar.')


class ValidationErrorItem(BaseModel):
    """Erro de validação de um campo do payload (formato padrão do FastAPI)."""

    loc: list[str | int] = Field(..., description="Caminho do campo inválido no corpo.")
    msg: str = Field(..., description="Mensagem de erro.")
    type: str = Field(..., description="Tipo do erro de validação.")
    input: Any = Field(default=None, description="Valor recebido.")
    ctx: dict[str, Any] | None = Field(default=None, description="Contexto (ex.: limites).")


class ErrorResponse(BaseModel):
    """Corpo das respostas HTTP 422 de `POST /simulate`."""

    detail: str | list[ValidationErrorItem] = Field(
        ...,
        description=(
            "String para configurações fisicamente inválidas (ex.: foguete instável); "
            "lista de erros por campo para falhas de validação do payload."
        ),
    )
