---
description: schematize-design — passada final de qualidade antes de publicar: piso de qualidade, animação, recusas e checklist, em uma rodada
argument-hint: "[arquivo, pasta ou página]"
---
Passada final. Uma rodada de inspeção (mobile e desktop juntos), um lote de correções, no máximo uma confirmação, e
pare. Sem alvo, pergunte qual.

Alvo: $ARGUMENTS

1. Aplique o **piso inteiro** de `references/piso-de-qualidade.md` (A pisos, B verificação no construído, C as 13
   alavancas) e as recusas de `references/recusas-anti-ai-slop.md`.
2. Revise o movimento pela tabela de `references/animacao.md` §13 (nada de `ease-in`, `transition: all`, `scale(0)`,
   duração acima de 300ms em UI, animação em ação de teclado).
3. Rode `scripts/checar-contraste.mjs` e `scripts/auditar-dom.mjs` quando houver página.
4. Entregue a tabela Before / After / Why (`review.md` §1) e, com aprovação, aplique. Preserve identidade,
   comportamento e copy: polimento não redesenha.
