# O contrato do `wireframe.json`

Schema formal em `assets/wireframe.schema.json`. Exemplo completo em
`exemplos/lp-franquia.wireframe.json`. Leia este arquivo antes de escrever o primeiro wireframe.

## Por que JSON e não SVG desenhado à mão

O SVG é figura, o JSON é dado.

- Corrigir "o hero está alto demais e o segundo CTA devia ser secundário" é editar dois campos e
  rodar o renderer. Desenhando à mão, é recalcular coordenadas de tudo abaixo.
- O renderer é determinístico: mesmo JSON, mesmo SVG. Um wireframe desenhado à mão muda de
  aparência a cada rodada mesmo sem mudança de decisão, e a pessoa perde o diff visual.
- O **builder lê o JSON, nunca o SVG.** Ele precisa de `layout: "bento"`, `colunas: 3`,
  `peso: 2` — coordenadas de retângulo não carregam isso.
- Coordenada inventada por modelo erra e ninguém percebe. Campo de enum errado o renderer acusa.

## Estrutura

```
{ meta, tokens, secoes[] }
```

### `meta`

| Campo | Obrigatório | Notas |
|---|---|---|
| `projeto` | sim | cliente ou produto |
| `stack` | não | `html` · `nextjs` · `liquid` · `a-definir`. Decide o builder. **Fica `a-definir` até o fim do `/design-wire`**: a stack não muda nada no wireframe, só no build. |
| `origem` | — | caminho da imagem, URL, ou `sem referencia` |
| `pagina` | — | `landing` · `institucional` · `pdp` · `hero` · `secao` |
| `acao` | — | **a única** ação da página. Se vierem duas, pergunte qual é a principal. |
| `tema` | — | `claro` · `escuro` · `ambos` |
| `viewport` | — | largura de referência, default 1440 |
| `suposicoes` | — | array. O que foi inferido e **não** confirmado. |

`suposicoes` não é opcional na prática: se você inferiu qualquer coisa da imagem, declare.
O renderer imprime em laranja no topo do SVG.

### `tokens`

Cores em hex, e três medidas. **Todas passam pelo `checar-contraste.mjs` antes do build** (piso 2).

| Campo | Default | Para quê |
|---|---|---|
| `acento` | `#0071e3` | **preenchimento do botão**, não texto |
| `acentoTexto` | `#0066cc` | **link em texto**. Token separado de propósito. |
| `acentoRotulo` | `#ffffff` | a cor que vai **em cima** do acento |
| `fundo` | `#ffffff` | |
| `superficie` | `#f5f5f7` | faixas alternadas |
| `texto` | `#1d1d1f` | nunca `#000` |
| `textoSec` | `#6e6e73` | **não use `#86868b`**, ver `contraste.md` |
| `borda` | `#d2d2d7` | |
| `raio` | `18` | botão é pílula (`980px`), não este valor |
| `container` | `980` | `688` texto corrido · `980` padrão · `1440` full |
| `fonte` | `system` | `system` = SF via system stack |

Os três tokens de acento existem porque **uma cor não serve aos três papéis**. O azul do próprio sistema de
referência prova: `#0071e3` passa como preenchimento com rótulo branco (4.70) e **reprova como texto**
sobre a faixa `#f5f5f7` (4.31). Em tema escuro o acento é claro, então `acentoRotulo` precisa ser
escuro: rótulo branco sobre `#2997ff` dá 3.02.

`checar-contraste.mjs` testa os três papéis separadamente e diz qual quebrou.

### `secoes[]`

| Campo | Obrigatório | Notas |
|---|---|---|
| `id` | sim | kebab-case. Vira `<section id>` e nome do componente. |
| `layout` | sim | um dos oito. Ver tabela abaixo. |
| `blocos` | sim | array, pode ser vazio só em `divisor` |
| `rotulo` | — | nome legível no SVG. Default: o `id`. |
| `colunas` | — | 1 a 6. Só para `grid` e `bento`. Default 3. |
| `altura` | — | número em px ou `"88vh"`. Omitido = altura do conteúdo. |
| `densidade` | — | `airy` · `normal` · `densa`. Default `normal`. |
| `fundo` | — | `fundo` · `superficie` · `escuro` · `acento` |
| `largura` | — | `texto` (688) · `conteudo` (container) · `full` |
| `nota` | — | instrução ao builder. Sai em laranja no rodapé da seção. |

#### Os oito layouts

| `layout` | Como o renderer trata |
|---|---|
| `centro` | coluna única, blocos centralizados |
| `empilhado` | coluna única, alinhada à esquerda |
| `split` | texto 52% à esquerda, `media` 48% à direita |
| `split-invertido` | o mesmo, espelhado |
| `media-full` | `media` sangra a viewport inteira; os outros blocos ficam centralizados por cima |
| `grid` | N colunas iguais, quebra de linha automática |
| `bento` | N colunas, cada bloco ocupa `peso` colunas |
| `faixa` | uma linha, um bloco por coluna (logos, números, nav) |

### `blocos[]`

| `tipo` | Dimensionado por | Observação |
|---|---|---|
| `nav` | fixo 48px | |
| `eyebrow` | `linhas` | máx 260px de largura. **Só metadado funcional, e exige `nota`** (kicker sobre título é recusa) |
| `h1` `h2` `h3` | `linhas` | `h1` = 62px por linha |
| `sub` `corpo` | `linhas` | |
| `lista` | `itens` | serve para menu, bullets, accordion |
| `cta` | fixo 52px, pílula | **o primário**. Pinta de azul no SVG. |
| `cta-sec` | fixo 52px, pílula | secundário ou link |
| `media` | `formato` (`16:9`, `4:3`, `1:1`, `3:4`, `preencher`) | use `nota` para dizer que imagem é |
| `icone` | fixo 44px | |
| `chip` | fixo 32px | |
| `logo` | fixo 40px | |
| `stat` | fixo 78px | número + rótulo |
| `form` | `itens` = nº de campos | já desenha o botão de envio |
| `divisor` | 1px | |
| `espaco` | 40px | respiro explícito. Use pouco. |
| `card` | soma dos `blocos` internos | container. Aceita `blocos` aninhados e `peso`. |

Campos de bloco: `texto`, `linhas`, `itens`, `formato`, `peso`, `nota`, `blocos`.

## O que o renderer recusa

O script sai com código 1 e não escreve SVG se:

- faltar `meta`, ou `secoes` estiver vazio;
- alguma seção não tiver `id`, `layout` ou `blocos`;
- algum bloco não tiver `tipo`;
- algum `texto` contiver travessão (`—`, `–`, `--`) — **piso 3**;
- houver mais de dois textos distintos em blocos `cta` — **piso 4**, uma ação por página;
- houver `eyebrow` sem `nota` (kicker sobre título é recusa; só metadado funcional, justificado);
- houver `card` dentro de `card` (um nível de card só; card em card é recusa).

O de CTAs é o mais útil. Ele pega a referência mandando em você: se o concorrente tem cinco botões
sólidos e você transcreveu, o renderer avisa antes de a pessoa precisar avisar.

## Como escrever `texto`

Não é a copy final, é a **intenção dela**. `"Headline de beneficio, nao de categoria"` é melhor
wireframe que `"A melhor franquia do Brasil"`, porque comunica a decisão e não compromete a copy.

Copy final entra no build, não no wireframe. E **nunca com travessão** (o renderer recusa).

## Iteração

O ciclo é: A pessoa aponta o problema → você edita o JSON → `node scripts/render-wireframe.mjs` →
mostra o SVG. Nunca reescreva o JSON inteiro para um ajuste; edite os campos.

Mantenha o `wireframe.json` ao lado do código depois do build. Quando a página mudar de verdade
seis meses depois, ele é o que explica por que a seção 4 tem três colunas.
