#!/usr/bin/env bash
# detectar-geradores.sh — lista os geradores de imagem/mídia disponíveis na máquina (codex, gemini).
#
# Motivo: regra de mídia da casa. Imagem gerada NUNCA sai de modelo Claude (a qualidade do visual
# gerado por ele é inversamente proporcional à do código). Antes de gerar qualquer coisa, a skill
# precisa saber quais geradores existem para PERGUNTAR à pessoa qual usar. Esta detecção é só leitura:
# não executa nenhum gerador, não faz rede, não lê credencial.
#
# Uso:
#   bash scripts/detectar-geradores.sh          # texto
#   bash scripts/detectar-geradores.sh --json   # JSON em uma linha
#   bash scripts/detectar-geradores.sh --help
#
# Saída (texto):
#   codex: /caminho/codex   (ou: codex: ausente)
#   gemini: /caminho/gemini (ou: gemini: ausente)
#   DISPONIVEIS=codex,gemini  (vazio quando nenhum)
#
# Exit code (contrato da casa):
#   0  há pelo menos um gerador no PATH -> PERGUNTE à pessoa qual usar; execução via schematize-models
#   1  nenhum gerador no PATH           -> avise sem rodeio e ofereça as 3 saídas (instalar Codex/Gemini,
#                                          banco de imagem com licença comercial, asset do cliente)
#   2  uso errado (argumento desconhecido)
set -euo pipefail

GERADORES=(codex gemini)
modo="texto"

case "${1:-}" in
  "") ;;
  --json) modo="json" ;;
  -h|--help) sed -n '2,23p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
  *) printf 'argumento desconhecido: %s (use --json ou --help)\n' "$1" >&2; exit 2 ;;
esac

achados=()
linhas=()
json_itens=()
for g in "${GERADORES[@]}"; do
  # `command -v` é builtin: não executa o binário. Só conta se for arquivo executável.
  caminho="$(command -v -- "$g" 2>/dev/null || true)"
  if [ -n "$caminho" ] && [ -x "$caminho" ] && [ ! -d "$caminho" ]; then
    achados+=("$g")
    linhas+=("$g: $caminho")
    json_itens+=("\"$g\":\"${caminho//\"/\\\"}\"")
  else
    linhas+=("$g: ausente")
    json_itens+=("\"$g\":null")
  fi
done

lista=""
if [ "${#achados[@]}" -gt 0 ]; then
  lista="$(IFS=,; printf '%s' "${achados[*]}")"
fi

if [ "$modo" = "json" ]; then
  juntos="$(IFS=,; printf '%s' "${json_itens[*]}")"
  printf '{"geradores":{%s},"disponiveis":"%s"}\n' "$juntos" "$lista"
else
  printf '%s\n' "${linhas[@]}"
  printf 'DISPONIVEIS=%s\n' "$lista"
fi

status=0
if [ "${#achados[@]}" -eq 0 ]; then
  status=1
  if [ "$modo" = "texto" ]; then
    {
      echo "NENHUM gerador de imagem encontrado (codex, gemini)."
      echo "Visual gerado pelo Claude sai ruim: a qualidade dele é inversamente proporcional à de código."
      echo "Saídas: (1) instalar Codex ou Gemini, (2) banco de imagem com licença comercial"
      echo "(scripts/buscar-imagens.mjs), (3) asset do cliente."
    } >&2
  fi
fi
exit "$status"
