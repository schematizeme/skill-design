---
description: schematize-design — planeja UX e UI antes de construir (objetivo, público, conteúdo, fluxo, estados); init/document/extract registram PRODUCT.md, DESIGN.md e tokens
argument-hint: "[init | document | extract]"
---
Método em `references/comandos.md` (seção `/design-shape`) e `references/modos-e-fluxo.md`.

Argumento: $ARGUMENTS

- **Sem argumento:** pergunte se quer o plano de UX/UI (padrão), `init`, `document` ou `extract`. Não escolha por conta própria.
- **Plano:** objetivo, público, conteúdo, fluxo, estados. Identifique o **modo** (Persuadir, Operar, Ler, Experienciar)
  e quanto inventar. Superfície nova em mundo estabelecido: derive 5 a 7 estruturas bem diferentes e escolha a de maior
  ressonância, registrando por que as outras saíram. Pergunte só o que muda o trabalho; o resto, decida e registre.
- **init:** escreva **PRODUCT.md** (o que é, para quem, voz, restrições, o que é verdade).
- **document:** gere `DESIGN.md` a partir do código (tokens, escala, componentes, decisões).
- **extract:** extraia tokens e componentes reutilizáveis.

Escreve no diretório atual; nunca sobrescreva **PRODUCT.md** ou `DESIGN.md` existentes sem mostrar o diff. Não construa
nada neste comando: o próximo passo é `/design-wire` ou `/design-build`.
