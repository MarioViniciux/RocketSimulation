# RocketSimulation

Simulador de Voo para Foguetes de Competição. A partir dos parâmetros físicos do foguete, por subsistema, calcula:

- **Apogeu** (altitude máxima, em m);
- **Margem de estabilidade estática** (em calibres, pela distância entre o Centro de Pressão e o Centro de Massa);
- **Velocidade(s) terminal(is)** sob paraquedas (drogue e main, se houver drogue);
- **Tempo de queima** do motor;
- **Séries temporais** de altitude $h(t)$, velocidade vertical $v_z(t)$ e aceleração vertical $a_z(t)$.

O projeto é dividido em:

- **`/backend`**: API de simulação em FastAPI (Python). Modelo físico 3-DoF com massa variável, Atmosfera Padrão Internacional (ISA), gravidade local, arrasto com correção de compressibilidade pelo Número de Mach e Centro de Pressão pelo método de Barrowman.
- **`/frontend`**: interface em Next.js (React/TypeScript). Formulários por subsistema, visualizador interativo 3D (Three.js/WebGL) com fallback 2D e dashboard de resultados.

Consulte `AGENTS.md` para a especificação completa (arquitetura, módulos e regras de negócio) e `ROADMAP.md` para o plano de implementação.

## Requisitos

- **Python 3.11+** (backend)
- **Node.js 20.9+** e npm (frontend)

## Estrutura do repositório

```
backend/
  app/
    main.py            # app FastAPI: rotas, CORS, tratamento de erros
    docs.py            # descrição e exemplos da documentação OpenAPI
    schemas.py         # RocketConfig (entrada agregada) e schemas de resposta
    propulsion/ avionics/ payload/ structure/ recovery/ environment/
                       # schemas Pydantic de cada subsistema (com limites físicos)
    simulation/        # motor físico: massa, empuxo, atmosfera, arrasto, CM/CP,
                       # estabilidade, integração, eventos de voo, velocidade terminal
  tests/               # testes unitários (simulation/) e de integração (api/)
frontend/
  src/
    app/               # página única do simulador (App Router)
    components/        # formulários, visualizador 2D/3D, dashboard de resultados
    lib/               # cliente HTTP, validação (espelha os limites do backend), geometria
    types/             # tipos TypeScript espelhando os schemas Pydantic
  e2e/                 # testes end-to-end (Playwright)
```

## Setup e execução

### Backend (`/backend`)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt   # ou só requirements.txt, sem as ferramentas de lint/tipos
uvicorn app.main:app --reload
```

A API sobe em `http://localhost:8000`.

| Comando | O que faz |
|---|---|
| `pytest` | Testes unitários e de integração |
| `ruff check .` | Lint |
| `ruff format .` | Formatação |
| `mypy .` | Checagem de tipos (modo estrito) |

### Frontend (`/frontend`)

```bash
cd frontend
npm install
cp .env.example .env.local         # opcional: ajusta a URL da API
npm run dev
```

A aplicação sobe em `http://localhost:3000`.

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build de produção e pré-visualização local |
| `npm run build:standalone` / `npm run start:standalone` | Build e servidor de produção (ver `DEPLOY.md`) |
| `npm run lint` | Lint (ESLint) |
| `npm test` | Testes end-to-end (Playwright), ver abaixo |

**Variáveis de ambiente**

| Variável | Padrão | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000` | URL base da API do backend. Lida no build: ao mudar, gere o build de novo. |

O backend aceita requisições (CORS) apenas das origens em `CORS_ALLOW_ORIGINS` (separadas por vírgula; padrão `http://localhost:3000`). Para servir o frontend em outra origem, defina essa variável no backend.

### Rodando o projeto completo

1. Suba o backend: `uvicorn app.main:app --reload`, em `/backend`.
2. Suba o frontend: `npm run dev`, em `/frontend`.
3. Acesse `http://localhost:3000`:
   - **Entrada de Dados**: preencha os parâmetros de cada subsistema. Os valores iniciais já formam uma configuração válida de exemplo.
   - **Visualizador**: veja o foguete em 3D ou 2D, atualizado conforme as dimensões informadas.
   - **Resultados**: após **Executar Simulação**, veja os KPIs e os gráficos do voo.

## Deploy

Veja o [`DEPLOY.md`](DEPLOY.md): Docker Compose (`docker compose up -d --build`), imagens Docker separadas, deploy sem Docker (systemd), proxy reverso/HTTPS, variáveis de configuração e o script de verificação pós-deploy (`scripts/smoke-test.sh`).

## API

A documentação da API é gerada automaticamente pelo FastAPI a partir dos schemas Pydantic:

- **Swagger UI**: `http://localhost:8000/docs` (a raiz `/` redireciona para cá). Tem exemplos de payload prontos para testar pelo botão *Try it out*: foguete estável com e sem drogue, foguete instável e valor fora dos limites.
- **ReDoc**: `http://localhost:8000/redoc`
- **Esquema OpenAPI (JSON)**: `http://localhost:8000/openapi.json`

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Verifica se a API está no ar. Resposta: `{"status": "ok"}`. |
| `POST` | `/simulate` | Recebe um `RocketConfig` e retorna um `SimulationResult`. |

**Entrada (`RocketConfig`)**: um objeto com os seis subsistemas: `propulsion`, `avionics`, `payload`, `structure`, `recovery` e `environment`. Cada campo tem limites físicos validados pelo Pydantic, e a descrição e os limites de todos eles aparecem no Swagger UI.

**Saída (`SimulationResult`)**: `apogee_altitude_m`, `stability_margin_calibers`, `burn_time_s`, `main_terminal_velocity_m_s`, `drogue_terminal_velocity_m_s` (`null` sem drogue) e `time_series`, com os vetores `times_s`, `altitudes_m`, `vertical_velocities_m_s` e `vertical_accelerations_m_s2`.

### Convenções

- **Unidades SI** em toda a comunicação. O sufixo do nome do campo indica a unidade: `_m`, `_kg`, `_s`, `_m_s`, `_m_s2`, `_ns` (N·s), `_pa`, `_kg_m2`, `_deg` (graus). Campos `*_coefficient` e `*count` são adimensionais. Um teste (`backend/tests/test_schema_units.py`) garante que sufixo e unidade documentada nunca divergem.
- **Posições ao longo do eixo** (centros de massa, posição X da aviônica e do payload, bocal, bordo de ataque das aletas) são medidas **a partir da ponta da coifa**.
- **Drogue**: com `recovery.has_drogue = true`, os campos `drogue_*` são obrigatórios. Com `false`, devem ser `null`.

### Erros

Ambos os casos respondem **HTTP 422**, diferenciados pelo tipo de `detail`:

- **Payload inválido** (campo ausente, tipo errado, valor fora dos limites): `detail` é uma **lista** de erros por campo, no formato padrão do FastAPI (`loc`, `msg`, `type`).
- **Configuração fisicamente inválida** (foguete instável, empuxo que não supera o peso na decolagem, voo que não completa os eventos esperados): `detail` é uma **string** com o motivo.

### Exemplo

```bash
# Usa o exemplo "foguete estável" da documentação como payload
cd backend
python -c "import json; from app.docs import ROCKET_CONFIG_EXAMPLES as e; print(json.dumps(e['estavel_sem_drogue']['value']))" > /tmp/rocket.json

curl -s -X POST http://localhost:8000/simulate \
  -H "Content-Type: application/json" \
  -d @/tmp/rocket.json | python -m json.tool | head -8
```

## Testes

- **Backend**: `pytest`, em `/backend`. Cobre os modelos físicos com casos analíticos, o endpoint `/simulate`, a consistência de unidades SI nos schemas e os exemplos da documentação OpenAPI. Cada exemplo precisa se comportar como sua descrição promete.
- **Frontend (end-to-end)**: `npm test`, em `/frontend`. Os testes em `frontend/e2e/` cobrem o fluxo principal (entrada → `POST /simulate` → visualizador → resultados) e a performance do visualizador 3D, contra o backend e o frontend reais. O Playwright sobe os dois servidores sozinho, ou reaproveita os que já estiverem rodando: `uvicorn` na porta 8000, usando `backend/.venv` se existir, e `next dev` na porta 3000.

  ```bash
  cd frontend
  npx playwright install chromium   # apenas na primeira vez
  npm test
  ```
