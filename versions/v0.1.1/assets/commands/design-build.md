---
description: schematize-design — constrói a página a partir de um wireframe.json já aprovado (HTML único, Next.js ou Shopify Liquid)
argument-hint: "[caminho do wireframe.json]"
---
> `<skill>` = `.claude/skills/schematize-design` (instalação no projeto) ou `~/.claude/skills/schematize-design` (global).

Você está executando o **Passo 4** do pipeline da `schematize-design`.

Entrada: $ARGUMENTS

**Onde escrever:** no diretório de trabalho atual, ao lado do `wireframe.json`. `html` sai como `./index.html`;
`nextjs` monta `./app`, `./components`, `./styles`; `liquid` sai em `./sections/<secao-id>.liquid`.

1. Localize o `wireframe.json` no diretório atual. Não existe? Rode `/design-wire` primeiro: **não construa sem
   wireframe aprovado** (piso 1). `meta.stack` em `"a-definir"`: pergunte a stack e **grave no arquivo**.
2. Leia `references/tokens-tipografia-cor.md`, `references/recusas-anti-ai-slop.md` e `references/icones.md`. Se
   `meta.movimento` for `narrativo`, leia `references/animacao.md`. Sem referência visual, leia `references/do-zero.md`
   antes de qualquer coisa.
3. Leia a reference da stack: `html` → `build-html.md` · `nextjs` → `build-nextjs.md` · `liquid` → `build-liquid.md`.
4. Consulte `references/secoes.md` antes de construir uma seção: reconstruir o que já existe é o desperdício mais
   comum.
5. **Imagens.** Imagem **gerada** nunca por modelo Claude: rode `bash <skill>/scripts/detectar-geradores.sh`,
   **pergunte** qual usar e delegue à `schematize-models` (`/models-image`); nenhum gerador, avise sem rodeio e
   ofereça instalar Codex/Gemini, banco com licença comercial (`scripts/buscar-imagens.mjs --baixar`) ou asset do
   cliente. Toda imagem de preview entra com `data-provisorio`.

Construa: o builder lê o **JSON**, nunca o SVG. Um `<section id>` por `secao.id`, na mesma ordem; `densidade` vira o
padding (`airy` 120 · `normal` 88 · `densa` 56); `peso` vira `grid-column: span N`; `nota` é instrução sua, não copy.
**Nenhum travessão.** Parta de `assets/tokens.css` com as cores de `tokens` do wireframe.

Antes de entregar: `node <skill>/scripts/checar-contraste.mjs wireframe.json` e o `references/checklist.md` inteiro.
Item que falha volta para o build. Deixe o `wireframe.json` ao lado do código, refletindo o que foi construído.
