---
description: schematize-design — context compact: grava o handoff no archive e roda /compact.
---
Antes de compactar, **grave o handoff** em `<projeto>/<projeto>_archive/context/`, no par context + checklist do padrão
da `schematize-archive` (prefixo `AAAA-MM-DD-<slug>-`, FEITO vs ABERTO). Inclua o `wireframe.json` corrente, a direção
escolhida, as suposições abertas e os achados do último `auditar-dom`/`checar-contraste`. Só então rode `/compact`.
