---
description: schematize-design — lê a referência visual e gera ./wireframe.json + ./wireframe.svg no diretório atual, e PARA perguntando a stack
argument-hint: "[imagem, URL ou briefing]"
---
> `<skill>` = `.claude/skills/schematize-design` (instalação no projeto) ou `~/.claude/skills/schematize-design` (global).

Você está executando o **Passo 0 ao 3** do pipeline da `schematize-design`. Leia `references/modos-e-fluxo.md`,
`references/leitura-de-imagem.md` e `references/wireframe-spec.md` antes de produzir. Sem entrada, **pergunte** o que
fazer; não adivinhe.

Entrada: $ARGUMENTS

**Onde escrever:** no diretório de trabalho atual (`./wireframe.json`, `./wireframe.svg`). Não invente caminho, não
use o scratchpad, não crie subpasta. Já existe `wireframe.json`? **Leia antes**: é iteração, edite os campos. Mais de
uma página no diretório: use sufixo (`wireframe-home.json`).

1. **Passo 0, descoberta.** Pergunte **de uma vez**, só o que muda o trabalho: tipo de página (e o **modo**), a ação
   única, existência de site-mãe e marca, tema, movimento. O que ninguém sabe responder, decida e registre em
   `meta.suposicoes`. **Não pergunte a stack agora.**
2. **Site-mãe é a referência**, não um estilo genérico. Extraia dele fonte, raio, menu, paleta e ícones
   (`scripts/buscar-referencias.mjs --extrair=<url>`).
3. **Leia a referência** pelo roteiro de `leitura-de-imagem.md` (seções, layout, densidade, hierarquia, ação única,
   media vs decoração). Sem referência, leia `do-zero.md` e escreva `meta.direcao`.
4. **Escreva `./wireframe.json`** conforme `wireframe-spec.md`; `meta.stack` fica `"a-definir"`.
5. **Renderize** (`node <skill>/scripts/render-wireframe.mjs wireframe.json wireframe.svg`). Se recusar, o problema é
   o JSON: o renderer só recusa violação de piso (travessão, CTAs demais, eyebrow sem nota, card em card).
6. **Audite a paleta** (`node <skill>/scripts/checar-contraste.mjs wireframe.json`).
7. **PARE e mostre**: caminho dos dois arquivos, o que olhar, **toda decisão tomada contra a referência**, qualquer cor
   que reprovou e o substituto, e o que o SVG não representa. **Termine com `AskUserQuestion`:** "Posso montar a
   página? Em qual stack?", opções **HTML único autocontido** · **Next.js App Router** · **seção Shopify Liquid** ·
   **ainda não, quero ajustar o wireframe** (a última é obrigatória).

Não escreva código nesta mensagem. O build é o `/design-build`, depois da resposta. Imagem para os blocos `media`
segue a regra de mídia do `SKILL.md`.
