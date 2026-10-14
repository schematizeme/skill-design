# Modos e fluxo de trabalho

Todo trabalho de design começa por dois diagnósticos: **qual modo** (a superfície) e **quanto inventar**. Só depois
vem o pipeline de construção (`references/pipeline.md`).

## 1. Os quatro modos (escolha pela superfície, não pelo produto)

O mesmo produto tem superfícies de modos diferentes: a landing de um app de finanças é Persuadir; o painel dele é
Operar; o manual é Ler; o portfólio do estúdio que o fez é Experienciar.

| Modo | O visitante... | Exemplos | Prioridade | Densidade típica | Movimento |
|---|---|---|---|---|---|
| **Persuadir** | decide e age | landing, campanha, preços, página de produto | atenção e ação; um CTA focal | `airy` no hero e na conversão | um momento autoral + reveal discreto |
| **Operar** | conclui uma tarefa | app, painel, admin, formulário longo | escaneabilidade e consistência acima de expressão | `densa` a `normal` | feedback e transição curtos; quase nenhum enfeite |
| **Ler** | entende algo | docs, artigos, guias | medida de linha, hierarquia, ritmo vertical | `normal`, coluna estreita | quase nenhum |
| **Experienciar** | está dentro da obra | portfólio, galeria, experiência editorial | a obra; expressão permitida | livre, com intenção | o movimento pode ser protagonista, ainda com `prefers-reduced-motion` |

Consequências que se herdam do modo:

- **Imagem real** quando o briefing de Persuadir pede (foto do produto, do lugar, da pessoa). Em Operar, a imagem é
  conteúdo (avatar, anexo), não decoração.
- **Fonte de sistema** é aceitável e até ideal em Operar (a interface some, o conteúdo fica). Em Persuadir e
  Experienciar, a voz tipográfica é decisão deliberada (ver `references/tokens-tipografia-cor.md`).
- **Tema claro ou escuro** sai do contexto de uso (sala escura, uso noturno, ferramenta de foco), nunca da
  categoria ("fintech é escuro", "bem-estar é bege").
- **Recusas** pesam diferente por modo: em Operar, o card repetido de lista é estrutura legítima; em Persuadir, é
  sinal de template (`references/recusas-anti-ai-slop.md`).

## 2. Passo 0: descoberta (antes de olhar a referência)

Faça **uma** mensagem curta e pergunte apenas o que muda o trabalho. Se ninguém pode responder, **decida e registre
a suposição** em `meta.suposicoes` do wireframe. Não invente o que a pessoa saberia dizer em dez segundos.

1. **Que página é?** landing de conversão, institucional, PDP, hero solto, uma seção, uma tela de app.
2. **Qual é a ação?** Uma só. Se vierem duas, pergunte qual é a principal.
3. **Marca.** Existe site-mãe, logo, paleta, fonte? Se existe, **ele é a referência**.
4. **Tema.** Claro, escuro ou os dois, e por qual razão de uso.
5. **Movimento.** Sóbrio (só reveal on-scroll) ou narrativo (pin e scrub)?

Se a pessoa mandar só uma imagem, pergunte 2 e 3 e infira o resto declarando a suposição.

**A stack de saída NÃO se pergunta aqui.** Ela não muda uma vírgula do wireframe, só o build. É a última pergunta, no
passo de aprovação.

## 3. Quanto inventar

| Situação | O que fazer |
|---|---|
| **Estender** uma superfície existente | herda tudo (tema, tokens, componentes). Não invente nada. |
| **Nova superfície dentro de um mundo estabelecido** | o sistema visual é fixo; a estrutura é nova. Derive de **5 a 7 estruturas bem diferentes** a partir do conteúdo e da tarefa e escolha a de maior ressonância. Registre por que as outras saíram. |
| **Criar ou substituir o mundo visual** | redesenho. Trate o visual antigo como antirreferência, mantenha verdade do produto e conteúdo. |

Regra de ouro: **refinar preserva, redesenhar substitui, e nunca se fica no meio**. Para "menos cara de IA" a
resposta nunca é redesenhar a página inteira (ver a contraprova em `references/recusas-anti-ai-slop.md`).

## 4. Fluxo para trabalho novo

1. **Decida o que já é verdade:** marca, tipografia, paleta, componentes existentes, restrições técnicas. Levante o
   que existe antes de criar (tema, CSS, tokens, fontes, logos, páginas anteriores).
2. **Pergunte só o que muda o trabalho** (passo 0). Se ninguém responde, decida e registre.
3. **Escolha quanto inventar** (tabela acima).
4. **Comprometa-se com um mundo nomeável** e registre a decisão: paleta, tipos, escala, raios, movimento. Sem
   referência, escreva `meta.direcao` (sensação, referência, aposta, proibido) antes de desenhar.
5. **Wireframe e aprovação** (página inteira): `wireframe.json` renderizado em SVG cinza, mostrado, pausado. Nada de
   código antes do aceite. Em ajuste de uma seção existente pode pular, dizendo que pula e por quê.
6. **Construa com compromisso total.** Na dúvida entre refinado e comprometido, comprometa-se.
7. **Inspecione e finalize** com o piso de qualidade (`references/piso-de-qualidade.md`) e o checklist
   (`references/checklist.md`), em rodadas limitadas: inspeção única mobile+desktop, correção de tudo, no máximo mais
   uma confirmação, e pare.

## 5. Quando o usuário não escolheu comando

A skill ativa por gatilho de contexto (desenhar, redesenhar, criticar, polir, wireframe, animação, "menos cara de
IA"). Mesmo assim: **sem comando e sem alvo claro, apresente o menu (`/design-help`) e pergunte qual rodar. Nunca
rode um comando sozinho.** Comando que precisa de alvo (arquivo, URL, seção) pergunta pelo alvo em vez de adivinhar.

## 6. Mídia

Imagem, ilustração figurativa, vídeo e qualquer visual gerado seguem a **regra de mídia** do `SKILL.md`: nunca por
modelo Claude; detectar `codex` e `gemini`, perguntar qual usar, e delegar a geração à `schematize-models`. Detalhe
em `references/imagens.md`.
