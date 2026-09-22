# Visão Geral do Projeto

Este projeto consiste em um **Simulador de Voo para Foguetes de Competição**, capaz de calcular métricas cruciais como apogeu, estabilidade aerodinâmica, regimes de velocidade (Número de Mach), trajetórias e comportamento dos sistemas de recuperação.A arquitetura do projeto é dividida estritamente em **Front-end** e **Back-end**.

# Comandos Principais de Execução (Build, Lint, Testes)

Estes comandos devem ser utilizados para validação contínua e verificação da saúde do projeto.

## 1. Front-end (`/frontend`)
- **Instalação de Dependências:** `npm install`
- **Executar em Desenvolvimento:** `npm run dev`
- **Linter e Formatação:** `npm run lint`
- **Executar Testes:** `npm test`
- **Build de Produção:** `npm run build`

## 2. Back-end (`/backend`)
- **Instalação de Dependências:** `pip install -r requirements.txt` ou `poetry install`
- **Executar Servidor FastAPI:** `uvicorn app.main:app --reload`
- **Linter e Verificação de Estilo:** `flake8` ou `ruff check .`
- **Checagem de Tipos:** `mypy .`
- **Executar Testes:** `pytest`

---

# Arquitetura do Sistema

## 1. Front-end (/frontend)
- Tecnologia: Next.js (React / TypeScript).
- Responsabilidades:
    - Interface de entrada de dados intuitiva e parametrizada por subsistemas.
    - Visualizador Interativo (2D / 3D): Renderização dinâmica do foguete baseada nas dimensões, diâmetros e posições relativas informadas pelo usuário, permitindo alternar entre as visões 2D e 3D.
    - Painel de Resultados (Dashboard): Exibição organizada dos KPIs da simulação e renderização interativa dos gráficos de desempenho.

## 2. Back-end (/backend)
- Tecnologia: FastAPI (Python).
- Responsabilidades:
    - Processamento do modelo físico dinâmico de 6 graus de liberdade (6-DoF) ou 3-DoF.
    - Execução da simulação física considerando arrasto aerodinâmico, variação de massa por queima de propelente, gravidade local, empuxo e condições atmosféricas.
    - Retorno dos dados estruturados e vetores temporais para plotagem dos gráficos.

# Módulos do Back-end e Parâmetros de Entrada
O motor de simulação deve modularizar os parâmetros de entrada nos seguintes componentes:

## 1. Propelente / Motor (/propulsion)
- Câmara de Combustão: Tamanho, diâmetro e massa da câmara vazia.
- Grão Propelente: Massa do propelente, quantidade de grãos, diâmetro do grão e tempo de queima de um único grão.
- Bocal Convergente-Divergente: Medidas geométricas e posição do bocal.
- Inércia e Massa: Inércia seca e posição do centro de massa seco ($CM_{seco}$).
- Parâmetros Termodinâmicos e de Impulso: Pressão de referência, empuxo/impulso total, impulso de pressão e velocidade de exaustão dos gases.

## 2. Aviônica (/avionics)
- Massa do sistema completo.
- Posição ($X, Y, Z$), diâmetro e comprimento/tamanho.

## 3. Satélite / Carga Útil (/payload)
- Massa do sistema completo.
- Posição ($X, Y, Z$), diâmetro e comprimento/tamanho.

## 4. Estrutura (/structure)
- Massa e Geometria Global: Massa da estrutura totalmente vazia (incluindo coifa), comprimento total do foguete (com coifa), diâmetro do corpo (fuselagem) e posição do centro de massa da estrutura ao longo do eixo do foguete.
- Aerodinâmica: Coeficiente de arrasto (Cd) de referência em baixo Número de Mach, usado como base para a correção de compressibilidade em função do Número de Mach.
- Coifa (Nose Cone): Formato (ex.: ogival, parabólico, cônico), tamanho/comprimento e massa da coifa.
- Aletas (Fins): Quantidade de aletas, angulação de montagem e geometria de planta (corda de raiz, corda de ponta, envergadura/semi-span, enflechamento e posição do bordo de ataque da raiz a partir da ponta do nariz) — necessária para o cálculo do Centro de Pressão pelo método de Barrowman.
- Guias de Lançamento (Rail Buttons): Quantidade e angulação dos rail buttons.

## 5. Recuperação (/recovery)
- Paraquedas: Presença ou ausência de paraquedas Drogue (piloto).
- Massas: Massa do suporte inferior, massa dos paraquedas (se houver drogue, somar a massa do drogue com a do main), massa da tampa do pistão e posição do centro de massa do conjunto de recuperação ao longo do eixo do foguete.
- Aerodinâmica dos Paraquedas: Coeficiente de arrasto (Cd) e diâmetro do paraquedas main; coeficiente de arrasto e diâmetro do drogue (se houver) — usados para calcular a velocidade terminal sob cada paraquedas.
- Ejeção: Quantidade de pólvora (em gramas).
- Preditivos de Voo: Velocidade terminal prevista, tempo de ativação do paraquedas após o apogeu (caso haja drogue, considerar 2 instantes distintos: um para o drogue e outro para o main) e raio de busca previsto (em metros).

## 6. Localização e Tempo (/environment)
- Coordenadas Geográficas: Latitude, longitude e elevação em relação ao nível do mar.
- Atmosfera e Trilha: Velocidade do vento prevista, comprimento do trilho de lançamento e inclinação do trilho em relação à vertical.

# Saídas e Resultados da Simulação
Após o processamento das leis da física aplicáveis (dinâmica de fluidos, aerodinâmica compressível/subsônica, gravitação e equações de movimento), o back-end deve retornar:
1. Apogeu: Altitude máxima atingida (em metros).
2. Estabilidade: Margem de estabilidade aerodinâmica em calibres ($cal$), calculada pela distância entre o Centro de Pressão ($CP$) e o Centro de Massa ($CM$).
3. Velocidade Terminal Detectada: Velocidade de descida sob velame. Se houver drogue, especificar as duas velocidades registradas (com o drogue e com o main).
4. Tempo de Queima Total: Tempo efetivo de empuxo do motor.
5. Gráfico de Altitude ao Longo do Tempo: Curva temporal da trajetória vertical $h(t)$.
6. Gráfico de Aceleração e Velocidade Vertical ao Longo do Tempo: Séries temporais de $a_z(t)$ e $v_z(t)$.

# Diretrizes para Agentes de IA e Desenvolvedores
1. Unidades de Medida: Adotar rigorosamente o Sistema Internacional de Unidades (SI) — metros ($\text{m}$), quilogramas ($\text{kg}$), segundos ($\text{s}$), Newtons ($\text{N}$) e metros por segundo ($\text{m/s}$) — na comunicação interna da API.
2. Validação de Dados: O FastAPI deve utilizar schemas com Pydantic para validar se os parâmetros físicos inseridos estão dentro de limites realistas antes de iniciar a simulação.
3. Performance Visual: No Next.js, garantir suporte a WebGL/Three.js para a visualização 3D, com mecanismo de fallback legível e fluido para o modo 2D.