# RocketSimulation

Simulador de Voo para Foguetes de Competição. Calcula apogeu, estabilidade aerodinâmica, regimes de velocidade (Número de Mach), trajetória e comportamento dos sistemas de recuperação a partir dos parâmetros físicos do foguete.

O projeto é dividido em:
- **`/backend`** — API de simulação em FastAPI (Python), responsável pelo modelo físico (3-DoF/6-DoF), aerodinâmica, propulsão e geração das séries temporais de voo.
- **`/frontend`** — Interface em Next.js (React/TypeScript), responsável pela entrada de dados por subsistema, visualização interativa 2D/3D do foguete e dashboard de resultados.

Consulte `AGENTS.md` para a especificação completa de arquitetura, módulos e regras de negócio, e `ROADMAP.md` para o plano de implementação.

## Setup

### Backend (`/backend`)

```bash
cd backend
pip install -r requirements.txt   # ou: poetry install
uvicorn app.main:app --reload
```

A API sobe por padrão em `http://localhost:8000` (docs interativas em `/docs`).

Comandos úteis:
- Lint: `flake8` ou `ruff check .`
- Checagem de tipos: `mypy .`
- Testes: `pytest`

### Frontend (`/frontend`)

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe por padrão em `http://localhost:3000` e consome a API do backend.

Comandos úteis:
- Lint: `npm run lint`
- Testes: `npm test`
- Build de produção: `npm run build`

## Rodando o projeto completo

1. Suba o backend (`uvicorn app.main:app --reload` em `/backend`).
2. Suba o frontend (`npm run dev` em `/frontend`).
3. Acesse a interface e preencha os parâmetros do foguete por subsistema (propulsão, aviônica, payload, estrutura, recuperação, ambiente) para gerar a simulação.
