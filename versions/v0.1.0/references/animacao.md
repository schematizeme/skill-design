# Animação

Funde três coisas: o framework de decisão de animação do Emil Kowalski, as receitas de GSAP e o princípio do
Impeccable de **um momento autoral**. Antes de escrever qualquer código de movimento, responda às quatro perguntas
da seção 1, na ordem.

Tokens de movimento usados em todo o arquivo (também em `assets/tokens.css`):

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);   /* ease-out forte: entrada, saída, feedback (default) */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* ease-in-out forte: movimento e morph na tela */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* curva de gaveta, estilo iOS */
--ease:        ease;                             /* hover e mudança de cor */
```

As curvas nativas do CSS são fracas demais. Para variantes mais fortes, procure em easing.dev ou easings.co em vez de
inventar curva.

## 1. O framework de decisão (quatro perguntas, em ordem)

### 1.1 Isto deve animar?

| Frequência de uso | Decisão |
|---|---|
| 100+ vezes por dia (atalho de teclado, paleta de comandos) | **Sem animação. Nunca.** |
| Dezenas por dia (hover, navegação em lista) | Remova ou reduza drasticamente |
| Ocasional (modal, gaveta, toast) | Animação padrão |
| Raro ou primeira vez (onboarding, comemoração) | Pode ter encanto |

**Nunca anime ação iniciada por teclado.** Uma paleta de comandos sem animação de abrir e fechar é a experiência
ótima para algo usado centenas de vezes por dia.

### 1.2 Qual é o propósito?

Propósitos válidos: **consistência espacial** (toast entra e sai pelo mesmo lado, o swipe para dispensar fica
intuitivo), **indicação de estado** (botão que se transforma mostra a mudança), **explicação** (animação de marketing
que mostra como algo funciona), **feedback** (botão que afunda no toque confirma que a interface ouviu), **evitar
mudança brusca** (elemento que aparece ou some sem transição parece quebrado).

Se o propósito é só "ficou legal" e o usuário verá isso com frequência, não anime.

### 1.3 Qual easing?

| Situação | Easing |
|---|---|
| Entrar ou sair | `--ease-out` |
| Mover ou transformar na tela | `--ease-in-out` |
| Hover e mudança de cor | `--ease` |
| Movimento constante (letreiro funcional, barra de progresso) | `linear` |
| Em dúvida | `--ease-out` |

**`ease-in` é vetado em UI.** Começa devagar, a interface parece lenta. `ease-out` a 200ms parece mais rápido que
`ease-in` a 200ms.

### 1.4 Qual duração?

| Elemento | Duração |
|---|---|
| Feedback de botão no toque | 100 a 160ms |
| Tooltip e popover pequeno | 125 a 200ms |
| Dropdown e select | 150 a 250ms |
| Modal e gaveta | 200 a 500ms |
| Reveal de seção em marketing | 400 a 600ms (teto absoluto) |
| Explicação de marketing | pode ser mais longa, com propósito |

**Animação de UI fica abaixo de 300ms.** Percepção de desempenho: um select de 180ms parece mais responsivo que um
de 400ms; tooltips instantâneos depois do primeiro aberto fazem a barra inteira parecer mais rápida.

**Tempo assimétrico:** lento onde o usuário está decidindo (segurar para excluir: 2s linear), rápido onde o sistema
responde (soltar: 200ms ease-out). A saída é mais rápida que a entrada.

## 2. Um momento autoral

Depois do framework, a página precisa de **um** momento de movimento que seja dela: o gesto que a assina, não efeito
espalhado.

- Escolha um só: coreografia do hero, o recurso estrela com pin e scrub, a transição entre estados do produto, um
  detalhe de microinteração que só esta marca teria.
- Comece sempre de um estado **já legível**, em ease-out exponencial. O conteúdo tem de funcionar sem a animação:
  *se a animação sumir, a página ainda comunica a mesma coisa?* Se não, ela carrega informação que devia estar no
  texto. Se sim, ela é enfeite, e enfeite tem orçamento.
- O reveal on-scroll comum **não é o momento autoral**: é infraestrutura discreta e uniforme (seção 8).
- Em Operar, o momento autoral costuma ser nenhum. Disciplina também é uma escolha.
- Tudo mais que se move é feedback funcional (press, foco, transição de estado) com os tokens acima.
- Coesão: a personalidade do movimento acompanha a da marca. Lúdico pode ser mais saltitante; painel profissional é
  nítido e rápido. Uma linguagem de movimento por produto.

## 3. Molas (springs)

Molas simulam física e se assentam por parâmetros físicos. Use para arrasto com momento, elementos que devem parecer
vivos, gestos interrompíveis e acompanhamento decorativo do mouse (use `useSpring` do Motion em vez de ligar o valor
direto à posição do mouse). Se a interação é funcional (um gráfico bancário), animação nenhuma é melhor.

Configuração: `{ type: "spring", duration: 0.5, bounce: 0.2 }` (recomendada) ou física
`{ mass: 1, stiffness: 100, damping: 10 }`. Bounce sutil (0.1 a 0.3); evite bounce na maior parte da UI. Molas
**preservam a velocidade** quando interrompidas; keyframes CSS recomeçam do zero. Easing elástico decorativo é
recusa.

## 4. Princípios de componente

- **Botão responde ao toque:** `transition: transform 160ms var(--ease-out)` e `:active { transform: scale(.97); }`
  (0.95 a 0.98) em tudo que se pressiona.
- **Nunca anime a partir de `scale(0)`:** comece em `scale(.95)` com `opacity: 0`. Nada no mundo real surge do nada.
- **Popover nasce do gatilho:** `transform-origin: var(--transform-origin)` (Radix, Base UI). **Modal fica
  centralizado.**
- **Tooltip:** atrase o primeiro; depois que um está aberto, os vizinhos abrem instantâneos, sem animação
  (`transition-duration: 0ms` em `[data-instant]`).
- **Transição, não keyframe, em UI interrompível:** transição retoma do ponto atual; keyframe recomeça.
- **Blur mascara crossfade imperfeito:** `filter: blur(2px)` durante a troca faz dois estados lerem como um. Fique
  abaixo de 20px (caro no Safari).
- **Estado de entrada com `@starting-style`** (fallback: atributo `data-mounted` posto após o primeiro render).
- **Gate de hover:** `@media (hover: hover) and (pointer: fine)`; em toque, hover dispara no tap.

## 5. Domínio de CSS transform

- `translateY(100%)` desloca o elemento pela própria altura (é como toasts e gavetas são posicionados). Prefira
  porcentagem a px fixo.
- `scale()` também escala os filhos (fonte, ícones).
- `rotateX/rotateY` com `transform-style: preserve-3d` dão 3D real sem JS (órbitas, moeda).
- `transform-origin` no lugar onde mora o gatilho.

## 6. clip-path para animação

`clip-path: inset(topo direita base esquerda)`: cada valor "come" o elemento daquele lado.
`inset(0 100% 0 0)` oculto pela direita; `inset(0 0 0 0)` visível.

- **Abas com transição de cor perfeita:** duplique a lista de abas, estilize a cópia como ativa, recorte para
  mostrar só a aba ativa e anime o recorte.
- **Segurar para excluir:** overlay colorido com `inset(0 100% 0 0)`; em `:active` vai a `inset(0 0 0 0)` em 2s
  linear; ao soltar volta em 200ms ease-out; mais `scale(.97)` no press.
- **Revelar imagem no scroll:** de `inset(0 0 100% 0)` a `inset(0)` ao entrar na viewport (IntersectionObserver ou
  `useInView({ once: true, margin: "-100px" })`).
- **Comparador antes/depois:** duas imagens sobrepostas, a de cima recortada por `inset(0 50% 0 0)` guiado pelo
  arrasto.

## 7. Gestos e arrasto

- **Dispensar com momento:** velocidade = `Math.abs(distância) / tempo`; dispense se a distância passa do limite
  **ou** a velocidade passa de cerca de 0.11.
- **Amortecimento nas bordas:** passou do limite, quanto mais arrasta, menos se move (fricção em vez de parada seca).
- **Captura de ponteiro** quando o arrasto começa; **proteção multi-toque:** ignore toques extras depois do início.

## 8. Reveal on-scroll e stagger

Reveal é infraestrutura: fade + subida pequena, via `IntersectionObserver` com `unobserve` depois de revelar.

- UI e app: 8 a 16px, 300ms, ease-out. Marketing: até 24px, 400 a 600ms.
- **Stagger de 30 a 80ms** entre irmãos (60ms é um bom default); decorativo, nunca bloqueia interação.
- Estado inicial oculto **só depois que o JS confirma** que o movimento pode rodar:

```css
.js-anima .revelar { opacity: 0; transform: translateY(24px);
  transition: opacity 560ms var(--ease-out), transform 560ms var(--ease-out); }
.js-anima .revelar.visivel { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .js-anima .revelar { opacity: 1; transform: none; transition: none; }
}
```

```js
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js-anima');
  /* depois, o IntersectionObserver de references/build-html.md */
}
```

Sem JS, ou com movimento reduzido, o conteúdo está visível. Nunca deixe `opacity: 0` em CSS puro sobre conteúdo
estático.

## 9. GSAP: quando vale

Verificado em 2026-10-14 no registro do npm: versão **3.15.0**, licença *Standard "no charge"*
(https://gsap.com/standard-license). Todos os plugins antes pagos são públicos (`SplitText`, `ScrollSmoother`,
`DrawSVGPlugin`, `MorphSVGPlugin`, `Flip`, `ScrollTrigger`). Se um tutorial fala em "plugin do Club GreenSock", está
desatualizado.

Orçamento medido:

| Arquivo | Bruto | ~gzip |
|---|---|---|
| `gsap.min.js` | 71 KB | ~28 KB |
| `ScrollTrigger.min.js` | 43 KB | ~17 KB |
| `SplitText.min.js` | 7 KB | ~3 KB |
| `Flip.min.js` | 24 KB | ~10 KB |
| `ScrollSmoother.min.js` | 13 KB | ~5 KB |

Core + ScrollTrigger = 114 KB bruto, ~45 KB gzip: o teto razoável de uma landing. Acima disso, você paga em LCP o que
ganha em impressão (o orçamento de performance é da `schematize-web`).

**Reveal on-scroll simples não precisa de GSAP.** `IntersectionObserver` + transição CSS faz fade e subida em
12 linhas e 0 KB. Carregue GSAP quando a página tiver **pelo menos uma** destas: narrativa com `pin`; `scrub` real
(a animação segue a posição do scroll); linha do tempo encadeada com mais de três passos dependentes; `Flip`;
`SplitText` com stagger por palavra num título grande. Uma página que usa GSAP só para fade trocou 45 KB por nada.

Carregar com **versão presa**, nunca `@latest`:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>
<script>gsap.registerPlugin(ScrollTrigger);</script>
```

Em Next.js: `npm i gsap` e `useGSAP` de `@gsap/react`, que limpa os triggers no unmount (sem isso, navegar entre rotas
acumula ScrollTriggers).

### `prefers-reduced-motion` com GSAP não é opcional

A biblioteca não respeita nada sozinha:

```js
gsap.matchMedia().add({
  movimento: '(prefers-reduced-motion: no-preference)',
  parado:    '(prefers-reduced-motion: reduce)',
}, (ctx) => {
  if (!ctx.conditions.movimento) {
    gsap.set('.revelar', { opacity: 1, y: 0, clearProps: 'all' });  /* conteúdo VISÍVEL, não congelado */
    return;
  }
  /* ... as animações de verdade ... */
});
```

`gsap.matchMedia()` reverte sozinho quando a media query deixa de valer. Regra que fecha: com movimento reduzido, o
conteúdo tem de estar **visível**, não parado no estado inicial.

### Receitas

Pin com scrub (o recurso estrela, uma vez por página, é o candidato natural ao momento autoral):

```js
gsap.timeline({
  scrollTrigger: { trigger: '#estrela', start: 'top top', end: '+=1200',
                   pin: true, scrub: 1, anticipatePin: 1 },
})
.to('.camada-fundo', { scale: 1.12, ease: 'none' })
.to('.camada-texto', { yPercent: -40, ease: 'none' }, 0);
```

`scrub: 1` (não `true`) dá um segundo de amortecimento e é o que parece caro. `ease: 'none'` dentro de scrub: o
easing é o próprio scroll.

Título por palavra:

```js
const t = new SplitText('.hero h1', { type: 'words', wordsClass: 'palavra' });
gsap.from(t.words, { yPercent: 110, opacity: 0, duration: .8, stagger: .05, ease: 'power3.out' });
```

`.palavra { display:inline-block; overflow:hidden }` no pai. Acessibilidade: `SplitText` quebra o texto em `<div>`
por palavra e alguns leitores passam a ler palavra por palavra; ponha `aria-label` com a frase inteira no `<h1>` e
`aria-hidden` nos pedaços, ou chame `t.revert()` ao terminar.

Marcadores de desenvolvimento (`markers: true`) somem antes de entregar: `grep -c markers pagina.html` dá 0.

(A receita de contador numérico foi **removida**: count-up em faixa de estatísticas é recusa. Ver
`references/recusas-anti-ai-slop.md`.)

## 10. Regras de desempenho

- Anime só `transform` e `opacity` (pulam layout e paint). Animar padding, margin, height ou width dispara tudo.
- Variáveis CSS herdam: atualizar uma no pai com muitos filhos recalcula todos. Escreva `element.style.transform`
  direto.
- Atalhos `x`, `y`, `scale` do Framer Motion rodam na thread principal; use a string completa
  `transform: "translateX(100px)"` para aceleração por hardware.
- Animação CSS fica suave sob carga (fora da thread principal): CSS para movimento pré-determinado, JS para
  dinâmico e interrompível. WAAPI (`element.animate`) dá controle JS com desempenho de CSS.
- `will-change: transform` no que vai animar, e **tire depois**.
- `ScrollTrigger.refresh()` depois de fonte ou imagem sem dimensão declarada. Uma `gsap.timeline()` por seção.

## 11. Acessibilidade

- `prefers-reduced-motion`: **menos e mais suave, não zero.** Mantenha transições de opacidade e cor que ajudam a
  entender; remova movimento e deslocamento. Teste de verdade com a preferência ligada.
- Gate de hover atrás de `(hover: hover) and (pointer: fine)`.
- Sem scroll hijacking nem preloader de porcentagem. Nada acima de 600ms.

## 12. Depurar animação

- Câmera lenta (2 a 5x a duração, ou painel Animations do DevTools): cores se misturam bem? o easing começa ou para
  de forma abrupta? o `transform-origin` está certo? as propriedades ficam em sincronia?
- Quadro a quadro no Chrome DevTools.
- Teste gestos em dispositivo real (Safari remoto por USB).
- Revise no dia seguinte, com olhos descansados.

## 13. Tabela de revisão rápida

| Problema | Correção |
|---|---|
| `transition: all` | especifique: `transition: transform 200ms var(--ease-out)` |
| entrada a partir de `scale(0)` | comece em `scale(.95)` com `opacity: 0` |
| `ease-in` em UI | `--ease-out` ou curva custom |
| `transform-origin: center` em popover | origem no gatilho (modal é isento) |
| animação em ação de teclado | remova |
| duração acima de 300ms em UI | 150 a 250ms |
| hover sem media query | `@media (hover: hover) and (pointer: fine)` |
| keyframe em elemento acionado rápido | use transição (interrompível) |
| `x`/`y` do Framer Motion sob carga | `transform: "translateX()"` |
| entrada e saída com a mesma velocidade | saída mais rápida |
| tudo aparece de uma vez | stagger de 30 a 80ms |
| `opacity: 0` em CSS puro sobre conteúdo estático | estado oculto só sob `.js-anima` |
