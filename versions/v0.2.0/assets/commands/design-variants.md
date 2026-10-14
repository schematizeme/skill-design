---
description: schematize-design — gera variantes lado a lado de um elemento para a pessoa escolher; generate (arquivo autocontido) ou live (servidor local em 127.0.0.1)
argument-hint: "<generate | live>"
---
Método em `references/comandos.md` (seção `/design-variants`).

Argumento: $ARGUMENTS

**Sem argumento:** pergunte qual elemento e qual modo. Não escolha sozinho.

- `generate`: de 3 a 5 variantes com decisões **diferentes** (não o mesmo layout com cores trocadas), todas num
  `variantes.html` autocontido, com rótulo, o mesmo conteúdo real e as recusas aplicadas a todas. Pare e pergunte qual
  seguir; mistura é pedido legítimo.
- `live`: o mesmo, servido em `127.0.0.1` (nunca `0.0.0.0`); a cada rodada reescreva a escolhida. Encerre o servidor
  ao terminar.

Imagem em variante segue a regra de mídia do `SKILL.md`: nada gerado por modelo Claude.
