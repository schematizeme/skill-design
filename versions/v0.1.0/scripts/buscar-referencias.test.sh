#!/usr/bin/env bash
# Vermelho primeiro de buscar-referencias.mjs — SÓ o que roda offline.
#
# O QUE ESTE TESTE NÃO COBRE (documentado): a leitura dos feeds (One Page Love, Minimal Gallery) e a extração
# de um site real dependem de rede e de conteúdo que muda. Cobre-se aqui a SEGURANÇA da entrada: o --extrair
# recusa protocolo que não seja http(s) e destino local ou privado (nenhuma requisição chega a sair), e o
# código não carrega segredo nem fala com host desconhecido.
#
# EXCEÇÃO DECLARADA (schematize-shell → piso §1): harness de teste roda `set -u` sem `-e`.
set -u
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUT="$AQUI/buscar-referencias.mjs"
TMP="$(mktemp -d)"; trap 'rm -rf "${TMP:?}"' EXIT INT TERM
ok=0; fail=0

caso() { # caso <nome> <exit-esperado> <agulha> -- args...
  local nome="$1" esp="$2" agulha="$3"; shift 4
  local d="$TMP/$nome"; mkdir -p "$d"
  local saida rc
  saida="$(cd "$d" && timeout 20 node "$SUT" "$@" 2>&1)"; rc=$?
  if [ "$rc" != "$esp" ]; then echo "  FALHOU $nome: exit $rc, esperado $esp"; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  if [ -n "$agulha" ] && ! grep -qF -- "$agulha" <<<"$saida"; then echo "  FALHOU $nome: saída sem \"$agulha\""; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  echo "  ok     $nome"; ok=$((ok+1))
}
afirma() { local nome="$1"; shift; if "$@" >/dev/null 2>&1; then echo "  ok     $nome"; ok=$((ok+1)); else echo "  FALHOU $nome"; fail=$((fail+1)); fi; }

echo "== --extrair recusa o que não deve sair da máquina (exit 2) =="
caso protocolo-file       2 "protocolo file:"       -- --extrair=file:///etc/passwd
caso protocolo-ftp        2 "protocolo ftp:"        -- --extrair=ftp://exemplo.com/x
caso protocolo-javascript 2 "nao aceito"            -- "--extrair=javascript:alert(1)"
caso url-invalida         2 "URL invalida"          -- --extrair=isto-nao-e-url
caso localhost            2 "destino local recusado" -- --extrair=http://localhost:8080/
caso loopback-v4          2 "privado ou local"      -- --extrair=http://127.0.0.1:9/
caso metadata-nuvem       2 "privado ou local"      -- --extrair=http://169.254.169.254/latest/meta-data/
caso rede-10              2 "privado ou local"      -- --extrair=http://10.0.0.5/
caso rede-172-16          2 "privado ou local"      -- --extrair=http://172.16.3.4/
caso rede-192-168         2 "privado ou local"      -- --extrair=http://192.168.0.1/
caso dominio-local        2 "destino local recusado" -- --extrair=http://impressora.local/
caso loopback-v6          2 "IPv6 local"            -- "--extrair=http://[::1]:8080/"
caso ipv6-privado         2 "IPv6 local"            -- "--extrair=http://[fd00::1]/"

echo "== o que NÃO é privado passa pela recusa (a recusa é só de destino) =="
# 172.32.0.1 está fora de 172.16/12 (privado vai de 172.16 a 172.31). O teste só prova que a recusa de destino
# NÃO dispara aqui; a tentativa de rede falha por timeout ou conexão (exit 1), nunca com a recusa (exit 2).
saida="$(cd "$TMP" && timeout 25 node "$SUT" --extrair=http://172.32.0.1:9/ 2>&1)"; rc=$?
if [ "$rc" != 2 ] && ! grep -q "recusado" <<<"$saida"; then echo "  ok     172.32-nao-e-privado"; ok=$((ok+1)); else echo "  FALHOU 172.32-nao-e-privado (rc=$rc)"; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); fi

echo "== higiene do código (segurança) =="
afirma sem-chave-hardcoded bash -c "! grep -nE '(api[_-]?key|secret|token)[^\n]{0,20}[=:] *[\"'\\'']?[A-Za-z0-9_-]{24,}' '$SUT'"
afirma sem-eval bash -c "! grep -nE '\\beval\\(|new Function\\(|child_process' '$SUT'"
afirma so-escreve-referencias-json bash -c "[ \"\$(grep -c 'writeFileSync(' '$SUT')\" = 1 ] && grep -q \"writeFileSync('referencias.json'\" '$SUT'"
afirma extrair-nao-segue-redirect grep -q "redirect: 'manual'" "$SUT"
hosts="$(grep -oE 'https?://[A-Za-z0-9.-]+' "$SUT" | sed -E 's#https?://##' | sort -u | tr '\n' ' ')"
permitidos=" onepagelove.com minimal.gallery exemplo.com site-que-interessou.com "
estranho=""
for h in $hosts; do case "$permitidos" in *" $h "*) ;; *) estranho="$estranho $h" ;; esac; done
if [ -z "$estranho" ]; then echo "  ok     hosts-conhecidos"; ok=$((ok+1)); else echo "  FALHOU hosts-conhecidos:$estranho"; fail=$((fail+1)); fi

echo "== --tag com metacaractere de regex não quebra nem vira ReDoS =="
# Sem rede os feeds falham (lista vazia) e o script sai 0; o ponto é não lançar SyntaxError de regex.
caso tag-com-parenteses 0 "" -- "--tag=(((a+)+)+)+\\"

echo "== resumo: $ok ok, $fail falha(s) =="
echo "  (feeds e extração de site real NÃO cobertos aqui: ver cabeçalho)"
[ "$fail" -eq 0 ]
