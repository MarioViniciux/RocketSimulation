from typing import Annotated

from fastapi import Body, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from app.docs import (
    API_DESCRIPTION,
    API_VERSION,
    OPENAPI_TAGS,
    ROCKET_CONFIG_EXAMPLES,
    SIMULATION_ERROR_RESPONSE_EXAMPLES,
)
from app.schemas import ErrorResponse, HealthCheckResponse, RocketConfig
from app.settings import cors_allow_origins
from app.simulation.exceptions import SimulationError
from app.simulation.schemas import SimulationResult
from app.simulation.simulate import run_simulation

app = FastAPI(
    title="Rocket Simulation API",
    version=API_VERSION,
    description=API_DESCRIPTION,
    openapi_tags=OPENAPI_TAGS,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_allow_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SimulationError)
def handle_simulation_error(request: Request, exc: SimulationError) -> JSONResponse:
    """Configurações fisicamente inválidas ou instáveis viram 422, não um erro 500."""
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    """A raiz da API leva à documentação interativa (Swagger UI)."""
    return RedirectResponse(url="/docs")


@app.get(
    "/health",
    tags=["Monitoramento"],
    summary="Verificar se a API está no ar",
    response_model=HealthCheckResponse,
)
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/simulate",
    tags=["Simulação"],
    summary="Simular o voo do foguete",
    description=(
        "Executa a simulação de voo 3-DoF a partir da configuração completa do foguete "
        "(todos os subsistemas, em unidades SI) e retorna os KPIs do voo e as séries "
        "temporais de altitude, velocidade e aceleração vertical."
    ),
    response_description="KPIs e séries temporais da simulação.",
    responses={
        422: {
            "model": ErrorResponse,
            "description": (
                "Payload inválido (lista de erros por campo) ou configuração fisicamente "
                "inválida para simular (mensagem textual)."
            ),
            "content": {"application/json": {"examples": SIMULATION_ERROR_RESPONSE_EXAMPLES}},
        }
    },
)
def simulate(
    config: Annotated[RocketConfig, Body(openapi_examples=ROCKET_CONFIG_EXAMPLES)],
) -> SimulationResult:
    return run_simulation(config)
