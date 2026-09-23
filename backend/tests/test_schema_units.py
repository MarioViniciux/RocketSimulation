"""Consistência de unidades SI nos schemas Pydantic da API (Diretriz 1 do
`AGENTS.md`): o nome de cada campo numérico (`*_m`, `*_kg`, `*_s`, `*_deg`,
`*_pa`, `*_ns`, `*_m_s`, `*_m_s2`, `*_kg_m2`, `*_calibers`) precisa ter essa
mesma unidade documentada em `Field(description=...)`, tanto no payload de
entrada (`RocketConfig`) quanto no de saída (`SimulationResult`) de
`POST /simulate` — a comunicação entre frontend e backend depende de nome
de campo e unidade nunca divergirem, já que o frontend espelha esses
mesmos nomes de campo (ver `frontend/src/types`) para decidir a unidade
exibida nos formulários e no dashboard."""

from __future__ import annotations

import re
import types
import typing
from enum import Enum
from typing import get_args, get_origin

import pytest
from pydantic import BaseModel
from pydantic.fields import FieldInfo

from app.schemas import RocketConfig
from app.simulation.schemas import SimulationResult

# Sufixo do nome do campo -> unidade esperada entre parênteses na
# descrição, da variante mais específica para a mais genérica (uma mesma
# string pode terminar tanto em "_m_s" quanto em "_s", por exemplo).
_SUFFIX_UNITS: tuple[tuple[str, str], ...] = (
    ("_kg_m2", "kg·m²"),
    ("_m_s2", "m/s²"),
    ("_m_s", "m/s"),
    ("_ns", "N·s"),
    ("_pa", "Pa"),
    ("_deg", "graus"),
    ("_calibers", "cal"),
    ("_kg", "kg"),
    ("_m", "m"),
    ("_s", "s"),
)

# Sufixos de campos numéricos adimensionais (sem unidade SI a validar).
_DIMENSIONLESS_SUFFIXES = ("_coefficient", "count")


def _expected_unit(field_name: str) -> str | None:
    if any(field_name.endswith(suffix) for suffix in _DIMENSIONLESS_SUFFIXES):
        return None
    for suffix, unit in _SUFFIX_UNITS:
        if field_name.endswith(suffix):
            return unit
    return None


def _unwrap_optional(annotation: object) -> object:
    """`X | None` (ou `Optional[X]`) -> `X`; qualquer outra anotação, sem
    alteração. Os únicos campos opcionais em `RocketConfig` são os
    `drogue_*` de `Recovery` (`float | None`)."""
    origin = get_origin(annotation)
    if origin is typing.Union or origin is types.UnionType:
        args = [arg for arg in get_args(annotation) if arg is not type(None)]
        if len(args) == 1:
            return args[0]
    return annotation


def _iter_numeric_fields(model: type[BaseModel], prefix: str = "") -> list[tuple[str, FieldInfo]]:
    """Percorre `model` recursivamente, descendo em sub-modelos aninhados,
    e retorna `(caminho.pontuado, FieldInfo)` de cada campo numérico
    (`int`/`float`, incluindo tuplas de floats como as séries temporais)."""
    fields: list[tuple[str, FieldInfo]] = []
    for name, field in model.model_fields.items():
        path = f"{prefix}{name}"
        annotation = _unwrap_optional(field.annotation)
        if isinstance(annotation, type) and issubclass(annotation, BaseModel):
            fields.extend(_iter_numeric_fields(annotation, prefix=f"{path}."))
        elif isinstance(annotation, type) and issubclass(annotation, Enum):
            continue
        elif annotation is bool:
            continue
        elif annotation in (int, float):
            fields.append((path, field))
        elif get_origin(annotation) is tuple and get_args(annotation)[0] in (int, float):
            fields.append((path, field))
    return fields


@pytest.mark.parametrize(
    "model", [RocketConfig, SimulationResult], ids=["RocketConfig", "SimulationResult"]
)
def test_numeric_field_descriptions_state_the_unit_named_by_the_field(
    model: type[BaseModel],
) -> None:
    offending: list[str] = []
    for path, field in _iter_numeric_fields(model):
        field_name = path.rsplit(".", 1)[-1]
        expected = _expected_unit(field_name)
        if expected is None:
            continue
        description = field.description or ""
        if not re.search(rf"\({re.escape(expected)}\)", description):
            offending.append(f"{path}: esperava '({expected})' na descrição, tem {description!r}")
    assert not offending, "\n".join(offending)
