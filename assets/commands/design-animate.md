---
description: schematize-design — movimento com intenção (framework de decisão do Emil, um momento autoral, GSAP só quando vale); argumentos momento, delight, overdrive, revisar
argument-hint: "<momento | delight | overdrive | revisar>"
---
Método em `references/animacao.md` e `references/comandos.md` (seção `/design-animate`).

Argumento: $ARGUMENTS

**Sem argumento:** liste os quatro e pergunte qual. Antes de qualquer código, responda às quatro perguntas do framework
de decisão (`animacao.md` §1): deve animar? qual o propósito? qual easing? qual duração? Nada animado em ação de teclado.

- `momento`: projeta o **um** momento autoral da página e as transições que explicam mudança de estado.
- `delight`: personalidade e detalhes memoráveis, só em uso raro ou na primeira vez.
- `overdrive`: um efeito tecnicamente extraordinário, dentro do orçamento (GSAP até ~45 KB gzip), com ramo de
  `prefers-reduced-motion` e conteúdo visível sem ele.
- `revisar`: revisa a animação existente e entrega a tabela Before / After / Why (`animacao.md` §13).

Só `transform` e `opacity`. Conteúdo visível por padrão (estado oculto só sob `.js-anima`). Se a animação sumir e a
página comunicar igual, ela é enfeite: diga isso.
