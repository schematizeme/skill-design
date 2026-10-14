#!/usr/bin/env bash
# Vermelho primeiro de auditar-dom.mjs.
#
# Parte offline (sempre roda): argumentos, arquivo ausente, URL remota recusada, Chrome ausente ou quebrado
# (exit 2: NÃO deu para verificar, nunca aprovação), e higiene do código.
# Parte com Chrome (roda se houver Chrome/Chromium na máquina; senão é PULADA e dita como pulada): páginas
# de mentira com UM defeito cada, e a página limpa passa. Se o CI não tem Chrome, a parte B não roda lá.
#
# EXCEÇÃO DECLARADA (schematize-shell → piso §1): harness de teste roda `set -u` sem `-e`.
set -u
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUT="$AQUI/auditar-dom.mjs"
TMP="$(mktemp -d)"; trap 'rm -rf "${TMP:?}"' EXIT INT TERM
ok=0; fail=0; pulados=0
export CHROME_NO_SANDBOX=1   # necessário em container/CI; inofensivo fora dele

afirma() { local nome="$1"; shift; if "$@" >/dev/null 2>&1; then echo "  ok     $nome"; ok=$((ok+1)); else echo "  FALHOU $nome"; fail=$((fail+1)); fi; }
caso() { # caso <nome> <exit-esperado> <agulha> -- args...   (CHROME_PATH herdado do ambiente do chamador)
  local nome="$1" esp="$2" agulha="$3"; shift 4
  local saida rc
  saida="$(node "$SUT" "$@" 2>&1)"; rc=$?
  if [ "$rc" != "$esp" ]; then echo "  FALHOU $nome: exit $rc, esperado $esp"; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  if [ -n "$agulha" ] && ! grep -qF -- "$agulha" <<<"$saida"; then echo "  FALHOU $nome: saída sem \"$agulha\""; sed 's/^/      /' <<<"$saida"; fail=$((fail+1)); return; fi
  echo "  ok     $nome"; ok=$((ok+1))
}

echo "== A. offline =="
caso sem-argumento    2 "uso:" --
caso arquivo-ausente  2 "nao encontrei" -- "$TMP/nao-existe.html"
caso url-remota       2 "URL remota nao e suportado" -- "https://exemplo.com"
echo '<html lang="pt-BR"><body><h1>x</h1></body></html>' > "$TMP/p.html"
caso largura-invalida 2 "--larguras aceita" -- "$TMP/p.html" --larguras=10
caso largura-gigante  2 "--larguras aceita" -- "$TMP/p.html" --larguras=999999

# Chrome quebrado: um "chrome" de mentira que sai com erro em toda largura => nada foi medido => exit 2.
printf '#!/bin/sh\nexit 1\n' > "$TMP/chrome-falso"; chmod +x "$TMP/chrome-falso"
CHROME_PATH="$TMP/chrome-falso" caso chrome-quebrado-nao-aprova 2 "nada foi medido" -- "$TMP/p.html" --larguras=1440
# Chrome que imprime lixo sem a sonda: idem. Aprovar sem medir é a condição vacuamente verdadeira.
printf '#!/bin/sh\necho "<html></html>"\nexit 0\n' > "$TMP/chrome-mudo"; chmod +x "$TMP/chrome-mudo"
CHROME_PATH="$TMP/chrome-mudo" caso chrome-mudo-nao-aprova 2 "nada foi medido" -- "$TMP/p.html" --larguras=1440
# Os temporários da sonda somem mesmo quando o Chrome falha.
afirma sem-lixo-ao-lado-da-pagina bash -c "! ls '$TMP'/_sdn-* 2>/dev/null | grep -q ."

echo "== higiene do código (segurança) =="
afirma sem-eval-nem-rede-propria bash -c "! grep -nE '\\beval\\(|new Function\\(|fetch\\(|https?\\.request|XMLHttpRequest|net\\.connect' '$SUT'"
# so duas variaveis de ambiente sao lidas, nenhuma e segredo
env_lidas="$(grep -oE 'process\.env\.[A-Z_]+' "$SUT" | sort -u | tr '\n' ' ')"
if [ "$env_lidas" = "process.env.CHROME_NO_SANDBOX process.env.CHROME_PATH " ]; then echo "  ok     so-lê-chrome-path-e-no-sandbox"; ok=$((ok+1)); else echo "  FALHOU env-lidas: $env_lidas"; fail=$((fail+1)); fi
afirma limpa-no-finally grep -q "limpar();" "$SUT"
afirma execfile-sem-shell bash -c "grep -q 'execFileSync(chrome' '$SUT' && ! grep -q 'execSync(' '$SUT'"

echo "== B. com Chrome =="
CH=""
for c in "${CHROME_PATH:-}" /usr/bin/google-chrome /usr/bin/google-chrome-stable /usr/bin/chromium /usr/bin/chromium-browser /snap/bin/chromium; do
  [ -n "$c" ] && [ -x "$c" ] && { CH="$c"; break; }
done
if [ -z "$CH" ]; then
  echo "  PULADO (sem Chrome/Chromium nesta máquina): 7 casos de DOM não rodaram"; pulados=7
else
  export CHROME_PATH="$CH"
  limpa='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="description" content="x"><title>t</title></head><body><h1>Titulo</h1><p>texto</p></body></html>'
  printf '%s' "$limpa" > "$TMP/limpa.html"
  caso pagina-limpa-passa 0 "0 grave(s), 0 medio(s)" -- "$TMP/limpa.html" --larguras=375,1440

  cat > "$TMP/overflow.html" <<'H'
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="description" content="x"><title>t</title></head><body><h1>a</h1><div style="width:3000px">largo</div></body></html>
H
  caso overflow-horizontal-reprova 1 "OVERFLOW" -- "$TMP/overflow.html" --larguras=375,1440

  cat > "$TMP/img-quebrada.html" <<'H'
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="description" content="x"><title>t</title></head><body><h1>a</h1><img src="nao-existe.png" alt="" width="10" height="10"></body></html>
H
  caso imagem-quebrada-reprova 1 "IMG-QUEBRADA" -- "$TMP/img-quebrada.html" --larguras=1440

  cat > "$TMP/glifo.html" <<'H'
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="description" content="x"><title>t</title></head><body><h1>a</h1><span>☎</span></body></html>
H
  caso icone-glifo-medio 0 "ICONE-GLIFO" -- "$TMP/glifo.html" --larguras=1440

  cat > "$TMP/alvo.html" <<'H'
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="description" content="x"><title>t</title></head><body><h1>a</h1><button style="width:20px;height:20px">x</button></body></html>
H
  caso alvo-de-toque-medio 0 "ALVO" -- "$TMP/alvo.html" --larguras=1440

  cat > "$TMP/sem-scrim.html" <<'H'
<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="description" content="x"><title>t</title><style>.hero{position:relative;background-image:url(foto.jpg);height:300px}.hero h2{color:#fff}</style></head><body><h1>a</h1><section class="hero"><h2>Texto claro sobre foto</h2></section></body></html>
H
  caso sem-scrim-reprova 1 "SEM-SCRIM" -- "$TMP/sem-scrim.html" --larguras=1440

  # a pagina com `$&` no HTML nao pode ser reescrita pelo padrao de substituicao
  printf '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="description" content="x"><title>t</title></head><body><h1>Preço $& e $1</h1></body></html>' > "$TMP/dolar.html"
  caso dolar-no-html-nao-quebra 0 "0 grave(s)" -- "$TMP/dolar.html" --larguras=1440
fi

echo "== resumo: $ok ok, $fail falha(s), $pulados pulado(s) =="
[ "$fail" -eq 0 ]
