# Piso de qualidade

Leia antes de qualquer edição de UI. Três blocos: os pisos que travam a entrega, a verificação no resultado
construído, e as 13 alavancas de refino com números. Os números são **defaults** (ponto de partida sensato), não
dogma: ajuste com intenção, não "no olho".

## A. Pisos que travam (sem exceção sem registro)

1. **Wireframe aprovado antes de código** em página inteira. Ajuste de uma seção existente pode pular, dizendo que
   pula e por quê.
2. **Nenhuma cor entra sem medir contraste**, nos dois papéis do acento (`references/contraste.md`).
3. **Zero travessão** (`—`, `–`, `--`) em texto voltado ao usuário final: copy, `alt`, meta, placeholder. Use ponto,
   vírgula, dois-pontos ou o bullet `·`. Faixa numérica escreve-se "2020 a 2024".
4. **Um CTA focal por tela.** Cor de acento só no que é clicável.
5. **Nunca copie a referência pixel a pixel.** A imagem informa estrutura, hierarquia e densidade, não copy, cor nem
   marca.
6. **`prefers-reduced-motion` sempre respeitado**, e o conteúdo fica visível nesse ramo. Alvo de toque mínimo 44px.
7. **Não resolva "cara de IA" refazendo a página inteira.** Mude uma seção e mostre.
8. **Ícone é SVG desenhado com traço consistente, nunca emoji, caractere unicode ou fonte de ícone.**
9. **Mídia gerada nunca por modelo Claude** (regra de mídia do `SKILL.md`).
10. **O briefing manda.** As recusas valem para escolhas por omissão, não contra uma decisão explícita do cliente.

## B. Verifique no resultado construído

Verifique o que foi construído (renderizado), não o que foi planejado.

- **Contraste.** Texto normal 4.5:1, texto grande 3:1, componente 3:1. Em superfícies coloridas, tinja o texto
  secundário com o matiz da superfície; **nunca cinza** sobre fundo colorido.
- **Profundidade.** Sombras com deslocamento (`y` positivo) e desfoque suave. Halo colorido sem deslocamento é
  enfeite. Separação estática se faz com hairline de 1px; sombra de verdade é para elevação real (popover, modal,
  arrasto, hover de elevação).
- **Espaçamento.** Grupos apertados, separação generosa, **mais espaço acima do título que abaixo** (o título
  pertence ao conteúdo que apresenta, não à seção anterior).
- **Tipo.** Medida de 65 a 75 caracteres no corpo. Display até 6rem (96px). Tracking mínimo -0.04em. Títulos
  balanceados (`text-wrap: balance`). Degraus claros de tamanho e de peso.
- **Movimento.** Um momento autoral, não efeitos espalhados. Ease-out forte partindo de um estado já legível
  (`references/animacao.md`).
- **Estados.** Hover, ativo, desabilitado, carregando, erro, vazio, foco de teclado e conteúdo real (nome longo,
  texto traduzido, zero itens, mil itens).
- **Superfícies do navegador.** `::selection`, cursor, scrollbar, anel de foco, sublinhado de link e numerais
  tabulares também levam a paleta do produto.
- **Copy.** A linguagem do próprio produto. Botão diz a ação. Erro diz o problema e a saída. Nada de promessa
  genérica de marketing.
- **Cobertura.** Todo requisito do briefing está presente e encontrável em segundos.

Com tudo verde, gaste a página no mundo escolhido.

## C. As 13 alavancas de refino

Quando um front "sai feio" mesmo com tokens no lugar, quase sempre é uma destas.

### 1. Espaçamento generoso e assimétrico
- **Falha:** tudo com o mesmo respiro apertado; seções coladas; padding uniforme. Parece planilha.
- **Correção:** mais espaço **entre** grupos que **dentro** deles (lei de proximidade). Entre seções maiores
  96 a 160px (desktop) e 64 a 96px (mobile); dentro de um bloco 24 a 48px. Espaço em branco é o design: na dúvida,
  dobre. Escala de 4/8: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160`.
- **Piso:** nada de padding ou gap fora da escala; hero e seções com respiro vertical de pelo menos 96px no
  desktop. Densidade uniforme em todas as seções é um defeito: varie (`airy`, `normal`, `densa`).

### 2. Hierarquia com saltos grandes
- **Falha:** h1 24px, h2 20px, corpo 16px. Nada domina.
- **Correção:** hero ou display 48 a 72px (até o teto de 96px), título de seção 32 a 40px, corpo 16 a 18px, razão
  modular 1.25 a 1.333. Peso e cor também carregam hierarquia. De-enfatize por **contraste** (cinza `--texto-sec`,
  cerca de 60 a 70% do texto principal), não só por tamanho: encolher tudo destrói a hierarquia.

### 3. Neutros fazem 90%, um acento com avareza
- **Falha:** acento em tudo, ou cinco cores competindo.
- **Correção:** rampa de neutros + **um** acento. O acento marca a UMA ação da tela. Segunda cor só para semântica
  (perigo, sucesso, aviso). Neutros com leve tint do matiz do acento em vez de cinza morto; texto em off-black
  sobre off-white (nunca `#000` sobre `#fff` puros).

### 4. Elevação: hairline ou sombra em camadas
- **Falha:** card sem separação; ou `box-shadow` dura e suja; ou borda de 1px escura e grossa.
- **Correção:** escolha **um** caminho por superfície. Hairline: borda de baixo contraste
  (`rgba(0,0,0,.06 a .1)` no claro, `rgba(255,255,255,.08)` no escuro). Ou sombra realista em camadas de baixa
  opacidade com deslocamento: `0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.05)`.
  Quanto mais alto o elemento, maior e mais difusa a sombra (coerência de fonte de luz). No escuro a sombra quase
  não aparece: separe por superfície mais clara e borda.

### 5. Comprimento de linha e largura
- **Correção:** corpo com 65 a 75 caracteres (`max-width: 65ch` a `70ch`). Container de página com `max-width`
  (1120 a 1280px) e margens laterais de pelo menos 24px no mobile. Conteúdo denso (docs, blog) mais estreito.

### 6. Grade e alinhamento
- **Correção:** tudo numa grade, `gap` da escala. Alinhe pela borda: alinhado à esquerda vence centralizado em bloco
  de texto longo (centralize só 1 a 2 linhas). Alinhamento ótico vale mais que o matemático em ícone + texto.
  **Uma** quebra de grade deliberada (foto que sangra, número que invade a margem) muda a página inteira; grade
  perfeita em tudo lê como gerado.

### 7. Tipografia com craft
- **Correção:** entrelinha por tamanho (display 1.05 a 1.2, corpo 1.5 a 1.7). Tracking levemente negativo em títulos
  grandes (-0.01 a -0.03em, nunca abaixo de -0.04em). Rótulo funcional pequeno em caixa alta (cabeçalho de tabela,
  legenda de formulário, badge): 12 a 13px, peso 600, tracking +0.03 a +0.08em; nunca como "kicker" sobre um
  título. `font-variant-numeric: tabular-nums` em preços, tabelas e dados. Fonte real servida de forma
  self-hosted (`font-display: swap`, sem salto de layout). Uma família, duas no máximo.

### 8. Raio de canto: escala e aninhamento
- **Correção:** escala pequena (`4/8/12/16` + pílula). Raio externo maior que o interno quando aninha
  (`raio_interno = raio_externo - padding`) para cantos concêntricos. Raio **não** uniforme em tudo: botão pílula,
  card não. Consistência de raio é consistência de personalidade.

### 9. Estados e affordance
- **Correção:** todo elemento interativo tem os quatro estados desenhados: hover, `focus-visible`, active, disabled,
  com transição de 120 a 200ms. O CTA primário domina (só ele preenchido com o acento); o secundário é contorno ou
  fantasma. Foco **sempre visível** (anel com offset, contraste em claro e escuro). Hover só atrás de
  `@media (hover: hover) and (pointer: fine)`. `:active` com `scale(.97)` dá tato.

### 10. Imagens e mídia com tratamento
- **Correção:** `aspect-ratio` consistente com `object-fit: cover`, raio do sistema, às vezes hairline. Dimensão
  declarada (zero salto de layout). Screenshot e ilustração com moldura consistente. Sem foto de banco genérica
  ("equipe diversa olhando laptop"): foto crua e real ou caixa honesta marcada como provisória.

### 11. Fundos com profundidade sutil, sem gimmick
- **Correção:** alterne `--superficie` e `--fundo` entre seções (diferença mínima) ou use hairline divisória.
  Profundidade discreta: gradiente monocromático muito suave, grão leve. **Sem halo radial atrás do conteúdo e sem
  mesh colorido**: são marcadores de IA. Regra: se o efeito chama atenção para si, exagerou.

### 12. Movimento com propósito, curto
- **Correção:** movimento serve continuidade e feedback. Entradas de 150 a 250ms em ease-out forte; hover e press
  mais curtos. Só `transform` e `opacity`. Stagger sutil de 30 a 80ms. Reveal on-scroll discreto (8 a 16px de subida
  em UI, até 24px em marketing). Detalhe completo em `references/animacao.md`.

### 13. Vazio, carregando, erro desenhados + detalhes finais
- **Correção:** estado vazio com ícone do set, título curto, uma linha de copy e **uma** ação. Carregando é
  esqueleto com a forma real do conteúdo (não spinner genérico). Erro com ícone, mensagem humana e nova tentativa.
  Os detalhes que ninguém faz e todo mundo sente: `::selection` tematizada, scrollbar discreta, `caret-color` no
  acento, favicon e imagem OG caprichados, paridade total no escuro, `scroll-margin-top` para âncoras não colarem no
  header fixo.

## D. Regra de bolso

Quase todo "front feio" é: **falta de espaço, hierarquia tímida, acento espalhado ou ícone mal resolvido**. Corrija
esses quatro antes de procurar efeito novo. Acabamento que estoura Core Web Vitals não é sofisticação, é regressão:
o orçamento de performance é da `schematize-web` (`schematize-web → references/performance.md`).
