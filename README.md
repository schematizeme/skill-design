# schematize-design

> **A superskill de design da casa.** Direção visual, gosto, wireframe aprovado antes do código, tokens e contraste
> medidos, animação com um momento autoral, auditoria visual e as recusas unificadas de "cara de IA". Do pedido
> ("desenha essa landing", "polisse isso", "menos cara de IA") até a página auditada.

Pacote de **skill normativa para [Claude Code](https://claude.com/claude-code)**.
Parte do catálogo **schematize skills**.

## Por que ela existe

Havia três fontes boas de design e nenhuma completa: um pipeline de wireframe com scripts e números medidos, uma
filosofia de polimento e animação, e um método de direção de arte com lista de recusas. Usadas separadamente, dão
respostas diferentes para a mesma pergunta (qual easing? kicker acima do título pode? fonte de sistema?). Esta skill
funde as três em uma, **resolve os conflitos por escrito** (`references/recusas-anti-ai-slop.md` §6) e traz scripts
com teste.

## O que ela faz

```
referência visual → wireframe.json → wireframe.svg (cinza) → [aprovação] → código → auditoria
                                                                (HTML | Next.js | Shopify Liquid)
```

- **Wireframe como dado:** o JSON é a fonte da verdade; o SVG cinza é gerado por script determinístico para a pessoa
  aprovar antes de existir código.
- **Quatro modos** (Persuadir, Operar, Ler, Experienciar) que decidem densidade, tipo e movimento.
- **Piso de qualidade e 13 alavancas de refino** com números; **recusas** unificadas (kicker, card em card,
  métrica-herói, gradiente de texto, vidro de enfeite, roxo por padrão, emoji como ícone).
- **Animação:** framework de decisão (deve animar? propósito? easing? duração?), um momento autoral, GSAP só quando vale.
- **Contraste medido**, nos papéis do acento, e auditoria do DOM renderizado em cinco larguras.
- **Regra de mídia:** imagem gerada **nunca** por modelo Claude. Detecta Codex e Gemini, pergunta qual usar, delega à
  `schematize-models`. Sem gerador: aviso sem rodeio e três saídas (instalar, banco com licença, asset do cliente).

## Fronteira com a schematize-web

Design (esta skill) é **direção visual**. A `schematize-web` é **engenharia de front**: RSC, segurança, a11y como
piso técnico, Core Web Vitals, SEO técnico, testes. As duas se carregam juntas em página que vai a produção.

## Instalar

### Pelo app schematize (recomendado)

```bash
schematize install design    # requer o CLI schematize instalado
```

### Manual

```bash
git clone https://github.com/schematizeme/skill-design.git /tmp/skill-design
bash /tmp/skill-design/install.sh .          # instala em .claude/ do projeto atual
bash /tmp/skill-design/install.sh "$HOME"    # instala globalmente em ~/.claude/
```

Requisitos dos scripts: Node 18+ (nenhuma dependência npm); Chrome ou Chromium para `auditar-dom.mjs`
(`CHROME_PATH` aponta para um específico); `bash` para `detectar-geradores.sh`.

## Comandos

| Comando | O que faz |
|---|---|
| `/design-help` | lista os comandos |
| `/design-load` | carrega à força o corpo normativo |
| `/design-wire` | referência → `wireframe.json` + SVG; para e pergunta a stack |
| `/design-build` | constrói de um wireframe aprovado (HTML, Next.js, Liquid) |
| `/design-visual` | passada de revisão visual: DOM em 5 larguras, screenshot |
| `/design-audit` | contraste, DOM, imagens provisórias, checklist |
| `/design-shape [init\|document\|extract]` | planeja UX e UI; **PRODUCT.md**, `DESIGN.md`, tokens |
| `/design-critique` | crítica por heurística, tabela Before / After / Why |
| `/design-polish` | passada final antes de publicar |
| `/design-tune <bolder\|quieter\|distill\|colorize\|typeset\|layout\|clarify>` | ajuste de um eixo |
| `/design-animate <momento\|delight\|overdrive\|revisar>` | movimento com intenção |
| `/design-harden <estados\|i18n\|onboard\|adapt\|optimize>` | pronto para produção |
| `/design-variants <generate\|live>` | variantes lado a lado |
| `/design-claude` · `/design-handoff` · `/design-cc` | `CLAUDE.md` sempre-on · handoff · handoff + compact |

Comando sem argumento ou sem alvo **pergunta; nunca roda sozinho**.

## O que tem dentro

- **SKILL.md**: fronteiras, comandos, pisos, regra de mídia.
- **references/**: 21 arquivos por tema.
- **scripts/**: `render-wireframe.mjs`, `checar-contraste.mjs`, `auditar-dom.mjs`, `buscar-imagens.mjs`,
  `buscar-referencias.mjs`, `detectar-geradores.sh`, cada um com `*.test.sh` de casos vermelhos.
- **assets/**: `tokens.css`, `icones.svg`, `wireframe.schema.json`, `exemplos/`, `commands/`, `CLAUDE.md`.

## Testes

```bash
for t in scripts/*.test.sh; do bash "$t"; done
```

Os buscadores (`buscar-imagens`, `buscar-referencias`) testam só o que roda offline; a parte de rede está documentada
no cabeçalho de cada teste. O teste de `auditar-dom` pula, **e diz que pulou**, a parte que precisa de Chrome.

## Créditos e licenças

MIT (ver `LICENSE`). A skill **incorpora trabalho de terceiros**, sob as licenças originais:

- **[Emil Kowalski](https://github.com/emilkowalski/skills)**, *emil-design-eng*, **MIT**, Copyright (c) 2026 Emil
  Kowalski: filosofia de polimento, framework de decisão de animação, formato de revisão Before / After / Why.
- **[Paul Bakaus](https://github.com/pbakaus/impeccable)**, *Impeccable* v4.4, **Apache 2.0**, Copyright 2025 Paul
  Bakaus: modos, fluxo, piso de qualidade, recusas e comandos. **Condensado, adaptado e fundido em 2026-10-14.**
- Pipeline de wireframe, tokens, contraste, builds e scripts: trabalho da casa.

Textos integrais e aviso de modificações em [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md). Este pacote não é o
Impeccable nem o material do Emil, e não é afiliado nem endossado por eles.
