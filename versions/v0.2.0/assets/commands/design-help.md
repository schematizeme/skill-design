---
description: Mapa da skill schematize-design (superskill de design: referência visual, wireframe, código, polimento, animação, auditoria). Só mostra o menu.
---
**schematize-design** — direção visual, gosto, wireframe, polimento, animação e auditoria visual. Mostre isto e **não execute mais nada**.

```
referência  →  wireframe.json  →  wireframe.svg  →  [aprovação]  →  código  →  auditoria
```

| Comando | O que faz |
|---|---|
| `/design-help` | este menu |
| `/design-load` | carrega à força TODO o corpo normativo e passa a aplicá-lo |
| `/design-wire` | lê a referência, gera `./wireframe.json` + `./wireframe.svg` e **para** perguntando a stack |
| `/design-build` | constrói a partir de um wireframe aprovado (HTML, Next.js ou Shopify Liquid) |
| `/design-visual` | passada de revisão visual: mede o DOM em 5 larguras, screenshot, o que dá para melhorar |
| `/design-audit` | contraste, DOM, imagens provisórias e checklist numa página pronta |
| `/design-shape [init\|document\|extract]` | planeja UX e UI antes de construir; registra **PRODUCT.md** / `DESIGN.md` |
| `/design-critique` | crítica por heurística, tabela Before / After / Why |
| `/design-polish` | passada final de qualidade antes de publicar |
| `/design-tune <bolder\|quieter\|distill\|colorize\|typeset\|layout\|clarify>` | ajuste de um eixo, preservando identidade |
| `/design-animate <momento\|delight\|overdrive\|revisar>` | movimento com intenção; um momento autoral |
| `/design-harden <estados\|i18n\|onboard\|adapt\|optimize>` | pronto para produção |
| `/design-variants <generate\|live>` | variantes lado a lado para escolher |
| `/design-claude` | cria ou mescla o `CLAUDE.md` sempre-on de design |
| `/design-handoff` · `/design-cc` | handoff no archive / handoff + `/compact` |

Pisos: wireframe aprovado antes de código; nenhuma cor sem medir contraste; zero travessão em copy; um CTA focal por
tela; **mídia gerada nunca por modelo Claude** (detectar `codex`/`gemini`, perguntar, delegar à `schematize-models`);
`prefers-reduced-motion` e toque de 44px; "menos cara de IA" nunca refaz a página inteira.

Fronteira: design (esta skill) é direção visual; engenharia de front (RSC, segurança, a11y como piso técnico, CWV,
SEO técnico, testes) é da `schematize-web`. Comando sem alvo ou sem argumento pergunta; **nunca roda sozinho**.
