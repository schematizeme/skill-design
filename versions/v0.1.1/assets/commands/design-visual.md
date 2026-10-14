---
description: schematize-design — passada de revisão visual numa página pronta: mede o DOM em 5 larguras, screenshot e o que ainda dá para melhorar
argument-hint: "[pagina.html]"
---
> `<skill>` = `.claude/skills/schematize-design` (instalação no projeto) ou `~/.claude/skills/schematize-design` (global).

Passada de **revisão visual**: depois do `/design-build` e antes de dizer que está pronto. Sem alvo, pergunte qual.

Alvo: $ARGUMENTS

1. **O que a máquina mede:**
   ```
   node <skill>/scripts/auditar-dom.mjs <pagina.html> [--larguras=375,744,1440]
   node <skill>/scripts/checar-contraste.mjs <pagina.html>
   ```
   Chrome headless em 375, 500, 744, 1068 e 1440px. **Grave é bloqueio.** Exit `2` = não mediu (não é aprovação).
2. **O que a máquina não mede:** tire screenshot em pelo menos duas larguras e **olhe**, com
   `--force-prefers-reduced-motion` (`references/review.md` §3).
3. **O que quase sempre dá para melhorar:** percorra a lista de `references/review.md` §4 e proponha só o que tem
   motivo.
4. **Relatório** no formato de `references/review.md` §1 (tabela Before / After / Why, severidade em `Why`), separando
   **o que está quebrado** do **o que dá para melhorar**. Um número absurdo e repetido é o auditor quebrado: confira
   um caso na mão antes de mandar corrigir.
