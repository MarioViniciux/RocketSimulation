"""Erros de física/simulação.

Cobrem configurações que passam na validação de schema (Pydantic, limites
por campo) mas são fisicamente inválidas ou instáveis para simular: um
foguete que não decola do trilho, que é aerodinamicamente instável no
lançamento, ou cujo voo não completa os eventos esperados.
"""


class SimulationError(Exception):
    """Erro base: configuração fisicamente inválida ou instável para simular."""


class UnstableRocketConfigurationError(SimulationError):
    """Configuração aerodinamicamente instável (CP à frente do CM) no lançamento."""


class InsufficientThrustError(SimulationError):
    """Empuxo do motor insuficiente para decolar do trilho de lançamento."""


class IncompleteFlightError(SimulationError):
    """A simulação não completou os eventos de voo esperados dentro do tempo máximo."""
