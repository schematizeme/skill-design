# Checklist: gate antes de entregar

Rode inteiro. Item que falha volta para o build, não vira ressalva na mensagem de entrega. Uma rodada de inspeção, um
lote de correção, no máximo uma confirmação (`references/review.md` §6).

## Direção e wireframe

- [ ] o modo (Persuadir, Operar, Ler, Experienciar) foi identificado e registrado
- [ ] `meta.acao` preenchida, e é **uma** ação
- [ ] `meta.suposicoes` lista tudo que foi inferido e não confirmado
- [ ] sem referência visual: `meta.direcao` escrita (sensação, referência, aposta, proibido) antes de desenhar
- [ ] o SVG foi mostrado e aprovado antes do código (ou a exceção de ajuste de seção foi declarada)
- [ ] o `wireframe.json` final está ao lado do código, refletindo o que foi construído

## Estrutura

- [ ] um `<section id>` por seção do wireframe, na mesma ordem, com o `id` do wireframe
- [ ] um `<h1>` por página, e ele é o da promessa; hierarquia de heading sem pular nível
- [ ] nenhuma seção repete o argumento de outra; até nove seções
- [ ] sem kicker (eyebrow) sobre título; sem card dentro de card

## Cor

- [ ] `node scripts/checar-contraste.mjs wireframe.json` passa (e o `tokens.css` do projeto)
- [ ] o acento foi testado nos **papéis**: rótulo em cima, forma contra o fundo, link em texto
- [ ] `:hover`, `:focus` e desabilitado dos controles principais foram medidos
- [ ] nenhum texto usa opacidade em utilitário (`/85`, `/70`)
- [ ] texto sobre imagem ou degradê tem scrim, e o scrim é o menor que passa; medido com a foto real
- [ ] se há tema escuro, os dois foram medidos (com 400ms de espera após a troca)
- [ ] `#86868b` não aparece como texto pequeno em fundo claro
- [ ] superfície colorida: texto secundário tingido com o matiz dela, nunca cinza

## Tipografia

- [ ] a voz tipográfica foi uma **decisão** (pilha de sistema por motivo registrado, ou fonte escolhida e licenciada)
- [ ] SF Pro não é servida por `@font-face`
- [ ] display no máximo 96px, tracking nunca abaixo de -0.04em; corpo em degraus, tracking `0`
- [ ] títulos em 600, não 700 em tudo; `text-wrap: balance` nos títulos
- [ ] medida de linha de 65 a 75 caracteres no corpo
- [ ] monoespaçada só em código, dado, ID, terminal e numeral tabular
- [ ] **nenhum travessão** (`—`, `–`, `--`) em texto de usuário final

## Espaço e profundidade

- [ ] padding de seção em `clamp(64px, 8vw, 120px)` ou maior, variando com a densidade do wireframe
- [ ] mais espaço acima do título que abaixo
- [ ] raio **não** uniforme: botão pílula (`980px`), card não; raio aninhado correto
- [ ] separação estática por hairline; sombra só em elevação real, com deslocamento; sem halo
- [ ] vidro só onde há conteúdo passando por baixo (nav fixa)

## Movimento

- [ ] o framework de decisão (`references/animacao.md` §1) foi aplicado; nada animado em ação de teclado
- [ ] um **momento autoral** por página, no máximo; o resto é feedback funcional
- [ ] easing: ease-out forte para entrada e feedback; **nenhum `ease-in` em UI**; nenhuma entrada de `scale(0)`
- [ ] UI até 300ms; reveal de marketing até 600ms; saída mais rápida que entrada
- [ ] só `transform` e `opacity`; sem `transition: all`
- [ ] o conteúdo é visível sem JS e com `prefers-reduced-motion` (estado oculto só sob `.js-anima`), testado de verdade
- [ ] hover atrás de `@media (hover: hover) and (pointer: fine)`
- [ ] se há GSAP: versão presa, `gsap.matchMedia()` com ramo reduzido e conteúdo visível, `markers` removidos
  (`grep -c markers` dá 0), e a página comunica o mesmo se a animação sumir
- [ ] sem scroll hijacking, sem preloader de porcentagem, sem count-up

## Responsivo e a11y visual

- [ ] `node scripts/auditar-dom.mjs <pagina>` sai com **0 graves** (e exit 2 não conta como aprovação)
- [ ] testado em 375, 500, 744, 1068 e 1440; nenhum scroll horizontal
- [ ] todo alvo de toque com no mínimo 44px; foco visível em tudo que é interativo
- [ ] nav mobile acessível, com foco preso e fechamento por Esc
- [ ] imagens com `aspect-ratio` declarado (sem layout shift)
- [ ] os quatro estados dos interativos e os estados vazio, carregando e erro desenhados

## Anti-IA

- [ ] nenhum roxo ou índigo que não tenha sido escolhido de propósito
- [ ] nenhum emoji como ícone
- [ ] bento com hierarquia real de tamanho; nenhum grid de 3 cards iguais como estrutura da página
- [ ] nenhuma foto de stock genérica
- [ ] copy diz algo específico; nada de "sua plataforma completa"; botão diz a ação
- [ ] se existe site-mãe, o UI system veio dele
- [ ] "menos cara de IA" foi tratado por uma seção, nunca pela lista inteira de uma vez

## Ícones

- [ ] nenhum ícone é caractere ou emoji (o auditor acusa `ICONE-GLIFO`)
- [ ] SVG inline com `currentColor`, `width:1em` e `flex:none`
- [ ] botão só de ícone tem `aria-label` e 44x44px
- [ ] um conjunto só, mesmo traço e grade; em página de marca, nenhum ícone de biblioteca cru

## Imagens e mídia

- [ ] **nenhuma imagem gerada por modelo Claude**; qualquer geração passou pela detecção de `codex`/`gemini`, pela
  pergunta à pessoa e pela `schematize-models`
- [ ] `grep -c data-provisorio` na página dá **0** antes de publicar
- [ ] toda imagem provisória foi trocada por foto real do cliente ou por imagem aprovada
- [ ] nenhuma licença NonCommercial; CC BY e BY-SA com crédito **visível na página**
- [ ] licença de imagem gerada tratada como **não verificada** até a pessoa confirmar os termos do provedor
- [ ] `alt` descreve a imagem final, não o placeholder; `alt=""` nas decorativas

## Entrega

- [ ] `lang` correto no `<html>`; `<title>` e `<meta name="description">` preenchidos
- [ ] se a página precisa rankear: `schematize-seo` carregada e o gate dela rodado
- [ ] engenharia de front (RSC, segurança, CWV, testes) conferida pela `schematize-web`
- [ ] handoff gravado no archive do projeto (`/design-handoff`)
