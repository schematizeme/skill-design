# O pipeline em detalhe

```
referência visual  →  wireframe.json  →  wireframe.svg  →  [aprovação]  →  código  →  auditoria
```

## Onde tudo sai

**No diretório de trabalho atual.** `./wireframe.json`, `./wireframe.svg`, e depois o código.

Nunca invente um caminho de projeto, nunca escreva no scratchpad, nunca crie subpasta sem a pessoa pedir. Ela
está nesse diretório: arquivo fora do campo de visão é iteração que não acontece.

Diretório dentro de `Downloads`? Avise em uma linha e escreva lá mesmo. A regra de que skill não mora em
`Downloads` vale para onde a **skill** vive, não para a saída de um trabalho.

## Passo 1 · Ler

Entrada: imagem, URL, descrição em texto, ou nada.
Saída: `wireframe.json`.

Método completo em `leitura-de-imagem.md`. Resumo: conte as seções, classifique o layout de cada
uma em um dos oito, meça a densidade, identifique a hierarquia (não os px), ache a ação única,
separe media de decoração, **declare o que você inventou em `meta.suposicoes`**.

Antes disso, o **Passo 0 · Descoberta** de `references/modos-e-fluxo.md`. Sem stack e sem ação definidas, não comece.

### Se não houver referência

**Leia `do-zero.md` antes de qualquer coisa.** Sem referência o modelo cai no mediano do treino, e
é de lá que saem o gradiente roxo, os três cards idênticos e a headline centralizada.

Resumo: busque referência real (`buscar-referencias.mjs` puxa One Page Love e Minimal Gallery),
**escreva a direção** em `meta.direcao` antes de desenhar (sensação, aposta e sobretudo o campo
`proibido`), e escolha a estrutura pelo que a página faz. O resto do pipeline é idêntico.

## Passo 2 · Renderizar

```bash
node scripts/render-wireframe.mjs wireframe.json wireframe.svg
```

O renderer **recusa** wireframe inválido (ver `wireframe-spec.md`). Se ele reclamar de travessão ou
de CTAs demais, o problema é o wireframe, não o script: conserte o JSON.

Saída: `ok wireframe.svg · 8 secoes, 28 blocos`.

## Passo 3 · Aprovar, e só então perguntar a stack

**Mostre o SVG e pare.** Não continue para o código na mesma mensagem.

Diga o que a pessoa precisa olhar: a ordem das seções, as suposições em laranja no topo, qualquer
decisão que você tomou contra a referência (seção cortada, CTA rebaixado), e **o que o SVG não
representa** e ficou só na `nota` (posição absoluta, hotspot, overlay).

Termine perguntando, com `AskUserQuestion`:

> Posso montar a página? Em qual stack?

Opções: HTML único · Next.js App Router · seção Shopify Liquid · **ainda não, quero ajustar**.

A última opção é obrigatória. Sem ela a pergunta força um aceite que ele pode não querer dar.

**A stack é a última pergunta, não a primeira.** Ela não muda uma vírgula do wireframe, só o build.
Perguntar no Passo 0 é pedir decisão antes de a pessoa ter visto qualquer coisa. Até aqui,
`meta.stack` fica `"a-definir"`.

O ciclo de correção é: ele aponta → você edita **os campos** → re-renderiza → mostra.
Nunca reescreva o JSON inteiro para um ajuste.

### Quando pular a aprovação
Só em ajuste de uma seção já existente. Diga que está pulando e por quê. Em página inteira, nunca.

## Passo 3.5 · Imagens de preview (opcional, mas quase sempre vale)

```bash
node scripts/buscar-imagens.mjs wireframe.json --baixar
```

Preenche os blocos `media` com foto real de **banco com licença comercial**, para a pessoa ver a página respirando.
Isto é banco de imagem, não geração: imagem **gerada** nunca sai de modelo Claude e segue a regra de mídia do
`SKILL.md` (detectar `codex` e `gemini`, perguntar qual usar, delegar à `schematize-models`).

**Leia `imagens.md` antes.** Dois pontos não opcionais: o caminho sem chave de API é legalmente
impecável e esteticamente ruim (acervo de arquivo, preto e branco, século 19), e o campo `busca`
exige o **substantivo principal na frente**, senão o encurtamento do termo entrega assunto errado.

Toda imagem entra com `data-provisorio`. **Ela não vai ao ar.**

O ganho real não é estético: é poder medir **texto sobre foto** com a foto de verdade. Scrim e
contraste sobre imagem são a reprovação mais comum da casa, e `checar-contraste.mjs` não pega,
porque o fundo é uma imagem e não um token.

## Passo 4 · Construir

O builder lê o **`wireframe.json`**, nunca o SVG. Escolha a reference pela `meta.stack`:

| `stack` | Reference |
|---|---|
| `html` | `build-html.md` |
| `nextjs` | `build-nextjs.md` |
| `liquid` | `build-liquid.md` |

Antes de escrever a primeira linha, leia `tokens-tipografia-cor.md` e `recusas-anti-ai-slop.md`. Durante, consulte
`componentes.md` e `secoes.md` (que lista o que já existe antes de reconstruir).

**Cada `secao.id` vira um `<section id>` e um componente com o mesmo nome.** Isso é o que faz o
wireframe continuar servindo seis meses depois.

## Passo 5 · Auditar

```bash
node scripts/checar-contraste.mjs wireframe.json
node scripts/auditar-dom.mjs index.html
```

`checar-contraste.mjs` mede a **paleta**. `auditar-dom.mjs` mede a **página renderizada** em cinco
larguras: overflow horizontal, alvo de toque, ícone que é caractere, texto claro sobre imagem sem
scrim, imagem quebrada e sem dimensão. **Grave é bloqueio**, não ressalva na entrega.

Depois, o checklist de `checklist.md`, e a passada visual de `/design-visual`: os dois scripts
acham defeito medível, **não acham feiura**. Tire screenshot em duas larguras e olhe.

Se a página vai para produção e precisa rankear, **carregue a `schematize-seo`** e rode o gate dela.

Para página em produção com estado interativo e tema escuro, nem o `auditar-dom.mjs` basta: rode o
auditor de DOM com Playwright, com as cinco correções de `contraste.md`, e o teste de mutação.

## Quando uma etapa falha

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| renderer recusa por travessão | copy com `—` | trocar por `.` `,` `:` ou `·` |
| renderer recusa por CTAs demais | transcreveu a referência | escolher a ação e rebaixar o resto |
| SVG com seção gigante vazia | `altura` herdada da referência | tirar `altura`, deixar o conteúdo mandar |
| SVG com tudo do mesmo tamanho | densidade não foi medida | reler o passo 3 de `leitura-de-imagem.md` |
| A pessoa diz que ficou genérico | densidade `normal` em tudo, raio uniforme | variar densidade e raio por tipo |
| renderer recusa `eyebrow` sem `nota` | kicker sobre título | apagar o eyebrow; só metadado funcional, com `nota` |
| renderer recusa card dentro de card | estrutura aninhada | achatar; um nível de card |
| contraste reprova no acento | cor de marca em dois papéis | escurecer um degrau, ver `contraste.md` |
