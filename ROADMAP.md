# Roadmap

Lista de tarefas sequenciais para construir o Simulador de Voo para Foguetes de Competição do zero, conforme especificado em `AGENTS.md`. Cada fase assume que a anterior está concluída.

## Fase 0 — Setup do Projeto
- [x] Criar estrutura de diretórios raiz: `/frontend` e `/backend`.
- [x] Atualizar `.gitignore` de forma apropriada (Python, Node, editores, build artifacts).
- [x] Definir `README.md` com visão geral, instruções de setup e como rodar frontend/backend.
- [x] Definir ferramentas de lint/format (ex.: `ruff`/`black` no backend, `eslint`/`prettier` no frontend).

## Fase 1 — Backend: Base do FastAPI
- [x] Inicializar projeto Python (venv/poetry/uv) e dependências base: `fastapi`, `uvicorn`, `pydantic`.
- [x] Criar estrutura de módulos do backend: `/propulsion`, `/avionics`, `/payload`, `/structure`, `/recovery`, `/environment`.
- [x] Configurar app FastAPI inicial com rota de health-check.
- [x] Configurar CORS para comunicação com o frontend Next.js.

## Fase 2 — Backend: Schemas Pydantic (Entrada)
- [x] Criar schema Pydantic para módulo Propulsão: câmara de combustão, grão propelente, bocal convergente-divergente, inércia/CM seco, parâmetros termodinâmicos/impulso.
- [x] Criar schema Pydantic para módulo Aviônica: massa, posição (X, Y, Z), diâmetro, comprimento.
- [x] Criar schema Pydantic para módulo Payload/Satélite: massa, posição (X, Y, Z), diâmetro, comprimento.
- [x] Criar schema Pydantic para módulo Estrutura: massa/geometria global, coifa (formato, tamanho, massa), aletas (quantidade, angulação), rail buttons (quantidade, angulação).
- [x] Criar schema Pydantic para módulo Recuperação: presença de drogue, massas (suporte, paraquedas, tampa), pólvora de ejeção, preditivos (velocidade terminal, tempos de ativação, raio de busca).
- [x] Criar schema Pydantic para módulo Ambiente: coordenadas geográficas (lat/long/elevação), velocidade do vento, comprimento do trilho.
- [x] Adicionar validação de limites físicos realistas em todos os schemas (valores mínimos/máximos, tipos, unidades SI).
- [x] Criar schema agregador `RocketConfig` que compõe todos os módulos em um único payload de entrada.

## Fase 3 — Backend: Motor de Simulação Física
- [x] Implementar modelo de massa variável (queima de propelente ao longo do tempo).
- [x] Implementar cálculo de empuxo/impulso a partir dos parâmetros do motor.
- [x] Implementar modelo atmosférico (densidade, pressão, gravidade local em função da altitude/coordenadas).
- [x] Implementar cálculo de arrasto aerodinâmico (subsônico/compressível, considerando Número de Mach).
- [x] Implementar cálculo de Centro de Massa (CM) e Centro de Pressão (CP) ao longo do voo.
- [x] Implementar cálculo de margem de estabilidade estática (em calibres).
- [x] Implementar integrador das equações de movimento (3-DoF inicialmente; 6-DoF como extensão futura).
- [x] Implementar lógica de eventos de voo: burnout, apogeu, ativação do drogue, ativação do main, pouso.
- [x] Implementar cálculo de velocidade terminal sob paraquedas (drogue e/ou main).
- [x] Gerar vetores temporais de saída: altitude $h(t)$, velocidade vertical $v_z(t)$, aceleração vertical $a_z(t)$.

## Fase 4 — Backend: API de Simulação
- [x] Criar endpoint `POST /simulate` que recebe `RocketConfig` e retorna os resultados estruturados.
- [x] Estruturar payload de resposta: apogeu, margem de estabilidade, velocidade(s) terminal(is), tempo de queima total, séries temporais para os gráficos.
- [x] Adicionar tratamento de erros para configurações fisicamente inválidas ou instáveis.
- [x] Escrever testes unitários para o motor de simulação (casos conhecidos/validáveis analiticamente).
- [x] Escrever testes de integração para o endpoint `/simulate`.

## Fase 5 — Frontend: Base do Next.js
- [x] Inicializar projeto Next.js com TypeScript.
- [x] Configurar cliente HTTP para consumir a API do backend.
- [x] Definir estrutura de rotas/páginas: entrada de dados, visualizador, dashboard de resultados.
- [x] Definir tipos TypeScript espelhando os schemas Pydantic do backend.

## Fase 6 — Frontend: Formulários de Entrada por Subsistema
- [x] Criar formulário do subsistema Propulsão.
- [x] Criar formulário do subsistema Aviônica.
- [x] Criar formulário do subsistema Payload.
- [x] Criar formulário do subsistema Estrutura.
- [x] Criar formulário do subsistema Recuperação.
- [x] Criar formulário do subsistema Ambiente/Localização.
- [x] Implementar validação client-side consistente com os limites definidos no backend.
- [x] Implementar estado global/agregado do formulário (ex.: Context, Zustand ou React Hook Form) para compor o `RocketConfig` completo.

## Fase 7 — Frontend: Visualizador Interativo 2D/3D
- [x] Configurar Three.js/WebGL no Next.js.
- [x] Implementar renderização 3D do foguete a partir das dimensões/diâmetros/posições informadas.
- [x] Implementar renderização 2D equivalente como fallback leve e fluido.
- [x] Implementar alternância de visualização entre modos 2D e 3D.
- [x] Implementar detecção de suporte a WebGL com fallback automático para 2D.

## Fase 8 — Frontend: Dashboard de Resultados
- [x] Implementar exibição dos KPIs (apogeu, estabilidade, velocidade terminal, tempo de queima).
- [x] Implementar gráfico de altitude ao longo do tempo.
- [x] Implementar gráficos de aceleração e velocidade vertical ao longo do tempo.
- [x] Implementar estados de carregamento/erro durante a chamada à API de simulação.

## Fase 9 — Integração e Fluxo Completo
- [ ] Conectar fluxo completo: preenchimento dos formulários → chamada `/simulate` → visualizador atualizado → dashboard populado.
- [ ] Validar consistência de unidades SI em toda a comunicação frontend-backend.
- [ ] Testes end-to-end do fluxo principal (entrada → simulação → resultados).

## Fase 10 — Polimento e Entrega
- [ ] Revisar UX dos formulários (agrupamento por subsistema, mensagens de validação claras).
- [ ] Revisar performance da renderização 3D em dispositivos modestos.
- [ ] Documentar a API (OpenAPI/Swagger já gerado pelo FastAPI) e revisar README com instruções finais.
- [ ] Preparar scripts/documentação de deploy (backend e frontend).
