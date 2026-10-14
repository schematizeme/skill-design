# Ícones

**Regra única: ícone é SVG inline.** Nunca caractere, nunca emoji, nunca fonte de ícone.

Sprite pronto em `assets/icones.svg`, com 22 símbolos. `scripts/auditar-dom.mjs` acusa
`ICONE-GLIFO` em qualquer elemento que use caractere como ícone.

## Por que caractere não serve

Um `☎` `★` `▶` `⚙` `↗` parece resolver e quebra de quatro jeitos:

| Problema | O que acontece |
|---|---|
| **Muda de desenho por plataforma** | no Windows sai monocromático fino, no iOS vira emoji colorido, no Android é outro desenho |
| **Muda de largura** | a caixa do botão dança entre sistemas, e o alinhamento que você ajustou no seu monitor quebra no do cliente |
| **Não herda cor de forma confiável** | emoji com apresentação colorida ignora `color` |
| **Leitor de tela lê o nome Unicode** | `▶` vira "triângulo preto apontando para a direita" no meio da frase |

E tem o quinto, que é da casa: **emoji como ícone está no anti-manual como marcador de IA**
(`recusas-anti-ai-slop.md`). Isso apareceu numa página real construída por esta skill: 12 ícones em
caractere, pegos só quando o auditor de DOM passou a existir.

## Por que fonte de ícone também não

Font Awesome, Material Icons e afins falham antes do CSS carregar e mostram **quadrado vazio**
(o flash of unstyled icon). São uma requisição de rede a mais, pesam dezenas de KB para usar seis
símbolos, e leitor de tela lê a letra que está por trás do glifo.

## O padrão

Cole o sprite inteiro logo depois de `<body>`, uma vez:

```html
<body>
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol id="i-seta" viewBox="0 0 24 24" ...>...</symbol>
  ...
</svg>
```

Use assim:

```html
<a class="btn" href="#form">
  Quero um orçamento
  <svg class="i" aria-hidden="true"><use href="#i-seta"></use></svg>
</a>
```

```css
.i{width:1em;height:1em;flex:none;display:inline-block;vertical-align:-.125em}
```

- **`width:1em`**, não px: o ícone acompanha o tamanho do texto ao lado, em qualquer breakpoint.
- **`flex:none`**: dentro de um flex container o SVG encolhe e vira um risco. Este é o bug de
  ícone mais comum, e some com uma palavra.
- **`vertical-align:-.125em`** alinha ao baseline do texto. Sem isso o ícone flutua.
- Os símbolos usam `stroke="currentColor"`, então **mudam de cor sozinhos** com `color`.

## Acessibilidade

| Caso | O que fazer |
|---|---|
| Ícone ao lado de texto que já diz tudo | `aria-hidden="true"` no `<svg>` |
| Ícone sozinho num botão | `aria-label` no **botão**, `aria-hidden` no `<svg>` |
| Ícone que carrega informação (status, alerta) | `role="img"` + `<title>` dentro do `<svg>` |

```html
<button class="so-icone" aria-label="Fechar menu">
  <svg class="i" aria-hidden="true"><use href="#i-fechar"></use></svg>
</button>
```

Botão só de ícone precisa de `min-width:44px;min-height:44px`, senão o auditor acusa `ALVO`.

## O que tem no sprite

**Navegação** `i-seta` (diagonal, o do CTA) · `i-seta-direita` · `i-seta-esquerda` ·
`i-seta-baixo` · `i-menu` · `i-fechar` · `i-mais` · `i-menos`

**Contato** `i-telefone` · `i-email` · `i-local` · `i-whatsapp` · `i-instagram` · `i-linkedin`

**Confiança** `i-check` · `i-escudo` · `i-estrela` · `i-relogio` · `i-calendario`

**Genéricos** `i-play` · `i-engrenagem` · `i-folha` · `i-gota` · `i-raio`

Faltou um? Desenhe em `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`,
`stroke-width="1.75"`, pontas e junções arredondadas. Traço uniforme é o que faz um conjunto
parecer um conjunto.

## Biblioteca de ícones: depende do modo

- **Operar (app, painel, admin):** um icon set consistente (Lucide, Phosphor, Tabler, Radix Icons) é correto. Um só
  por projeto, mesmo `stroke-width` e mesma grade (20 ou 24px), SVG inline ou sprite com `currentColor`. Misturar
  famílias, ou famílias com emoji, é o defeito amador número um depois do espaçamento.
- **Persuadir e Experienciar (página de marca):** ícone de biblioteca **cru** é marcador de IA, e o motivo é
  saturação, não qualidade: são os defaults de todo template. Use a biblioteca como **base para desenhar**, adapte
  (traço, cantos, proporção) até ter assinatura, ou use o sprite desta skill.
- **Nunca emoji**, em modo nenhum, a menos que a pessoa peça (seletor de reação, conteúdo gerado por usuário).
- Se o cliente tem site-mãe, **extraia os ícones dele**. É a mesma regra da contraprova: quando o comp existe, ele
  manda.
- Ícone é SVG **escrito como código** (path). Isso é permitido; ilustração figurativa não é "ícone" e segue a regra
  de mídia (`references/imagens.md`).

## Peso

O sprite inteiro tem menos de 6 KB e não gera requisição. Se a página usa seis símbolos, apague os
outros dezesseis: eles só existem para você escolher.
