# Ler uma referência visual

O que fazer quando a pessoa manda uma imagem: screenshot de concorrente, print do site atual,
mockup do Figma, foto de um rascunho em papel, ou um criativo de campanha.

## A regra que governa tudo

**A imagem informa estrutura, hierarquia e densidade. Ela não informa copy, cor nem marca.**

Copiar pixel a pixel é errado por três motivos, e o terceiro é o que importa:

1. Layout de concorrente é trabalho de outra pessoa, e recriá-lo é risco.
2. O resultado fica pior que o original: você reproduz as decisões sem o contexto que as motivou.
3. **Você copia junto os defeitos.** Contraste reprovado, hero de 1200px de altura, três CTAs
   competindo. A referência raramente é boa; ela é só o que existe.

O que se extrai é o **esqueleto**. O que se decide é tudo o resto.

## Roteiro de leitura

Percorra nesta ordem e escreva as respostas no `wireframe.json`. Não pule para o layout.

### 1. Conte as seções
Quantas faixas horizontais distintas? Uma seção começa onde o fundo, a largura de conteúdo ou o
ritmo muda. Cinco a nove é o normal de uma landing. Mais de doze, a página está acumulando.

### 2. Para cada seção, identifique o layout
Encaixe num dos oito do spec, sem inventar um nono:

| O que você vê | `layout` |
|---|---|
| Tudo centralizado numa coluna estreita | `centro` |
| Texto de um lado, imagem do outro | `split` ou `split-invertido` |
| Imagem ocupando a largura toda, texto por cima | `media-full` |
| Cards iguais em linha | `grid` |
| Cards de tamanhos diferentes | `bento` |
| Uma linha de logos, números ou ícones | `faixa` |
| Coluna alinhada à esquerda | `empilhado` |

Se não encaixa, provavelmente são **duas** seções coladas.

### 3. Para cada seção, meça a densidade
Olhe o espaço vertical entre o último elemento de uma seção e o primeiro da seguinte,
comparado com a altura de uma linha de texto:

- vazio maior que ~4 linhas → `airy`
- ~2 a 4 linhas → `normal`
- menos de 2 → `densa`

Densidade errada é o erro mais visível de um wireframe. Ela é o que faz uma página "parecer" um site de
produto bem resolvido ou "parecer" template, mais que qualquer cor.

### 4. Identifique a hierarquia, não os tamanhos
Não meça px na imagem. Classifique: qual é o **maior texto da seção**? Ele é `h1` se for o da
página, `h2` se for de seção. O que vem logo abaixo e é menor é `sub`. Um rótulo pequeno acima do título na
referência (kicker) **não se transcreve**: é recusa. Só entra como `eyebrow` se for metadado funcional que o título
não pode carregar, e então com `nota` dizendo qual.

Se dois textos têm o mesmo peso visual na mesma seção, **um deles está errado na referência**.
Escolha um e rebaixe o outro. Anote em `nota`.

### 5. Ache a ação
Qual é o botão de cor sólida? Esse é o `cta`. Todo o resto vira `cta-sec`.

Se a referência tem três botões sólidos diferentes, ela não tem foco. Escolha o que serve à
`meta.acao` e rebaixe os outros. O renderer reclama se houver mais de dois textos de CTA primário
distintos, porque isso quase sempre é a referência mandando em você.

### 6. Marque o que é foto e o que é decoração
`media` é conteúdo: produto, pessoa, obra, tela do sistema. Blob, gradiente de fundo e forma
abstrata **não são media**, são fundo. Vão em `secao.fundo` ou em `nota`, nunca como bloco.

Se a imagem de referência usa stock genérico ("equipe diversa olhando laptop"), escreva na `nota`
do bloco: `substituir por foto real`. Isso está no anti-manual por um motivo.

### 7. Declare o que você inventou
Tudo que você inferiu e não tem como confirmar vai em `meta.suposicoes`. Número, nome de produto,
preço, quantidade de itens de um menu que estava cortado na imagem.

O renderer imprime as suposições em laranja no topo do SVG. É para a pessoa bater o olho e corrigir
antes de virar código. **Suposição não declarada vira fato errado no site.**

## Quando a referência é o site do próprio cliente

Caso diferente e mais importante. Se existe site-mãe, **ele manda, não um estilo de referência genérico**.

Caso registrado: numa LP de cliente, "menos cara de IA" foi resolvido copiando o UI system do
site principal do próprio cliente (menu, fonte, botões, ícones), não aplicando um estilo anti-IA genérico.

Extraia dele, nesta ordem: família tipográfica e pesos · raio de botão · altura e comportamento do
menu · paleta real (conta-gotas, não o que o cliente diz que é) · biblioteca de ícones · largura de
container. Isso vai em `tokens`, e o `nota` da seção diz de onde veio.

## Quando não há imagem nenhuma

O pipeline é o mesmo. Você monta o `wireframe.json` a partir do Passo 0 e da ordem recomendada em
`secoes.md`, e o SVG serve para a pessoa dizer "tira a faixa de números" antes de existir código.

O wireframe não depende da imagem. A imagem é só uma das entradas possíveis.

## Erros que se repetem

- **Transcrever a imagem em vez de destilar.** Se o seu wireframe tem o mesmo número de blocos que
  a referência tem elementos, você transcreveu.
- **Herdar a altura do hero.** Referências de agência adoram hero de tela cheia com pouco conteúdo.
  Use `altura` só quando o vazio for intencional.
- **Copiar copy da imagem como se fosse decidida.** Copy de referência é *placeholder de intenção*.
  Escreva no `texto` o que a frase precisa fazer, não a frase do concorrente.
- **Ler cor de screenshot comprimido.** JPEG mente em cor chapada. Se precisar da cor exata, peça o
  hex ou o arquivo original; não tire do pixel.
