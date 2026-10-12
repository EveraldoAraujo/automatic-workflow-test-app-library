#!/usr/bin/env sh
# probe-e2e.sh — smoke test mínimo do probe "e2e" da plataforma dev-workflow.
#
# Objetivo: validar que o pipeline executa de ponta a ponta (planejar -> executar
# -> verificar) sem efeitos colaterais no repositório.
#
# Este script NÃO tem dependências externas (apenas POSIX sh) e não altera o
# projeto. Ele apenas verifica o estado esperado do baseline.

set -eu

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

root_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
readme="$root_dir/README.md"

# 1) O README.md do baseline deve existir.
[ -f "$readme" ] || fail "README.md não encontrado em $root_dir"

# 2) O conteúdo esperado do baseline é exatamente "# mono".
expected='# mono'
actual=$(sed -e 's/[[:space:]]*$//' "$readme" | head -n 1)

[ "$actual" = "$expected" ] || fail "conteúdo inesperado do README.md: '$actual' (esperado: '$expected')"

printf 'OK: README.md presente e com conteúdo esperado (%s)\n' "$expected"
printf 'OK: probe e2e concluído sem alterar o repositório\n'
