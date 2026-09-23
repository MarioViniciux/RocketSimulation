# Deploy

Guia de deploy do simulador em produção: o **backend** (API FastAPI) e o **frontend** (Next.js). Para rodar em desenvolvimento, veja o `README.md`.

## Como as partes se conectam

```
navegador ──(página)──▶ frontend (Next.js, porta 3000)
    │
    └──(POST /simulate, direto do navegador)──▶ backend (FastAPI, porta 8000)
```

O navegador do usuário chama a API **diretamente**. O frontend não faz proxy. Por isso:

1. **O backend precisa de uma URL pública**, acessível pelo navegador, além da URL do frontend.
2. **O frontend embute a URL da API no build** (`NEXT_PUBLIC_API_BASE_URL`). Variáveis `NEXT_PUBLIC_*` são fixadas no bundle do navegador durante o `next build` e não são lidas em tempo de execução, então **mudar a URL da API exige um novo build**.
3. **O backend só aceita chamadas da origem do frontend** (CORS, `CORS_ALLOW_ORIGINS`). Ela precisa ser exatamente a URL que o usuário acessa (esquema + domínio + porta, sem barra final).

## Variáveis de configuração

| Serviço | Variável | Quando é lida | Padrão | Descrição |
|---|---|---|---|---|
| backend | `CORS_ALLOW_ORIGINS` | execução | `http://localhost:3000` | Origens do frontend liberadas no CORS, separadas por vírgula. |
| backend | `PORT` | execução (imagem Docker) | `8000` | Porta HTTP do uvicorn. |
| backend | `WEB_CONCURRENCY` | execução | `2` na imagem Docker | Processos do uvicorn. A simulação é CPU-bound: use cerca de 1 por núcleo. |
| frontend | `NEXT_PUBLIC_API_BASE_URL` | **build** | `http://localhost:8000` | URL pública da API. |
| frontend | `PORT` / `HOSTNAME` | execução | `3000` / `0.0.0.0` | Porta e interface do servidor Next.js. |

## Opção 1: Docker Compose (recomendado)

Requer Docker com o plugin Compose (`docker compose version`).

```bash
cp .env.example .env
# edite .env: FRONTEND_PUBLIC_URL e API_PUBLIC_URL com as URLs públicas
docker compose up -d --build
scripts/smoke-test.sh "$API_PUBLIC_URL" "$FRONTEND_PUBLIC_URL"   # ou as URLs digitadas
```

`docker-compose.yml` sobe os dois serviços com reinício automático. O frontend espera o healthcheck do backend passar. Variáveis do `.env`:

| Variável | Padrão | Uso |
|---|---|---|
| `FRONTEND_PUBLIC_URL` | `http://localhost:3000` | Vira `CORS_ALLOW_ORIGINS` do backend |
| `API_PUBLIC_URL` | `http://localhost:8000` | Vira `NEXT_PUBLIC_API_BASE_URL` no build do frontend |
| `BACKEND_PORT` / `FRONTEND_PORT` | `8000` / `3000` | Portas publicadas no host |
| `BACKEND_WORKERS` | `2` | `WEB_CONCURRENCY` do backend |

Operação do dia a dia:

```bash
docker compose ps                  # estado e healthchecks
docker compose logs -f backend     # logs
git pull && docker compose up -d --build   # atualizar para uma nova versão
docker compose down                # parar
```

## Opção 2: imagens Docker separadas

Útil para plataformas que rodam um container por serviço (Render, Fly.io, Railway, Google Cloud Run, Kubernetes etc.). As duas imagens respeitam a variável `PORT` definida pela plataforma.

```bash
# Backend
docker build -t rocketsim-backend ./backend
docker run -d -p 8000:8000 \
  -e CORS_ALLOW_ORIGINS=https://simulador.exemplo.com \
  rocketsim-backend

# Frontend: a URL da API entra no build
docker build -t rocketsim-frontend \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.simulador.exemplo.com \
  ./frontend
docker run -d -p 3000:3000 rocketsim-frontend
```

As imagens:

- **backend** (`backend/Dockerfile`): `python:3.11-slim`, usuário sem privilégios e healthcheck em `/health`. Roda o uvicorn com `--proxy-headers`, para funcionar atrás de proxy reverso ou HTTPS.
- **frontend** (`frontend/Dockerfile`): build em múltiplos estágios com a saída `standalone` do Next.js (só `server.js` e as dependências necessárias), `node:22-slim`, usuário sem privilégios e healthcheck na página inicial.

Em plataformas gerenciadas, defina `NEXT_PUBLIC_API_BASE_URL` como **argumento de build** do frontend, não como variável de execução, e `CORS_ALLOW_ORIGINS` como variável de execução do backend.

## Opção 3: sem Docker (servidor Linux)

### Backend

```bash
cd backend
python3.11 -m venv .venv
.venv/bin/pip install -r requirements.txt
CORS_ALLOW_ORIGINS=https://simulador.exemplo.com \
  .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2 --proxy-headers
```

### Frontend

```bash
cd frontend
npm ci
NEXT_PUBLIC_API_BASE_URL=https://api.simulador.exemplo.com npm run build:standalone
PORT=3000 HOSTNAME=127.0.0.1 npm run start:standalone
```

`build:standalone` gera `.next/standalone` e copia para lá os arquivos estáticos (`public/` e `.next/static/`), que o `server.js` passa a servir. Esse diretório é autocontido: pode ser copiado sozinho para o servidor e executado com `node server.js`, sem `node_modules`. Não use `npm start` (`next start`) em produção: ele não é compatível com `output: "standalone"`.

### Serviços systemd (exemplo)

```ini
# /etc/systemd/system/rocketsim-backend.service
[Unit]
Description=RocketSimulation backend (FastAPI)
After=network.target

[Service]
User=rocketsim
WorkingDirectory=/opt/rocketsim/backend
Environment=CORS_ALLOW_ORIGINS=https://simulador.exemplo.com
ExecStart=/opt/rocketsim/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2 --proxy-headers
Restart=always

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/rocketsim-frontend.service
[Unit]
Description=RocketSimulation frontend (Next.js)
After=network.target

[Service]
User=rocketsim
WorkingDirectory=/opt/rocketsim/frontend/.next/standalone
Environment=PORT=3000 HOSTNAME=127.0.0.1 NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now rocketsim-backend rocketsim-frontend
```

## Proxy reverso e HTTPS

Em produção, exponha os dois serviços por HTTPS atrás de um proxy reverso (nginx, Caddy, Traefik, ou o balanceador da plataforma), de preferência em **subdomínios separados**, por exemplo `simulador.exemplo.com` (frontend) e `api.simulador.exemplo.com` (API). Exemplo com nginx, com os certificados já emitidos (ex.: certbot):

```nginx
server {
    listen 443 ssl;
    server_name simulador.exemplo.com;
    # ssl_certificate / ssl_certificate_key ...
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl;
    server_name api.simulador.exemplo.com;
    # ssl_certificate / ssl_certificate_key ...
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Com esse exemplo, a configuração fica:

- `CORS_ALLOW_ORIGINS=https://simulador.exemplo.com`
- `NEXT_PUBLIC_API_BASE_URL=https://api.simulador.exemplo.com`

Não sirva a API em um subcaminho do domínio do frontend (ex.: `/api`): as rotas e a documentação do FastAPI assumem a raiz do domínio.

## Verificação pós-deploy

```bash
scripts/smoke-test.sh https://api.simulador.exemplo.com https://simulador.exemplo.com
```

O script requer `curl` e `python3` e verifica:

- `GET /health`;
- uma simulação estável (`POST /simulate` com HTTP 200 e apogeu > 0);
- a rejeição de uma configuração instável (HTTP 422);
- se o CORS libera a origem do frontend;
- se a página do simulador carrega.

Os payloads de teste são os exemplos publicados na própria documentação OpenAPI da API implantada. O script sai com código diferente de zero se algo falhar, então serve também como etapa final de um pipeline de CI/CD.

A documentação interativa da API fica disponível em `<URL da API>/docs`.

## Solução de problemas

| Sintoma | Causa provável | Correção |
|---|---|---|
| "Não foi possível conectar à API" no dashboard | `NEXT_PUBLIC_API_BASE_URL` errada ou não pública (ex.: `localhost` num servidor remoto) | Refaça o build do frontend com a URL pública da API |
| Erro de CORS no console do navegador; smoke test acusa CORS | `CORS_ALLOW_ORIGINS` diferente da URL do frontend (esquema, porta, `www`) | Ajuste a variável do backend e reinicie-o |
| Mudei a URL da API, mas o frontend continua chamando a antiga | A URL é fixada no build | Rode `docker compose up -d --build` ou refaça o `build:standalone` |
| Página em HTTPS, API em HTTP bloqueada | Conteúdo misto (*mixed content*) | Sirva a API também por HTTPS |
| Simulações lentas sob carga | Poucos processos do uvicorn | Aumente `WEB_CONCURRENCY`/`--workers` (cerca de 1 por núcleo) |
