---
name: schematize-design
metadata:
  version: 0.1.0
description: >-
  Design de UI: desenhar, redesenhar, criticar e polir site, landing, tela e componente; wireframe aprovado antes do
  código; tokens, contraste, animação, "menos cara de IA". Imagem só fora do Claude. Engenharia de front:
  schematize-web.
---

# schematize-design: a superskill de design da casa

Direção visual, gosto, wireframe, polimento, animação e auditoria visual, numa skill só. Ela funde três fontes (ver
**Créditos**): o pipeline da casa (referência visual, `wireframe.json`, SVG cinza para aprovação, código), a filosofia
de polimento e o framework de animação de Emil Kowalski, e o método de direção de arte do Impeccable. Onde as três
discordam, a decisão está resolvida e escrita em `references/recusas-anti-ai-slop.md` (tabela "Conflitos entre as
fontes"): não reabra caso a caso.

**Versão:** skill `schematize-design` v0.1.0. Changelog em `CHANGELOG.md`.

## Precedência e herança (leia antes de divergir)

<!-- herdado:engineering/precedencia:dominio intro="Esta skill é a **direção visual** da casa: decide como a interface parece e se comporta (gosto, wireframe, polimento, animação, auditoria visual). A **engenharia de front** (RSC, segurança, a11y como piso técnico, Core Web Vitals, SEO técnico, testes) é da `schematize-web`; a fronteira está abaixo." cmd="design" -->Esta skill é a **direção visual** da casa: decide como a interface parece e se comporta (gosto, wireframe, polimento, animação, auditoria visual). A **engenharia de front** (RSC, segurança, a11y como piso técnico, Core Web Vitals, SEO técnico, testes) é da `schematize-web`; a fronteira está abaixo.

1. **Onde esta skill divergir da base, a BASE MANDA.** Aqui mora a especialização do domínio ou da
   ferramenta — o como, o padrão, o gate. Divergência de *piso* é defeito desta skill, não variante local.
2. **O que não está repetido aqui é HERDADO, não dispensado.** Esta skill herda os pisos da base e
   os comandos dela cobrem o **domínio**, não o piso geral. Valem integralmente, sem cópia local:
   - **§28 Archive** — `<projeto>/<projeto>_archive/` é **repositório git próprio, PRIVADO e
     obrigatório**, criticidade 0 (`schematize-archive`).
   - **§35 Definition of Done** e a lista de anti-padrões (citada por **título**, nunca por número).
   - **§39 Índice/MAPA** — enumeração exaustiva (uma entrada por unidade chamável, `M == N`) e grafo
     com arestas em ASCII (`A -> B`), nunca a seta unicode.
   - **IAM** (`schematize-engineering` → `references/iam.md`): identidade ≠ email, ≥2 fatores, ReBAC
     multi-tenant, argon2id-only para senha nova, sessão longa e logout irreversível.
   - **Efeito externo** nunca sai de não-produção (`schematize-engineering` →
     `references/efeitos-externos.md`).
   - **Orquestração** (`schematize-engineering` → `references/orquestracao.md` §9): o principal não
     desenvolve (é Claude Opus); executor mais barato que resolve — `haiku`/`sonnet` → Codex Terra → Cursor → `opus` só após falha; visual direto ao Codex; imagem nunca pelo Claude: detecta Codex/Gemini e pergunta ao usuário qual usar (Codex é a sugestão, não automática), nunca API paga.
3. **QA, ops, IAM e índice não têm comando próprio aqui:** vêm da base `/eng-*`. Para trabalho
   contínuo use `/eng-overdev`; para planejar `/eng-plan`; para varrer a base `/eng-scan`; para
   revisão geral `/eng-review` (e `/eng-ops`, `/eng-iam`, `/eng-index`). Os comandos
   `/design-*` cobrem o domínio desta skill; o piso geral é o da base.<!-- /herdado -->

## Fronteiras (o que é de quem)

| Skill | É dela | É desta skill |
|---|---|---|
| `schematize-web` | engenharia de front: fronteira client/server, RSC, segurança no servidor, a11y WCAG 2.2 AA como **piso técnico**, Core Web Vitals, testes, i18n técnico | direção visual, gosto, wireframe, polimento, animação, auditoria visual. O refino visual saiu da web: `schematize-web → references/design-refino.md` é agora um ponteiro para cá, e fica na web só o piso técnico |
| `schematize-seo` | o quê e por quê do SEO; rankear | como a página parece e se comporta. Página que precisa rankear carrega as duas |
| `schematize-models` | **executar** a geração de imagem e mídia, fora do Claude (`schematize-models → /models-image`, `schematize-models → references/midia.md`) | decidir o que a imagem mostra (briefing visual) e a regra de mídia |
| `schematize-qa` | disciplina de teste, regressão visual como gate de CI | a auditoria visual manual e os auditores `scripts/` |
| `schematize-institutional` | inventário e conteúdo legal do site institucional | a aparência dessas páginas |
| `schematize-mobile` | app nativo e cross-platform (HIG e Material nativos) | web (mobile-first, responsivo) |
| `schematize-engineering` | base normativa, archive, DoD, IAM, orquestração | herdado por inteiro |

## Comandos (Claude Code)

Digite `/design-help` para ver todos. Sem argumento, um comando **pergunta; nunca roda sozinho**.

| Comando | O que faz |
|---|---|
| `/design-help` | lista os comandos |
| `/design-load` | carrega à força todo o corpo normativo |
| `/design-wire` | Passo 0 a 3: lê a referência, gera `./wireframe.json` + `./wireframe.svg`, **para** perguntando a stack |
| `/design-build` | Passo 4: constrói de um wireframe aprovado (HTML, Next.js, Liquid) |
| `/design-visual` | passada de revisão visual: DOM em 5 larguras, screenshot, o que dá para melhorar |
| `/design-audit` | Passo 5: contraste, DOM, imagens provisórias, checklist |
| `/design-shape [init\|document\|extract]` | planeja UX e UI antes de construir |
| `/design-critique` | crítica por heurística, tabela Before / After / Why |
| `/design-polish` | passada final de qualidade antes de publicar |
| `/design-tune <bolder\|quieter\|distill\|colorize\|typeset\|layout\|clarify>` | ajuste de um eixo |
| `/design-animate <momento\|delight\|overdrive\|revisar>` | movimento com intenção |
| `/design-harden <estados\|i18n\|onboard\|adapt\|optimize>` | pronto para produção |
| `/design-variants <generate\|live>` | variantes lado a lado |
| `/design-claude` · `/design-handoff` · `/design-cc` | `CLAUDE.md` sempre-on · handoff no archive · handoff + `/compact` |

O método de cada um está em `references/comandos.md`.

## O pipeline (não pule etapas)

```
referência visual  →  wireframe.json  →  wireframe.svg  →  [aprovação]  →  código  →  auditoria
 (imagem, URL, texto, nada)   (fonte da verdade)  (cinza, sem copy)   (pausa)   (HTML|Next|Liquid)  (contraste + DOM)
```

Arquivos saem **no diretório de trabalho atual**, nunca num caminho inventado. O JSON é dado, o SVG é figura:
corrigir "o CTA devia ser secundário" é editar um campo e re-renderizar. O builder lê o JSON, nunca o SVG.

## Como usar

1. **Descubra o modo** (Persuadir, Operar, Ler, Experienciar) e **quanto inventar** (`references/modos-e-fluxo.md`).
   Pergunte só o que muda o trabalho; decida e registre o resto em `meta.suposicoes`.
2. **Leia a reference relevante antes de produzir.** Não trabalhe de memória: escalas, razões de contraste, easings e
   durações estão nos arquivos porque a memória do modelo erra o terceiro decimal, e é nele que o AA reprova.
3. **Sempre** aplique os pisos abaixo e a lista de recusas.
4. Página inteira: wireframe, SVG, **pare e pergunte** (a stack é a **última** pergunta). Só depois, código.
5. Audite (`/design-audit`, `/design-visual`) e entregue com `references/checklist.md`. Uma inspeção, um lote de
   correção, no máximo uma confirmação.

### Mapa de references

| Tema | Reference |
|---|---|
| Filosofia: gosto treinado, detalhes invisíveis, beleza como alavanca, direção de arte | `references/filosofia-e-gosto.md` |
| Os quatro modos, descoberta (passo 0), quanto inventar, fluxo | `references/modos-e-fluxo.md` |
| Piso de qualidade: pisos, verificação no construído, as 13 alavancas de refino | `references/piso-de-qualidade.md` |
| Recusas e anti-AI-slop **unificados**, contraprova, **conflitos entre as fontes resolvidos** | `references/recusas-anti-ai-slop.md` |
| Animação: framework de decisão, um momento autoral, molas, clip-path, desempenho, GSAP | `references/animacao.md` |
| Tokens: tipografia, cor, espaço, profundidade, movimento | `references/tokens-tipografia-cor.md` |
| Contraste: os números medidos, os papéis do acento, o auditor que mente | `references/contraste.md` |
| Componentes HTML + CSS prontos; catálogo e ordem de seções | `references/componentes.md`, `references/secoes.md` |
| Pipeline em detalhe, leitura de referência, contrato do wireframe, construir do zero | `references/pipeline.md`, `leitura-de-imagem.md`, `wireframe-spec.md`, `do-zero.md` |
| Saída: HTML único, Next.js App Router, seção Shopify Liquid | `references/build-html.md`, `build-nextjs.md`, `build-liquid.md` |
| **Regra de mídia**, imagens de banco com licença | `references/imagens.md` |
| Ícones: SVG inline, nunca emoji | `references/icones.md` |
| Revisão: tabela Before / After / Why, notas, severidade | `references/review.md` |
| Método de cada comando | `references/comandos.md` |
| Gate final | `references/checklist.md` |

Assets: `assets/tokens.css` (claro e escuro) · `assets/icones.svg` (sprite de 22 símbolos) ·
`assets/wireframe.schema.json` · `assets/exemplos/` (um wireframe completo e o SVG que ele gera).
Scripts: `render-wireframe.mjs` · `checar-contraste.mjs` · `auditar-dom.mjs` · `buscar-imagens.mjs` ·
`buscar-referencias.mjs` · `detectar-geradores.sh`, cada um com `*.test.sh` (vermelhos plantados).

## Regra de mídia (piso inegociável da casa)

**Imagem gerada, visual gerado e mídia gerada NUNCA saem de um modelo Claude.** Claude é o melhor em código e um mau
gerador de visual: a qualidade do que ele gera é inversamente proporcional à do código que ele escreve, e sai ruim de
verdade. O procedimento:

1. **Detectar:** `bash scripts/detectar-geradores.sh` (lista `codex` e `gemini` no PATH; exit `0` há ao menos um,
   `1` nenhum).
2. **Perguntar** à pessoa qual usar, só entre os que existem, sempre com a saída "nenhum, vou usar banco ou asset".
   Nunca escolher sozinho.
3. **Delegar** a execução à `schematize-models` (`schematize-models → /models-image`). Esta skill escreve o briefing
   visual; ela roda o gerador.
4. **Nenhum disponível:** avisar **sem rodeio** que visual gerado pelo Claude sai ruim e oferecer: instalar Codex ou
   Gemini; banco de imagem com licença comercial (`scripts/buscar-imagens.mjs`); asset do cliente.

**Isto é código, não imagem gerada, e o Claude pode escrever:** SVG de wireframe, SVG de ícone, SVG estrutural
(diagrama, gráfico, padrão geométrico) e CSS. Ilustração figurativa, cena, mascote e "foto desenhada em paths" **não**
valem como "é só SVG": são visual gerado. Detalhe em `references/imagens.md`.

## Pisos inegociáveis (vetam o atalho)

1. **Wireframe aprovado antes de código**, em página inteira. Em ajuste de uma seção existente pode pular, dizendo
   que pula e por quê.
2. **Nenhuma cor entra sem medir contraste**, nos papéis do acento (rótulo em cima, forma contra o fundo, link em
   texto). `#86868b` como texto pequeno reprova AA.
3. **Zero travessão** (`—`, `–`, `--`) em texto de usuário final: copy, `alt`, meta, placeholder.
4. **Um CTA focal por tela.** Cor de acento só no que é clicável.
5. **Nunca copie a referência pixel a pixel:** a imagem informa estrutura, hierarquia e densidade, não copy, cor nem
   marca. **Existindo site-mãe, ele é a referência.**
6. **O briefing manda.** As recusas valem para escolha por omissão; desviar um briefing claro para o seu gosto é falha.
7. **Movimento:** decida se anima (framework de `references/animacao.md` §1); ease-out forte, nunca `ease-in` em UI;
   **um** momento autoral; `prefers-reduced-motion` respeitado com o conteúdo **visível**; só `transform` e `opacity`.
8. **Ícone é SVG com traço consistente, nunca emoji, caractere ou fonte de ícone.** Toque mínimo 44px.
9. **Recusas** (`references/recusas-anti-ai-slop.md`): sem kicker sobre título, sem card dentro de card, sem grid de 3
   cards iguais como estrutura, sem métrica-herói, sem texto em gradiente, sem vidro de enfeite, sem roxo por padrão.
10. **"Menos cara de IA" nunca se resolve refazendo a página inteira:** mude **uma** seção e mostre.
11. **Mídia gerada nunca por modelo Claude** (regra acima).
12. **Comando sem alvo ou sem argumento pergunta; nunca roda sozinho.**
13. **Verificação em rodadas limitadas:** uma inspeção, um lote de correção, no máximo uma confirmação. Achado `[grave]`
    continua bloqueando.
14. <!-- herdado:engineering/orquestracao:curto -->**Orquestrador não desenvolve; subagent barato executa.** O agent principal só planeja, despacha e revisa; ação onerosa vira micro-tasks para o executor mais barato que resolve: `haiku` (mecânico) / `sonnet` (código; falhou → mesmo subagent corrige, até 2 rodadas) → Codex `gpt-5.6-terra` → Cursor → subagent `opus` (motivo) → `park`; **visual vai direto ao Codex**; **imagem nunca pelo Claude: detectar Codex/Gemini e perguntar ao usuário qual usar (Codex é a sugestão), nunca API de imagem paga**; papéis em `agentes.toml`. No overdev, cada item do checklist vai a um subagent e o principal revisa antes do `- [x]`. **Sem frota ociosa:** idle com pendência volta ao trabalho; dependente de outro agent → mata e enfileira com gatilho; terminou → mata (§9.6). Detalhe: `schematize-engineering` → `references/orquestracao.md` §9.<!-- /herdado -->

## Créditos e licenças

Esta skill é MIT (ver `LICENSE`) e **incorpora trabalho de terceiros** sob suas licenças originais:

- **Emil Kowalski**, *emil-design-eng* (github.com/emilkowalski/skills), **MIT**, Copyright (c) 2026 Emil Kowalski:
  filosofia de polimento, framework de decisão de animação, formato de revisão em tabela Before / After / Why.
- **Paul Bakaus**, *Impeccable* v4.4 (impeccable.style), **Apache 2.0**, Copyright 2025 Paul Bakaus: modos, fluxo,
  piso de qualidade, lista de recusas e catálogo de comandos. **Condensado, adaptado e fundido em 2026-10-14.**
- Pipeline de wireframe, tokens, contraste, builds e scripts: trabalho da casa (skill de design anterior da casa, v1.3.1),
  reorganizado e neutralizado.

Textos integrais das licenças e avisos de modificação: `THIRD_PARTY_NOTICES.md` na raiz do repositório (e anexados ao
`LICENSE`).
