#!/usr/bin/env bash
# Vermelho primeiro de buscar-imagens.mjs — SÓ o que roda offline.
#
# O QUE ESTE TESTE NÃO COBRE (documentado, não escondido): a busca em si depende de rede e de bancos
# externos (Pexels, Unsplash, Openverse, Picsum) cujo conteúdo muda; não há como fixar um resultado.
# Cobre-se aqui: validação de argumentos e de entrada, escrita só quando há o que escrever, nenhum vazamento
# de chave e a higiene do código (sem chave hardcoded, sem host inesperado, nome de arquivo sanitizado).
#
# EXCEÇÃO DECLARADA (schematize-shell → piso §1): harness de teste roda `set -u` sem `-e`.
set -u
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUT="$AQUI/buscar-imagens.mjs"
TMP="$(mktemp -d)"; trap 'rm -rf "${TMP:?}"' EXIT INT TERM
ok=0; fail=0

# caso <nome> <exit-esperado> <agulha> -- args...   (roda dentro de $TMP/<nome>)
caso() {
  local nome="$1" esp="$2" agulha="$3"; shift 4
  local d="$TMP/$nome"; mkdir -p "$d"
  local saida rc
  saida="$(cd "$d" && node "$SUT" "$@" 2>&1)"; rc=$?
  if [ "$rc" != "$esp" ]; then echo "  FALHOU $nome: exit $rc, esperado $esp"; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  if [ -n "$agulha" ] && ! grep -qF -- "$agulha" <<<"$saida"; then echo "  FALHOU $nome: saída sem \"$agulha\""; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  echo "  ok     $nome"; ok=$((ok+1))
}
afirma() { # afirma <nome> <comando-que-deve-dar-0>
  local nome="$1"; shift
  if "$@" >/dev/null 2>&1; then echo "  ok     $nome"; ok=$((ok+1)); else echo "  FALHOU $nome"; fail=$((fail+1)); fi
}

echo "== entrada inválida (exit 2: não deu para buscar) =="
caso sem-argumento 2 "uso:" --
echo '{ nao e json' > "$TMP/quebrado.json"
caso json-quebrado 2 "JSON invalido" -- "$TMP/quebrado.json"
echo '{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"centro","blocos":[{"tipo":"h1","texto":"x"}]}]}' > "$TMP/sem-media.json"
caso sem-bloco-media 2 'nenhum bloco "media"' -- "$TMP/sem-media.json"
echo '{"meta":{"projeto":"T"},"secoes":[{"id":"a","layout":"centro","blocos":[{"tipo":"media","busca":"house"}]}]}' > "$TMP/ok.json"
caso licenca-invalida 2 'aceita "cc0" ou "comercial"' -- "$TMP/ok.json" --licenca=nc
caso licenca-nc-recusada 2 'aceita "cc0" ou "comercial"' -- "$TMP/ok.json" --licenca=by-nc

echo "== nada é escrito quando a entrada é inválida =="
afirma sem-imagens-json-apos-erro test ! -e "$TMP/licenca-invalida/imagens.json" -a ! -e "$TMP/ok.imagens.json"

echo "== higiene do código (segurança) =="
# nenhuma chave de API embutida: padrões típicos de token
afirma sem-chave-hardcoded bash -c "! grep -nE '(pexels|unsplash)[^\n]{0,40}[=:] *[\"'\\'']?[A-Za-z0-9_-]{30,}' '$SUT'"
afirma sem-bearer-literal bash -c "! grep -nE 'Bearer +[A-Za-z0-9_.-]{20,}' '$SUT'"
# as chaves só vêm do ambiente
afirma chaves-so-do-ambiente bash -c "grep -q 'process.env.PEXELS_API_KEY' '$SUT' && grep -q 'process.env.UNSPLASH_ACCESS_KEY' '$SUT'"
# todo host de requisição é um destes (sem exfiltração para host desconhecido)
hosts="$(grep -oE 'https?://[A-Za-z0-9.-]+' "$SUT" | sed -E 's#https?://##' | sort -u | tr '\n' ' ')"
permitidos=" api.pexels.com api.unsplash.com api.openverse.org picsum.photos www.pexels.com unsplash.com www.apache.org gsap.com "
estranho=""
for h in $hosts; do case "$permitidos" in *" $h "*) ;; *) estranho="$estranho $h" ;; esac; done
if [ -z "$estranho" ]; then echo "  ok     hosts-conhecidos"; ok=$((ok+1)); else echo "  FALHOU hosts-conhecidos:$estranho"; fail=$((fail+1)); fi
# o download recusa não-https e tem teto de tamanho; o nome de arquivo é sanitizado
afirma download-so-https grep -q "download recusado: so https" "$SUT"
afirma download-tem-limite grep -q "LIMITE_BYTES" "$SUT"
afirma nome-de-arquivo-sanitizado grep -q "nomeSeguro(a.secao)" "$SUT"
afirma sem-eval bash -c "! grep -nE '\\beval\\(|new Function\\(|child_process' '$SUT'"

echo "== a licença NonCommercial nunca entra (regra no código) =="
afirma nc-barrado grep -q "l.includes('nc')" "$SUT"

echo "== resumo: $ok ok, $fail falha(s) =="
echo "  (busca de rede NÃO coberta aqui: ver cabeçalho)"
[ "$fail" -eq 0 ]
