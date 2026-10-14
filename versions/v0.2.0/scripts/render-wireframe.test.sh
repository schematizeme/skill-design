#!/usr/bin/env bash
# Vermelho primeiro de render-wireframe.mjs. Cada fixture é um wireframe.json com UM defeito.
#
# EXCEÇÃO DECLARADA (schematize-shell → piso §1): harness de teste roda `set -u` sem `-e` — precisa
# continuar depois de um caso vermelho para reportar todos.
set -u
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUT="$AQUI/render-wireframe.mjs"
TMP="$(mktemp -d)"; trap 'rm -rf "${TMP:?}"' EXIT INT TERM
ok=0; fail=0

# caso <nome> <exit-esperado> <agulha-na-saida> — o JSON do fixture vem pelo stdin
caso() {
  local nome="$1" esp="$2" agulha="$3"
  local d="$TMP/$nome"; mkdir -p "$d"
  cat > "$d/w.json"
  local saida rc
  saida="$(node "$SUT" "$d/w.json" "$d/w.svg" 2>&1)"; rc=$?
  if [ "$rc" != "$esp" ]; then echo "  FALHOU $nome: exit $rc, esperado $esp"; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  if [ -n "$agulha" ] && ! grep -qF -- "$agulha" <<<"$saida"; then echo "  FALHOU $nome: saída sem \"$agulha\""; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  # vermelho NÃO pode deixar SVG para trás (o renderer recusa antes de escrever)
  if [ "$esp" != 0 ] && [ -e "$d/w.svg" ]; then echo "  FALHOU $nome: recusou mas escreveu o SVG"; fail=$((fail+1)); return; fi
  if [ "$esp" = 0 ] && ! grep -q '<svg' "$d/w.svg"; then echo "  FALHOU $nome: passou mas o SVG não existe"; fail=$((fail+1)); return; fi
  echo "  ok     $nome"; ok=$((ok+1))
}

echo "== verde =="
caso minimo 0 "ok " <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"hero","layout":"centro","blocos":[{"tipo":"h1","texto":"Beneficio concreto"},{"tipo":"cta","texto":"Quero"}]}]}
J
caso eyebrow-funcional-com-nota 0 "ok " <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"artigo","layout":"empilhado","blocos":[{"tipo":"eyebrow","texto":"Guia","nota":"categoria do artigo, metadado funcional"},{"tipo":"h1","texto":"Titulo"}]}]}
J
caso card-um-nivel 0 "ok " <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"g","layout":"grid","colunas":2,"blocos":[{"tipo":"card","blocos":[{"tipo":"h3","texto":"A"}]},{"tipo":"card","blocos":[{"tipo":"h3","texto":"B"}]}]}]}
J

echo "== vermelhos =="
caso json-quebrado 1 "JSON invalido" <<'J'
{ isto nao e json
J
caso raiz-nao-objeto 1 "precisa ser um objeto" <<'J'
[1,2,3]
J
caso sem-meta 1 'falta "meta"' <<'J'
{"secoes":[{"id":"a","layout":"centro","blocos":[]}]}
J
caso secoes-vazio 1 '"secoes" ausente' <<'J'
{"meta":{"projeto":"T"},"secoes":[]}
J
caso secao-sem-id 1 'sem "id"' <<'J'
{"meta":{"projeto":"T"},"secoes":[{"layout":"centro","blocos":[]}]}
J
caso bloco-sem-tipo 1 'sem "tipo"' <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"centro","blocos":[{"texto":"x"}]}]}
J
caso travessao-em-dash 1 "travessao" <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"centro","blocos":[{"tipo":"h1","texto":"Rapido — e barato"}]}]}
J
caso travessao-en-dash 1 "travessao" <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"centro","blocos":[{"tipo":"h1","texto":"2020–2024"}]}]}
J
caso travessao-duplo-hifen 1 "travessao" <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"centro","blocos":[{"tipo":"corpo","texto":"isto -- aquilo"}]}]}
J
caso tres-ctas-diferentes 1 "CTAs primarios" <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"centro","blocos":[{"tipo":"cta","texto":"Um"},{"tipo":"cta","texto":"Dois"},{"tipo":"cta","texto":"Tres"}]}]}
J
caso eyebrow-sem-nota 1 "eyebrow sem" <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"centro","blocos":[{"tipo":"eyebrow","texto":"Novidade"},{"tipo":"h1","texto":"Titulo"}]}]}
J
caso eyebrow-nota-vazia 1 "eyebrow sem" <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"centro","blocos":[{"tipo":"eyebrow","texto":"Novidade","nota":"   "}]}]}
J
caso card-dentro-de-card 1 "card dentro de card" <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"grid","blocos":[{"tipo":"card","blocos":[{"tipo":"card","blocos":[{"tipo":"h3","texto":"x"}]}]}]}]}
J
caso eyebrow-dentro-de-card-sem-nota 1 "eyebrow sem" <<'J'
{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"grid","blocos":[{"tipo":"card","blocos":[{"tipo":"eyebrow","texto":"x"}]}]}]}
J

echo "== uso =="
saida="$(node "$SUT" 2>&1)"; rc=$?
if [ "$rc" = 1 ] && grep -q "uso:" <<<"$saida"; then echo "  ok     sem-argumento"; ok=$((ok+1)); else echo "  FALHOU sem-argumento (rc=$rc)"; fail=$((fail+1)); fi

echo "== exemplo do pacote renderiza (regressão do contrato) =="
EX="$AQUI/../assets/exemplos/lp-franquia.wireframe.json"
saida="$(node "$SUT" "$EX" "$TMP/ex.svg" 2>&1)"; rc=$?
if [ "$rc" = 0 ] && grep -q "8 secoes" <<<"$saida"; then echo "  ok     exemplo"; ok=$((ok+1)); else echo "  FALHOU exemplo (rc=$rc): $saida"; fail=$((fail+1)); fi

echo "== determinismo: mesmo JSON, mesmo SVG =="
node "$SUT" "$EX" "$TMP/ex2.svg" >/dev/null 2>&1
if cmp -s "$TMP/ex.svg" "$TMP/ex2.svg"; then echo "  ok     determinismo"; ok=$((ok+1)); else echo "  FALHOU determinismo"; fail=$((fail+1)); fi

echo "== resumo: $ok ok, $fail falha(s) =="
[ "$fail" -eq 0 ]
