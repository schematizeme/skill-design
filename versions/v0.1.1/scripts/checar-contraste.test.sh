#!/usr/bin/env bash
# Vermelho primeiro de checar-contraste.mjs. Pares conhecidos, valores medidos à mão (WCAG 2.1).
#
# EXCEÇÃO DECLARADA (schematize-shell → piso §1): harness de teste roda `set -u` sem `-e`.
set -u
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUT="$AQUI/checar-contraste.mjs"
TMP="$(mktemp -d)"; trap 'rm -rf "${TMP:?}"' EXIT INT TERM
ok=0; fail=0

# caso <nome> <exit-esperado> <agulha> -- args...
caso() {
  local nome="$1" esp="$2" agulha="$3"; shift 4
  local saida rc
  saida="$(node "$SUT" "$@" 2>&1)"; rc=$?
  if [ "$rc" != "$esp" ]; then echo "  FALHOU $nome: exit $rc, esperado $esp"; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  if [ -n "$agulha" ] && ! grep -qF -- "$agulha" <<<"$saida"; then echo "  FALHOU $nome: saída sem \"$agulha\""; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  echo "  ok     $nome"; ok=$((ok+1))
}

echo "== pares (números medidos) =="
caso preto-no-branco     0 "21.00:1" -- "#000000" "#ffffff"
caso texto-principal     0 "16.83:1" -- "#1d1d1f" "#ffffff"
caso cinza-classico-reprova 1 "3.62:1" -- "#86868b" "#ffffff"
caso cinza-classico-sugere  1 "substituto sugerido" -- "#86868b" "#ffffff"
caso cinza-na-superficie 1 "3.33:1" -- "#86868b" "#f5f5f7"
caso hover-derruba-token 1 "4.38:1" -- "#6e6e73" "#eeeef0"
caso cor-de-marca-reprova 1 "4.44:1" -- "#a8608f" "#ffffff"
caso cor-de-marca-corrigida 0 "5.22:1" -- "#9b5583" "#ffffff"
caso rotulo-branco-no-azul 0 "4.70:1" -- "#ffffff" "#0071e3"
caso rotulo-branco-no-azul-escuro-tema 1 "3.02:1" -- "#ffffff" "#2997ff"

echo "== wireframe.json: papéis do acento =="
cat > "$TMP/bom.json" <<'J'
{"meta":{"projeto":"T"},"tokens":{"acento":"#0071e3","acentoTexto":"#0066cc","acentoRotulo":"#ffffff","fundo":"#ffffff","superficie":"#f5f5f7","texto":"#1d1d1f","textoSec":"#5f5f65"},"secoes":[]}
J
caso wireframe-bom 0 "ok. Todos os pares" -- "$TMP/bom.json"
cat > "$TMP/cinza.json" <<'J'
{"meta":{"projeto":"T"},"tokens":{"textoSec":"#86868b"},"secoes":[]}
J
caso wireframe-cinza-reprova 1 "REPROVOU" -- "$TMP/cinza.json"
cat > "$TMP/acento-claro.json" <<'J'
{"meta":{"projeto":"T"},"tokens":{"acento":"#c6f432","acentoRotulo":"#ffffff"},"secoes":[]}
J
caso wireframe-acento-claro-rotulo-branco 1 "claro demais" -- "$TMP/acento-claro.json"
cat > "$TMP/sem-tokens.json" <<'J'
{"meta":{"projeto":"T"},"secoes":[]}
J
caso wireframe-sem-tokens-mede-defaults 0 "ok. Todos os pares" -- "$TMP/sem-tokens.json"

echo "== CSS: bloco medido contra o próprio fundo =="
cat > "$TMP/ruim.css" <<'C'
:root { --fundo: #ffffff; --texto: #1d1d1f; --texto-ter: #86868b; }
C
caso css-reprova 1 "REPROVOU" -- "$TMP/ruim.css"
cat > "$TMP/bom.css" <<'C'
:root { --fundo: #ffffff; --texto: #1d1d1f; --texto-ter: #67676c; }
@media (prefers-color-scheme: dark) { :root { --fundo: #000000; --texto: #f5f5f7; } }
C
caso css-bom 0 "cores nao avaliadas: 0" -- "$TMP/bom.css"
caso tokens-do-pacote 0 "ok. Todos os pares" -- "$AQUI/../assets/tokens.css"
cat > "$TMP/sem-fundo.css" <<'C'
:root { --texto: #1d1d1f; --texto-sec: #5f5f65; }
C
# bloco sem fundo declarado NÃO pode virar "0 reprovações": o relatório conta o que não avaliou
caso css-sem-fundo-conta-nao-avaliadas 0 "cores nao avaliadas: 2" -- "$TMP/sem-fundo.css"

echo "== não deu para verificar (exit 2, nunca aprovação) =="
caso sem-argumento       2 "uso:" --
caso arquivo-inexistente 2 "nao encontrei" -- "$TMP/nao-existe.css"
echo ':root { --x: 1px; }' > "$TMP/sem-cor.css"
caso css-sem-cor         2 "nenhuma custom property de cor" -- "$TMP/sem-cor.css"
caso hex-invalido        2 "nao encontrei" -- "#zzzzzz" "#ffffff"

echo "== resumo: $ok ok, $fail falha(s) =="
[ "$fail" -eq 0 ]
