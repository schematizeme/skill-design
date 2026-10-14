---
description: schematize-design — audita contraste, DOM renderizado, imagens provisórias e anti-padrões numa página pronta (tabela Before / After / Why)
argument-hint: "[pagina.html | tokens.css | wireframe.json]"
---
> `<skill>` = `.claude/skills/schematize-design` (instalação no projeto) ou `~/.claude/skills/schematize-design` (global).

Você está executando o **Passo 5** da `schematize-design`. Sem alvo, pergunte qual.

Alvo: $ARGUMENTS

1. **Paleta:** `node <skill>/scripts/checar-contraste.mjs <wireframe.json | tokens.css | pagina.html>`. Se
   `cores nao avaliadas` não for zero, o relatório não vale sozinho.
2. **DOM renderizado:** `node <skill>/scripts/auditar-dom.mjs <pagina.html>`. Auditoria de paleta não substitui o DOM
   (o CSS ganha superfícies que a paleta não tinha; opacidade, herança e fundo composto só existem no DOM). Exit `2`
   nunca é aprovação. **Teste de mutação** (`references/review.md` §5): devolva uma cor reprovada, confirme que o
   auditor acusa, e só então confie no verde.
3. **Imagens provisórias:** `grep -c data-provisorio index.html` tem de dar **0** antes de publicar. Nenhuma licença
   NonCommercial; crédito visível onde `creditoObrigatorio: true`. Meça o contraste de texto sobre foto **com a foto
   real** (ponto cego do `checar-contraste.mjs`).
4. **Mídia:** confirme que nenhuma imagem foi gerada por modelo Claude (regra de mídia do `SKILL.md`).
5. **Checklist:** `references/checklist.md` inteiro, mais as recusas de `references/recusas-anti-ai-slop.md`.
6. **Relatório** em `references/review.md` §1: tabela Before / After / Why, priorizada por severidade real, com o
   número medido e o substituto concreto. Engenharia de front (RSC, CWV, testes) é da `schematize-web`.
