from pydantic import BaseModel

from app.avionics.schemas import Avionics
from app.environment.schemas import Environment
from app.payload.schemas import Payload
from app.propulsion.schemas import Propulsion
from app.recovery.schemas import Recovery
from app.structure.schemas import Structure


class RocketConfig(BaseModel):
    """Payload de entrada agregando todos os módulos do foguete."""

    propulsion: Propulsion
    avionics: Avionics
    payload: Payload
    structure: Structure
    recovery: Recovery
    environment: Environment
