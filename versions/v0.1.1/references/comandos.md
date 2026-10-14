# Comandos: o método de cada um

Dezesseis comandos, prefixo `design-`. Esta reference é o método; cada arquivo de comando em `assets/commands/` é
curto e aponta para a seção daqui.

**Regra de entrada, de todos:** sem argumento (ou sem alvo claro), apresente o menu ou pergunte pelo alvo e pergunte
qual rodar. **Nunca rode um comando sozinho**, nem escolha o modo de um comando parametrizado no lugar da pessoa.

Caminhos: `<skill>` é o diretório da skill instalada (`.claude/skills/schematize-design` no projeto ou
`~/.claude/skills/schematize-design` global). Arquivos de trabalho (`wireframe.json`, `wireframe.svg`, `index.html`,
`imagens.json`) saem **no diretório de trabalho atual**, nunca num caminho inventado.

## Mapa: do que o Impeccable chama para o que a casa chama

| Origem (Impeccable) | Comando da casa |
|---|---|
| shape; init, document, extract | `/design-shape` (`init`, `document`, `extract`) |
| critique | `/design-critique` |
| audit | `/design-audit` |
| polish | `/design-polish` |
| bolder, quieter, distill, colorize, typeset, layout, clarify | `/design-tune <argumento>` |
| animate, delight, overdrive | `/design-animate <argumento>` |
| harden, onboard, adapt, optimize | `/design-harden <argumento>` |
| generate, live | `/design-variants <argumento>` |
| (pipeline da casa) | `/design-wire`, `/design-build`, `/design-visual` |
| (menu, contexto) | `/design-help`, `/design-load`, `/design-claude`, `/design-handoff`, `/design-cc` |

---

## /design-help
Mostra a tabela de comandos e o pipeline. **Não executa mais nada.**

## /design-load
Lê **na íntegra** todos os arquivos de `<skill>/references/` (não trabalhe de memória: os números estão nos arquivos
porque a memória do modelo erra o terceiro decimal, e é nele que o contraste reprova) e passa a aplicar os pisos do
`SKILL.md` nesta sessão. Confirma em três linhas o que carregou.

## /design-wire
Passo 0 a 3 do pipeline (`references/pipeline.md`). Descoberta, leitura da referência, `./wireframe.json`,
`./wireframe.svg`, auditoria de paleta. **Para** e pergunta a stack (`AskUserQuestion`: HTML único, Next.js,
Shopify Liquid, **ainda não, quero ajustar**). A última opção é obrigatória. Não escreve código na mesma mensagem.
Na iteração, edite os campos do JSON e re-renderize; nunca reescreva o arquivo inteiro para um ajuste.

## /design-build
Passo 4: constrói a partir de um `wireframe.json` já aprovado. Leia a reference da stack
(`build-html.md`, `build-nextjs.md` ou `build-liquid.md`), `tokens-tipografia-cor.md`, `recusas-anti-ai-slop.md`,
`icones.md` e, se `meta.movimento` for `narrativo`, `animacao.md`. Sem referência visual, leia `do-zero.md` antes de
qualquer coisa. Um `<section id>` por `secao.id`, na mesma ordem. `nota` é instrução para você, não copy. Termina
rodando `checar-contraste.mjs` e o `checklist.md`. Mídia gerada segue a regra do `SKILL.md`.

## /design-audit
Passo 5: auditoria objetiva de uma página pronta. Contraste da paleta, **DOM renderizado** em cinco larguras
(`auditar-dom.mjs`), `grep -c data-provisorio` (tem de dar 0 antes de publicar), licença das imagens, anti-padrões,
`references/checklist.md`. Saída no formato de `references/review.md` (tabela Before / After / Why, severidade em
`Why`). Inclui o que o Impeccable chama de audit: acessibilidade, desempenho de UI, responsivo, tema e as recusas. O
detalhe de CWV, a11y como piso técnico e testes é da `schematize-web`.

## /design-visual
A passada de revisão visual: depois do build e antes de dizer que está pronto. Roda os dois auditores, manda tirar
screenshot em duas larguras ou mais e **olhar**, e percorre a lista de `references/review.md` §4. Separa **o que está
quebrado** do **o que dá para melhorar**.

## /design-shape `[init | document | extract]`
Planeja UX e UI **antes** de construir. Sem argumento: pergunte qual.
- **(sem subcomando, plano)** objetivo, público, conteúdo, fluxo, estados. Decide o modo e quanto inventar
  (`references/modos-e-fluxo.md`). Para superfície nova em mundo estabelecido, deriva 5 a 7 estruturas bem diferentes
  e escolhe a de maior ressonância, registrando por quê.
- **init:** registra o contexto do produto em **PRODUCT.md** (o que é, para quem, voz, restrições, o que é verdade).
- **document:** gera `DESIGN.md` a partir do código existente (tokens, escala, componentes, decisões).
- **extract:** extrai tokens e componentes reutilizáveis do código para `assets`/tema.
Escreve no diretório atual; não sobrescreve **PRODUCT.md** ou `DESIGN.md` existentes sem mostrar o diff.

## /design-critique
Revisão de UX/UI com as notas por heurística e a tabela de achados de `references/review.md` §1 e §2. Priorizada,
com os três acertos a preservar e a ordem de ataque. **Não corrige em silêncio.**

## /design-polish
A passada final de qualidade antes de publicar. Aplica o piso inteiro (`references/piso-de-qualidade.md` A, B e C),
o review de animação (`references/animacao.md` §13) e as recusas. Entrega a tabela Before / After / Why e, com
aprovação, aplica. Uma rodada de inspeção, um lote de correções, no máximo uma confirmação.

## /design-tune `<bolder | quieter | distill | colorize | typeset | layout | clarify>`
Ajuste direcionado de um eixo. Sem argumento: liste os sete e pergunte. **Preserva identidade, comportamento e copy**
exceto onde o eixo manda (refinar preserva, não redesenha).
- **bolder:** amplifica design seguro ou sem graça. Mais contraste de escala e de peso, cor mais decidida,
  composição mais corajosa (uma quebra de grade). Não adiciona recusas para parecer ousado.
- **quieter:** baixa o volume de design agressivo. Menos cores, menos efeitos, mais respiro, acento só no clicável.
- **distill:** reduz ao essencial. Corta tudo o que não serve à tarefa; seção que repete argumento sai.
- **colorize:** cor estratégica num design monocromático, dentro do sistema (um acento do assunto, papéis medidos em
  `contraste.md`).
- **typeset:** hierarquia tipográfica, pares de fontes, escala, medida (65 a 75), entrelinha, tracking
  (`tokens-tipografia-cor.md`).
- **layout:** espaçamento, ritmo, alinhamento e hierarquia visual (`piso-de-qualidade.md` C1, C2, C5, C6).
- **clarify:** copy de interface, rótulos, mensagens de erro. Botão diz a ação; erro diz o problema e a saída; zero
  travessão.

## /design-animate `<momento | delight | overdrive | revisar>`
Movimento com intenção. Sem argumento: liste e pergunte. Sempre passa primeiro pelo framework de decisão
(`references/animacao.md` §1): isto deve animar?
- **momento:** projeta o **um** momento autoral da página, mais as transições que explicam mudança de estado.
- **delight:** personalidade e detalhes memoráveis: microinteração, copy com voz, surpresa útil (só em uso raro ou na
  primeira vez, nunca no que se repete dezenas de vezes por dia).
- **overdrive:** empurra além do convencional com efeito tecnicamente extraordinário, sem perder a função: um só,
  dentro do orçamento (GSAP até ~45 KB gzip), com ramo de `prefers-reduced-motion` e conteúdo visível sem ele.
- **revisar:** revisa a animação existente e entrega a tabela Before / After / Why.

## /design-harden `<estados | i18n | onboard | adapt | optimize>`
Pronto para produção. Sem argumento: liste e pergunte.
- **estados:** vazio, carregando (esqueleto), erro (com saída), sucesso, desabilitado, texto longo, zero e mil itens.
- **i18n:** tradução maior que o original, RTL, formatos de data e número, nada chumbado.
- **onboard:** primeiro uso, estados vazios, ativação.
- **adapt:** outros tamanhos de tela e dispositivos (375 a 1440; toque; teclado; `hover` só atrás de `(hover: hover)`).
- **optimize:** diagnostica e **mede** desempenho de UI (imagens, fontes, movimento, CLS). A correção de CWV é da
  `schematize-web` (`schematize-web → references/performance.md`).

## /design-variants `<generate | live>`
Gera variantes **lado a lado** de um elemento para a pessoa escolher. Sem argumento: pergunte qual elemento e qual
modo.
- **generate:** de 3 a 5 variantes com decisões **diferentes** (não o mesmo layout com cores trocadas), todas no mesmo
  `variantes.html` autocontido, com rótulo, mesmo conteúdo real e a recusa aplicada a todas. Para e pergunta qual
  seguir; mistura ("o título da 2 com a densidade da 4") é pedido legítimo.
- **live:** o mesmo, servido em `127.0.0.1` (nunca em `0.0.0.0`) para a pessoa abrir no navegador; a cada rodada você
  reescreve a escolhida e ela recarrega. Encerre o servidor quando terminar.

## /design-claude
Cria ou **mescla** o `CLAUDE.md` sempre-on de design na raiz do repo, a partir de `<skill>/assets/CLAUDE.md`.
Não apague regra existente; atualize a seção de design e diga o que mudou.

## /design-handoff e /design-cc
Gravam o handoff (`AAAA-MM-DD-<slug>-context.md` e `AAAA-MM-DD-<slug>-checklist.md`) em
`<projeto>/<projeto>_archive/context/`. `/design-cc` faz o mesmo e roda `/compact`; `/design-handoff` só grava. Inclua
o `wireframe.json` corrente, as decisões de direção, as suposições abertas e a lista de achados do último auditor.
