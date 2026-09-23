"""Metadados e exemplos da documentação OpenAPI da API (Swagger UI em
`/docs`, ReDoc em `/redoc`, esquema bruto em `/openapi.json`).

Os exemplos de `ROCKET_CONFIG_EXAMPLES` são os mesmos exibidos no Swagger
UI (botão "Try it out") e são validados em `tests/api/test_openapi_docs.py`
— cada um precisa produzir exatamente o resultado descrito no seu
`summary` (200 ou 422), para que a documentação nunca fique defasada em
relação ao comportamento real da API.
"""

import copy
from typing import Any

API_VERSION = "0.1.0"

API_DESCRIPTION = """
API do **Simulador de Voo para Foguetes de Competição**: recebe a configuração
completa do foguete, dividida por subsistema, e devolve apogeu, margem de
estabilidade, velocidades terminais, tempo de queima e as séries temporais do
voo para plotagem.

## Convenções

- **Unidades:** Sistema Internacional (SI) em toda a comunicação — metros (m),
  quilogramas (kg), segundos (s), newtons (N), pascal (Pa), metros por segundo
  (m/s). Ângulos em graus. O sufixo do nome de cada campo indica a unidade
  (`_m`, `_kg`, `_s`, `_m_s`, `_m_s2`, `_ns`, `_pa`, `_kg_m2`, `_deg`); campos
  `*_coefficient` e `*count` são adimensionais.
- **Referencial:** posições ao longo do eixo do foguete (`position_m`,
  `position_x_m`, `center_of_mass_m`, `dry_center_of_mass_m`,
  `root_leading_edge_position_m`) são medidas a partir da **ponta da coifa**.
  `position_y_m`/`position_z_m` são deslocamentos laterais em relação ao eixo.
- **Modelo físico:** 3 graus de liberdade (translação), com massa variável
  durante a queima, Atmosfera Padrão Internacional (ISA), gravidade local,
  arrasto com correção de compressibilidade pelo Número de Mach e Centro de
  Pressão pelo método de Barrowman.

## Erros

Ambos os casos respondem **HTTP 422**, diferenciados pelo tipo de `detail`:

- **Validação do payload** (campo ausente, tipo errado, valor fora dos limites
  físicos): `detail` é uma **lista** de erros por campo (`loc`, `msg`, `type`).
- **Configuração fisicamente inválida**, que passa na validação mas não pode
  ser simulada (foguete instável, empuxo insuficiente para sair do trilho,
  voo que não completa os eventos esperados): `detail` é uma **string**
  explicando o motivo.
"""

OPENAPI_TAGS: list[dict[str, Any]] = [
    {
        "name": "Simulação",
        "description": "Execução da simulação de voo a partir da configuração do foguete.",
    },
    {"name": "Monitoramento", "description": "Verificação de disponibilidade da API."},
]

_STABLE_ROCKET_CONFIG: dict[str, Any] = {
    "propulsion": {
        "combustion_chamber": {"length_m": 0.5, "diameter_m": 0.1, "empty_mass_kg": 1.0},
        "propellant_grain": {
            "propellant_mass_kg": 2.0,
            "grain_count": 4,
            "grain_diameter_m": 0.08,
            "single_grain_burn_time_s": 0.75,
        },
        "nozzle": {
            "throat_diameter_m": 0.03,
            "exit_diameter_m": 0.08,
            "length_m": 0.1,
            "position_m": 2.0,
        },
        "dry_inertia": {"dry_inertia_kg_m2": 0.5, "dry_center_of_mass_m": 1.8},
        "thermodynamic_impulse_parameters": {
            "reference_pressure_pa": 5_000_000.0,
            "total_impulse_ns": 2000.0,
            "pressure_impulse_ns": 50.0,
            "exhaust_velocity_m_s": 1500.0,
        },
    },
    "avionics": {
        "mass_kg": 0.5,
        "position_x_m": 0.3,
        "position_y_m": 0.0,
        "position_z_m": 0.0,
        "diameter_m": 0.08,
        "length_m": 0.15,
    },
    "payload": {
        "mass_kg": 0.5,
        "position_x_m": 0.6,
        "position_y_m": 0.0,
        "position_z_m": 0.0,
        "diameter_m": 0.08,
        "length_m": 0.15,
    },
    "structure": {
        "empty_mass_kg": 3.0,
        "total_length_m": 2.0,
        "body_diameter_m": 0.1,
        "center_of_mass_m": 1.0,
        "drag_coefficient": 0.45,
        "nose_cone": {"shape": "ogival", "length_m": 0.3, "mass_kg": 0.3},
        "fins": {
            "count": 3,
            "mounting_angle_deg": 0.0,
            "root_chord_m": 0.15,
            "tip_chord_m": 0.07,
            "semispan_m": 0.08,
            "mid_chord_sweep_m": 0.05,
            "root_leading_edge_position_m": 1.85,
        },
        "rail_buttons": {"count": 2, "angle_deg": 180.0},
    },
    "recovery": {
        "has_drogue": False,
        "lower_support_mass_kg": 0.2,
        "parachutes_mass_kg": 0.3,
        "piston_cap_mass_kg": 0.1,
        "ejection_charge_mass_kg": 0.005,
        "center_of_mass_m": 1.6,
        "predicted_terminal_velocity_m_s": 6.0,
        "drogue_deployment_time_s": None,
        "drogue_drag_coefficient": None,
        "drogue_diameter_m": None,
        "main_deployment_time_s": 5.0,
        "main_drag_coefficient": 1.5,
        "main_diameter_m": 1.5,
        "predicted_search_radius_m": 500.0,
    },
    "environment": {
        "latitude_deg": -23.5,
        "longitude_deg": -46.6,
        "elevation_m": 800.0,
        "wind_speed_m_s": 2.0,
        "launch_rail_length_m": 3.0,
        "launch_rail_angle_deg": 5.0,
    },
}


def _with_drogue(config: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(config)
    result["recovery"].update(
        {
            "has_drogue": True,
            # Soma das massas do drogue e do main.
            "parachutes_mass_kg": 0.4,
            "drogue_deployment_time_s": 1.0,
            "drogue_drag_coefficient": 0.8,
            "drogue_diameter_m": 0.5,
            "main_deployment_time_s": 10.0,
        }
    )
    return result


def _unstable(config: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(config)
    # Aletas quase sem área e coladas ao nariz: o CP fica à frente do CM.
    result["structure"]["fins"].update({"semispan_m": 0.01, "root_leading_edge_position_m": 0.0})
    return result


def _out_of_bounds(config: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(config)
    result["structure"]["body_diameter_m"] = 1.2
    return result


ROCKET_CONFIG_EXAMPLES: dict[str, dict[str, Any]] = {
    "estavel_sem_drogue": {
        "summary": "Foguete estável, só com paraquedas main (200)",
        "description": "Configuração de referência, com margem de estabilidade de ~1,1 cal.",
        "value": _STABLE_ROCKET_CONFIG,
    },
    "estavel_com_drogue": {
        "summary": "Foguete estável, com drogue e main (200)",
        "description": (
            "Com `has_drogue=true`, os campos `drogue_*` passam a ser obrigatórios, e a "
            "resposta inclui `drogue_terminal_velocity_m_s`."
        ),
        "value": _with_drogue(_STABLE_ROCKET_CONFIG),
    },
    "instavel": {
        "summary": "Foguete instável (422, detail textual)",
        "description": (
            "Passa na validação do payload, mas o Centro de Pressão fica à frente do "
            "Centro de Massa: a simulação é recusada."
        ),
        "value": _unstable(_STABLE_ROCKET_CONFIG),
    },
    "fora_dos_limites": {
        "summary": "Valor fora dos limites físicos (422, lista de erros)",
        "description": "`structure.body_diameter_m` acima do máximo de 0,5 m.",
        "value": _out_of_bounds(_STABLE_ROCKET_CONFIG),
    },
}

SIMULATION_ERROR_RESPONSE_EXAMPLES: dict[str, dict[str, Any]] = {
    "configuracao_invalida": {
        "summary": "Configuração fisicamente inválida (detail textual)",
        "value": {
            "detail": (
                "Configuração aerodinamicamente instável no lançamento: margem de "
                "estabilidade de -11.56 cal (CP à frente ou sobre o CM). É necessário "
                "que o CP fique atrás do CM (margem positiva)."
            )
        },
    },
    "validacao": {
        "summary": "Erro de validação do payload (lista de erros por campo)",
        "value": {
            "detail": [
                {
                    "loc": ["body", "structure", "body_diameter_m"],
                    "msg": "Input should be less than or equal to 0.5",
                    "type": "less_than_equal",
                    "input": 1.2,
                    "ctx": {"le": 0.5},
                }
            ]
        },
    },
}
