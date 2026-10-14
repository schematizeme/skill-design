#!/usr/bin/env bash
# Vermelho primeiro de detectar-geradores.sh. Cada caso monta um PATH controlado com binários de mentira.
#
# EXCEÇÃO DECLARADA (schematize-shell → piso §1): harness de teste roda `set -u` sem `-e` — precisa
# continuar depois de um caso vermelho para reportar todos, em vez de parar no primeiro.
set -u
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUT="$AQUI/detectar-geradores.sh"
BASH_BIN="$(command -v bash)"
TMP="$(mktemp -d)"; trap 'rm -rf "${TMP:?}"' EXIT INT TERM
ok=0; fail=0

# caso <nome> <exit-esperado> <agulha> <dir-do-PATH> [args...]
caso() {
  local nome="$1" esp="$2" agulha="$3" dir="$4"; shift 4
  local saida rc
  saida="$(env -i PATH="$dir" "$BASH_BIN" "$SUT" "$@" 2>&1)"; rc=$?
  if [ "$rc" != "$esp" ]; then echo "  FALHOU $nome: exit $rc, esperado $esp"; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  if [ -n "$agulha" ] && ! grep -qF -- "$agulha" <<<"$saida"; then echo "  FALHOU $nome: saída sem \"$agulha\""; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  echo "  ok     $nome"; ok=$((ok+1))
}
falso() { printf '#!/bin/sh\nexit 0\n' > "$1/$2"; chmod +x "$1/$2"; }

VAZIO="$TMP/vazio"; mkdir -p "$VAZIO"
SO_CODEX="$TMP/so_codex"; mkdir -p "$SO_CODEX"; falso "$SO_CODEX" codex
SO_GEMINI="$TMP/so_gemini"; mkdir -p "$SO_GEMINI"; falso "$SO_GEMINI" gemini
AMBOS="$TMP/ambos"; mkdir -p "$AMBOS"; falso "$AMBOS" codex; falso "$AMBOS" gemini
SEM_EXEC="$TMP/sem_exec"; mkdir -p "$SEM_EXEC"; printf 'x' > "$SEM_EXEC/codex"   # existe mas NÃO é executável
DIR_NOME="$TMP/dir_nome"; mkdir -p "$DIR_NOME/gemini"                          # diretório chamado gemini

echo "== verdes =="
caso so-codex       0 "DISPONIVEIS=codex"        "$SO_CODEX"
caso so-gemini      0 "DISPONIVEIS=gemini"       "$SO_GEMINI"
caso ambos          0 "DISPONIVEIS=codex,gemini" "$AMBOS"
caso ambos-json     0 '"disponiveis":"codex,gemini"' "$AMBOS" --json

echo "== vermelhos (nenhum gerador, o caso que exige o aviso) =="
caso nenhum         1 "NENHUM gerador"           "$VAZIO"
caso nenhum-aviso   1 "inversamente proporcional" "$VAZIO"
caso nenhum-saidas  1 "banco de imagem"          "$VAZIO"
caso nenhum-json    1 '"disponiveis":""'         "$VAZIO" --json
caso arquivo-nao-executavel 1 "codex: ausente"   "$SEM_EXEC"
caso diretorio-com-o-nome   1 "gemini: ausente"  "$DIR_NOME"

echo "== uso errado =="
caso arg-desconhecido 2 "argumento desconhecido" "$AMBOS" --foo

echo "== o script não executa o gerador (só detecta) =="
MARCA="$TMP/marca"
printf '#!/bin/sh\ntouch "%s"\n' "$MARCA" > "$AMBOS/codex"; chmod +x "$AMBOS/codex"
env -i PATH="$AMBOS" "$BASH_BIN" "$SUT" >/dev/null 2>&1
if [ -e "$MARCA" ]; then echo "  FALHOU nao-executa: o gerador foi EXECUTADO"; fail=$((fail+1)); else echo "  ok     nao-executa"; ok=$((ok+1)); fi

echo "== resumo: $ok ok, $fail falha(s) =="
[ "$fail" -eq 0 ]
