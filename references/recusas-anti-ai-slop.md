# Recusas e anti-AI-slop (lista unificada)

Esta lista funde o catálogo de "cara de IA" de 2026 com a lista de recusas do Impeccable e os pisos de polimento do
Emil. Ela é de **escolha por omissão**: são os padrões da categoria que o modelo produz quando ninguém decidiu. Se o
briefing ou a marca determinam explicitamente algo daqui, o briefing manda (ver seção 5).

Princípio que governa tudo: **o problema nunca foi o gradiente; foi usá-lo sem razão.** O fio comum do que
substituiu a assinatura de IA é intencionalidade.

## 1. A assinatura reconhecível

Gradiente roxo ou índigo + Inter + três feature boxes + `border-radius: 16px` em tudo + `box-shadow` com opacidade
`.1`. A origem é documentada: um token de botão índigo, repetido por anos em templates populares, virou o mediano
estatístico do treino dos modelos. Por isso **toda interface gerada nasce roxa**, inclusive as suas, se você não
decidir a cor de propósito.

Copy vaga é o sinal mais forte e o menos notado: "Construa o futuro do trabalho", "Sua plataforma completa",
"Escale sem limites". Se a frase serve para outra empresa, apague.

## 2. Recusas por categoria

### Estrutura e layout
- Cards iguais de ícone + título + texto como **estrutura da página** (22% das páginas geradas). Cards dentro de
  cards, nunca.
- Template de métrica-herói: número grande, rótulo pequeno. Faixa de estatísticas decorativa.
- Rótulo pequeno (kicker, eyebrow, badge ou pílula) acima de título. **O título se sustenta sozinho.**
- Hero centralizado com pílula acima do H1.
- Numeração de seção (01, 02, 03) a menos que a sequência carregue informação (passos reais).
- Modal para tarefa que não precisa de interrupção.
- Espaçamento monótono; linhas longas demais; título mais perto da seção anterior que do seu conteúdo.
- Bento sem variação de tamanho (é só um grid).

### Superfície e cor
- Texto em gradiente. Vidro e blur como enfeite. Borda colorida grossa na lateral de card. Sombra dura deslocada
  fora de um mundo neobrutalista. Halo radial atrás do conteúdo.
- Gradiente roxo ou azul-roxo; roxo e ciano em fundo escuro.
- Sparklines, anéis de progresso e retângulos arredondados no lugar de conteúdo.
- Texto cinza sobre fundo colorido; texto minúsculo; corpo inteiro em caixa alta.
- Claro ou escuro escolhido pela **categoria** do produto em vez do contexto de uso.
- Paleta bege ou creme **por padrão** (ver o conflito 6 abaixo).
- Corporate Memphis, neumorphism, blobs SVG soltos.

### Tipografia
- Monoespaçada como fantasia de "técnico" (ver o conflito 4).
- Fonte de sistema como voz de display **por omissão** (ver o conflito 5). Título serifado itálico gigante como
  atalho. Combinações de moda sem decisão (Space Grotesk + Instrument Serif + Geist).
- Heading inteiro em CAIXA ALTA.

### Imagem e ícone
- Emoji ou glifo unicode no lugar de ícone: use SVG desenhado com traço consistente.
- Ícone de biblioteca cru em página de marca (ver o conflito 7).
- Máscara geométrica imitando contorno de foto; mockup 3D de laptop; stock de "grupo diverso olhando laptop".
- Imagem quebrada. Ilustração de placeholder feita de círculos e blocos.
- Spline e WebGL pesados para efeito gratuito (800 kB a 2 MB de JS).

### Movimento
- Ponto pulsando, cursor piscando decorativo, letreiro rolando, easing elástico, imagem que dá zoom no hover,
  animação que desloca layout.
- Scroll hijacking, preloader de porcentagem, tipografia cinética que prometeu e não entregou (a11y, CWV).
- Fade-in genérico com timing idêntico em tudo; animação que existe só porque "ficou legal" em algo visto
  dezenas de vezes por dia.
- Contador animado de número (count-up) em faixa de estatísticas.

### Copy
- Travessão em toda frase (e, na casa, **em qualquer frase**: ver o conflito 3).
- Promessas genéricas de marketing; contrastes forçados ("Não é X. É Y."); o mesmo texto repetido no mesmo card.
- Botão que não diz a ação ("Saiba mais", "Clique aqui").

### Defaults não decididos
- Defaults do shadcn/ui, Tailwind UI ou de qualquer kit intocados em página de marca.
- Sombra difusa uniforme e raio uniforme em tudo.

## 3. Substitutos comprovados

| Em vez de | Use |
|---|---|
| gradiente roxo/azul | off-black + 1 acento escolhido do assunto |
| glassmorphism pesado | blur discreto só onde há conteúdo passando por baixo, e hairline `0 0 0 1px rgba(0,0,0,.08)` |
| sombra difusa uniforme | hairline na separação estática, sombra em camadas só em elevação real |
| pílula em todo raio | raio diferenciado por tipo (botão pílula, card não) |
| emoji como ícone | ícone SVG semântico com traço consistente |
| mockup 3D de laptop | screenshot real do produto |
| tipografia cinética | tipografia grande estática |
| Spline/WebGL | CSS/SVG |
| 3 cards idênticos | hierarquia real de tamanho e de conteúdo |
| bloco de estatísticas | o número dentro de uma frase que prova algo |

Paletas que substituíram: off-black `#09090B` (não `#000`), off-white `#FAFAFA` (não `#FFF`); escada escura
`#18181B` / `#27272A` / `#3F3F46`; texto escuro `#FAFAFA` / `#A1A1AA` / `#71717A`. Autore em OKLCH
(`references/tokens-tipografia-cor.md`), mas **entregue token de texto em cor sólida**.

## 4. Protocolo quando o pedido for "menos cara de IA"

Cara de IA é queixa vaga, e esta lista é o conserto mais amplo possível. Aplicá-la inteira troca a identidade da
página, não só os tiques. Registro de uma ocorrência real: a lista inteira foi aplicada de uma vez (fora kicker,
faixa de números, palavra colorida, cards com sombra, vidro, pílulas, animação), a página virou um catálogo sóbrio
de filetes, e o cliente pediu a seção de volta, e depois a página inteira de volta, "com a cara de IA e tudo".

1. **Existe site-mãe?** Extraia o UI system dele (fonte, raio, menu, paleta, ícones) com
   `scripts/buscar-referencias.mjs --extrair=<url>`. Acabou. Não abra esta lista.
2. **Não existe?** Pergunte qual seção incomoda.
3. **Sem resposta?** Aplique **só** os três itens de maior sinal e menor risco de identidade: trocar a cor
   roxa ou índigo, trocar emoji por ícone semântico, quebrar os 3 cards idênticos em hierarquia real. **Mude uma
   seção e mostre.** Só siga se a pessoa pedir mais.

**Nunca** aplique a lista inteira de uma vez sem que a pessoa tenha visto uma seção antes.

## 5. Quando a recusa não vale

- **Briefing explícito.** Estética, materiais, fontes e paletas definidos pelo cliente ou pela marca prevalecem,
  mesmo que pareçam padrão saturado. Desviar é falha.
- **Mundo estabelecido.** Em produto existente, a recusa não obriga a refazer o que já é o sistema dele. Refinar
  preserva.
- **Operar.** Em app e painel, lista repetida de itens, tabela densa e fonte de sistema são estrutura legítima.
- **Neobrutalismo declarado.** Sombra dura deslocada é parte do mundo, não defeito (pico em março/2026, em queda).

## 6. Conflitos entre as fontes (resolvidos)

A skill funde três fontes que discordam em pontos concretos. Esta tabela é a decisão da casa; não reabra caso a caso.

| # | Tema | O que as fontes dizem | Decisão da casa |
|---|---|---|---|
| 1 | **Easing** | padrão de design: `cubic-bezier(.4,0,.2,1)` para tudo; Impeccable: ease-out exponencial; Emil: nunca ease-in, curvas customizadas fortes | **Entrada, saída e feedback: ease-out forte** `cubic-bezier(.23,1,.32,1)`. Movimento na tela: ease-in-out forte `cubic-bezier(.77,0,.175,1)`. Hover e cor: `ease`. Movimento constante: linear. A curva `.4,0,.2,1` foi aposentada como default. `ease-in` em UI é vetado. |
| 2 | **Estado inicial de entrada** | Impeccable: partir de um estado já visível; Emil e o padrão de design: `opacity: 0` + deslocamento | O conteúdo é **visível por padrão** (sem JS, com movimento reduzido, se o script falhar). O estado oculto inicial só é aplicado por JS depois de confirmar que o movimento pode rodar (`html.js-anima`), e só em elemento que **entra**. Nunca `opacity: 0` em CSS puro sobre conteúdo estático. |
| 3 | **Travessão** | Impeccable recusa o travessão "em toda frase"; piso da casa: zero travessão | **Zero** `—`, `–` e `--` em copy, `alt`, meta e placeholder. A regra da casa é mais estrita e engloba a do Impeccable. Não vale para código, variáveis CSS (`--cor`) nem para esta documentação. |
| 4 | **Monoespaçada** | Impeccable recusa como "fantasia de técnico"; o catálogo de tendências a lista como direção nova | Monoespaçada **só onde o conteúdo é código, dado, ID, terminal ou numeral tabular**. Nunca como voz de título, rótulo ou kicker. O rótulo do SVG de wireframe é ferramenta e está isento. |
| 5 | **Fonte de sistema** | o padrão de design adota a pilha de sistema; Impeccable recusa como voz de display | A pilha de sistema é **aceita por decisão registrada** (briefing no estilo HIG, produto cuja interface deve sumir, Operar e Ler). Em Persuadir e Experienciar, a voz de display é escolhida e licenciada (OFL ou comprada), nunca herdada do navegador por omissão. SF Pro não se serve por `@font-face` (licença). |
| 6 | **Neutros quentes** | o catálogo recomenda neutros quentes (`#F8F5F1`); Impeccable recusa paleta bege/creme por padrão | Neutro quente é **escolha com motivo no assunto**, não reflexo de 2026. Registre por que (cerâmica, papel, hospitalidade). Sem motivo, off-black e off-white com tint do acento. |
| 7 | **Ícones de biblioteca** | o catálogo recusa Lucide/Heroicons crus em marca; o piso de front aceita um icon set | Em **Operar** (app, painel), um icon set consistente (Lucide, Phosphor, Tabler, Radix) é correto: um só por projeto. Em **Persuadir e Experienciar**, ícone de biblioteca cru é recusado: desenhe, adapte ou extraia do site-mãe, mesmo traço e grade. Nunca emoji em nenhum modo. |
| 8 | **Sombra** | Impeccable: sombras com deslocamento e desfoque suave; catálogo: hairline substitui sombra difusa | Hairline para **separação estática**. Sombra em camadas, com deslocamento `y` positivo e baixa opacidade, para **elevação real** (popover, modal, arrasto, hover de elevação). Halo colorido sem deslocamento: recusado. |
| 9 | **Vidro e blur** | padrão de design: nav de vidro; Impeccable: vidro como enfeite é recusado | Vidro **só onde há função**: nav ou barra fixa com conteúdo rolando por baixo, blur até 20px. O blur de 2px do Emil para mascarar crossfade é funcional e permitido. |
| 10 | **Eyebrow** | Impeccable: proibido; o catálogo anterior: permitido se a headline não disser aquilo | **Proibido como rótulo sobre título.** Única exceção: metadado funcional que o título não pode carregar (categoria e data de artigo em Ler, estado "Novo", versão), e então com `nota` justificando. O renderer de wireframe recusa `eyebrow` sem `nota`. |
| 11 | **Cards** | Impeccable: cards de ícone + título + texto como estrutura são recusados, card em card nunca; o padrão de design aceita bento | **Bento aceito com hierarquia real** de tamanho e de tipo de conteúdo. Grid de 3 cards iguais como estrutura da página: recusado. Card dentro de card: recusado (o renderer rejeita). Lista repetida em Operar: legítima. |
| 12 | **Display e tracking** | padrão de design chega a 120px em direção editorial; Impeccable: display até 6rem, tracking mínimo -0.04em | **Teto 96px (6rem) e -0.04em.** Valores maiores que isso vieram de uma receita antiga e foram aposentados. |
| 13 | **Duração e distância de reveal** | padrão de design: 600ms e 24px; Emil: UI abaixo de 300ms | **UI e interação: até 300ms** (padrão 150 a 250). **Reveal de seção em marketing: 400 a 600ms, 16 a 24px, no máximo.** Teto absoluto 600ms. Nada disparado por teclado anima. |
| 14 | **Quantidade de movimento** | padrão de design: reveal em toda seção; Impeccable: um momento autoral | O reveal on-scroll é **infraestrutura discreta e uniforme**, não "o momento". O **momento autoral** é um só por página (pin, scrub ou coreografia do hero). Todo o resto é feedback funcional. |
| 15 | **Medida de linha** | 60 a 75ch / 65 a 75 caracteres | **65 a 75 caracteres** no corpo. |
| 16 | **Perguntas do passo 0** | padrão: perguntar tudo de uma vez e não inventar; Impeccable: perguntar só o que muda o trabalho, decidir e registrar | Perguntar **só o que muda o trabalho**, numa mensagem; o que ninguém sabe responder é **decidido e registrado** em `meta.suposicoes`. |
| 17 | **Loop de verificação** | gate "item que falha volta"; Impeccable: rodadas limitadas | **Uma inspeção, uma correção em lote, no máximo uma confirmação, e pare.** Item grave que falha continua bloqueando a entrega; não vira ressalva. |
| 18 | **Contador animado** | receita de count-up em estatística | **Removida.** Count-up em faixa de números é recusa (métrica-herói decorativa). |
| 19 | **Radial glow no hero** | levers de refino antigos: glow radial de baixa opacidade | **Removido.** Halo radial atrás do conteúdo é recusa. |
