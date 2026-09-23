#!/usr/bin/env bash
# Verificação rápida pós-deploy do backend e do frontend.
#
# Uso: scripts/smoke-test.sh <URL_DO_BACKEND> <URL_DO_FRONTEND>
#  ex.: scripts/smoke-test.sh https://api.simulador.exemplo.com https://simulador.exemplo.com
#
# Checa: GET /health; POST /simulate com uma configuração estável (200 e
# apogeu > 0); rejeição de uma configuração instável (422); CORS liberado
# para a origem do frontend; e a página inicial do frontend (200). Requer
# curl e python3.
set -euo pipefail

BACKEND_URL="${1:-http://localhost:8000}"
FRONTEND_URL="${2:-http://localhost:3000}"
BACKEND_URL="${BACKEND_URL%/}"
FRONTEND_URL="${FRONTEND_URL%/}"

failures=0
if [[ -t 1 ]]; then green=$'\033[32m' red=$'\033[31m' reset=$'\033[0m'; else green='' red='' reset=''; fi
pass() { printf '  %sOK%s    %s\n' "$green" "$reset" "$1"; }
fail() { printf '  %sFALHA%s %s\n' "$red" "$reset" "$1"; failures=$((failures + 1)); }

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# Configurações de teste: os mesmos exemplos da documentação OpenAPI,
# lidos do próprio backend implantado (garante que a API é a esperada).
curl -fsS "$BACKEND_URL/openapi.json" -o "$tmp/openapi.json" \
  || { echo "Não foi possível obter $BACKEND_URL/openapi.json"; exit 1; }
python3 - "$tmp" <<'PY'
import json, sys
tmp = sys.argv[1]
spec = json.load(open(f"{tmp}/openapi.json"))
examples = spec["paths"]["/simulate"]["post"]["requestBody"]["content"]["application/json"]["examples"]
for name in ("estavel_sem_drogue", "instavel"):
    json.dump(examples[name]["value"], open(f"{tmp}/{name}.json", "w"))
PY

echo "Backend: $BACKEND_URL"

status="$(curl -sS -o "$tmp/health.json" -w '%{http_code}' "$BACKEND_URL/health" || true)"
if [[ "$status" == 200 ]] && grep -q '"ok"' "$tmp/health.json"; then
  pass "GET /health"
else
  fail "GET /health (HTTP $status)"
fi

status="$(curl -sS -o "$tmp/result.json" -w '%{http_code}' -X POST "$BACKEND_URL/simulate" \
  -H 'Content-Type: application/json' -d @"$tmp/estavel_sem_drogue.json" || true)"
if [[ "$status" == 200 ]] && apogee="$(python3 -c "import json,sys; a=json.load(open(sys.argv[1]))['apogee_altitude_m']; assert a > 0; print(f'{a:.1f}')" "$tmp/result.json" 2>/dev/null)"; then
  pass "POST /simulate, foguete estável (apogeu $apogee m)"
else
  fail "POST /simulate, foguete estável (HTTP $status)"
fi

status="$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BACKEND_URL/simulate" \
  -H 'Content-Type: application/json' -d @"$tmp/instavel.json" || true)"
if [[ "$status" == 422 ]]; then
  pass "POST /simulate, foguete instável rejeitado (422)"
else
  fail "POST /simulate, foguete instável (esperado 422, recebido $status)"
fi

allowed_origin="$(curl -sS -o /dev/null -D - -X OPTIONS "$BACKEND_URL/simulate" \
  -H "Origin: $FRONTEND_URL" -H 'Access-Control-Request-Method: POST' \
  | tr -d '\r' | awk -F': ' 'tolower($1) == "access-control-allow-origin" { print $2 }' || true)"
if [[ "$allowed_origin" == "$FRONTEND_URL" ]]; then
  pass "CORS liberado para $FRONTEND_URL"
else
  fail "CORS não libera $FRONTEND_URL (ajuste CORS_ALLOW_ORIGINS no backend)"
fi

echo "Frontend: $FRONTEND_URL"

status="$(curl -sS -o "$tmp/index.html" -w '%{http_code}' "$FRONTEND_URL/" || true)"
if [[ "$status" == 200 ]] && grep -q 'Simulador de Voo' "$tmp/index.html"; then
  pass "GET / (página do simulador)"
else
  fail "GET / (HTTP $status)"
fi

if [[ "$failures" -gt 0 ]]; then
  echo "$failures verificação(ões) falharam."
  exit 1
fi
echo "Todas as verificações passaram."
