from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import RocketConfig
from app.simulation.exceptions import SimulationError
from app.simulation.schemas import SimulationResult
from app.simulation.simulate import run_simulation

app = FastAPI(title="Rocket Simulation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SimulationError)
def handle_simulation_error(request: Request, exc: SimulationError) -> JSONResponse:
    """Configurações fisicamente inválidas ou instáveis viram 422, não um erro 500."""
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/simulate")
def simulate(config: RocketConfig) -> SimulationResult:
    return run_simulation(config)
