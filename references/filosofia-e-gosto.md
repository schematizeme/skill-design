# Filosofia e gosto

A tese desta skill cabe em três frases. Gosto é instinto treinado, não preferência pessoal. Os detalhes que
ninguém nota somam o que todo mundo sente. Beleza é alavanca: num mercado em que todo software é "bom o
bastante", o acabamento é o que diferencia.

Este arquivo reúne a filosofia das três fontes da skill (ver `THIRD_PARTY_NOTICES.md` na raiz do repositório e a
seção Créditos do `SKILL.md`). Onde elas discordam, a decisão da casa está em `references/recusas-anti-ai-slop.md`,
seção "Conflitos entre as fontes".

## 1. Gosto é treinado

Bom gosto não é "eu prefiro assim". É a capacidade de enxergar além do óbvio e reconhecer o que eleva. Treina-se
olhando muito trabalho bom, perguntando por que algo parece certo e praticando sem pausa.

Em prática, ao construir UI:

- não pare em "funciona". Pergunte por que as melhores interfaces dão a sensação que dão;
- faça engenharia reversa: inspecione a animação, o espaçamento, o estado de foco de um produto que você admira;
- seja curioso com o que parece pequeno (um raio de canto, um atraso de 40 ms, um tracking de -0.02em);
- sem referência, o modelo cai no mediano do treino. Busque referência real antes de desenhar
  (`references/do-zero.md`) e escreva a direção antes de abrir o editor.

## 2. Detalhes invisíveis se acumulam

A maioria dos detalhes o usuário nunca percebe conscientemente, e é esse o objetivo: quando a coisa funciona
exatamente como a pessoa presume, ela segue em frente sem pensar. Cada decisão dos outros arquivos existe porque a
soma de pequenas corretudes invisíveis produz uma interface que as pessoas amam sem saber dizer por quê.

Lista de onde mora o invisível (todos viram item de checagem em `references/piso-de-qualidade.md`):

- o estado que ninguém vê até acontecer (vazio, erro, carregando, texto longo, tradução maior que o original);
- o foco de teclado e a seleção de texto na paleta do produto;
- numerais tabulares onde há coluna de números;
- o atraso do primeiro tooltip e a ausência de atraso do segundo;
- o que acontece quando o gesto é interrompido no meio.

## 3. Beleza é alavanca

Pessoas escolhem ferramenta pela experiência inteira, não só pela função. Bons padrões e boa animação são
diferencial real, e beleza é subutilizada em software. Use-a como alavanca para se destacar, nunca como camada final
de enfeite.

## 4. Direção de arte, não complacência

Abordar todo trabalho como diretor de arte premiado: código de produção, criatividade de ponta, ponto de vista
claro, entendimento real do cliente e do usuário, acabamento impecável. Solução segura e tímida é falha.

Princípios operacionais:

- **Vá até o fim.** A entrega é completa, exceto os assets que só o usuário pode fornecer.
- **Pense grande e ousado.** Trabalho distinto, bonito, que inspire. Na dúvida entre refinado e comprometido,
  comprometa-se.
- **Verifique em rodadas limitadas.** Construa tudo, inspecione uma vez (mobile e desktop juntos), corrija tudo de
  uma vez, confirme no máximo mais uma vez e pare. Inspeção infinita é procrastinação.
- **O briefing manda.** Estética, época, materiais, fontes e paletas definidas pelo cliente ou pela marca são
  respeitadas mesmo quando parecem um padrão saturado. Desviar um briefing claro para o seu gosto é falha.
- **Refinar preserva; redesenhar substitui.** Refinamento mantém identidade, comportamento e copy. Redesenho mantém
  a verdade do produto e o conteúdo, mas trata o visual antigo como antirreferência. Nunca fique no meio do caminho.
- **Autoridade visual é evidência.** Antes de criar, levante o que já existe (tema, CSS, tokens, fontes, cores,
  logos, páginas anteriores, site-mãe). Isso define o mundo visual. Se existe site-mãe, ele é a referência, não um
  estilo genérico.

## 5. Os quatro princípios de interface

Herdados do padrão inspirado no HIG da Apple para web, e válidos em qualquer modo:

1. **Clareza.** Conteúdo primeiro, um foco por tela.
2. **Deferência.** A interface se retira; o conteúdo é o protagonista.
3. **Profundidade.** Camadas suaves, nunca pesadas.
4. **Espaço como recurso.** Respiro generoso. Na dúvida entre duas opções, escolha a que tira coisa da tela.

## 6. Os princípios de componente amado

Vêm de como bibliotecas de componentes apreciadas são construídas:

1. A experiência de quem integra é a chave: configuração mínima, atrito baixo.
2. Bons padrões valem mais que opções: entregue bonito de fábrica.
3. Nome cria identidade.
4. Trate caso de borda de forma invisível (pausar timer com a aba oculta, preencher o vão entre itens empilhados para
   manter o hover, capturar o ponteiro no arrasto).
5. Transição, não keyframe, em UI dinâmica (transição é interrompível).
6. Documentação que dá vontade de tocar.

## 7. Coesão de personalidade

O movimento e o visual combinam com a personalidade do componente e da página. Um app lúdico pode ser mais
saltitante; um painel profissional é nítido e rápido. Seja coerente: uma linguagem de movimento por produto.

## 8. Revisar com olhos descansados

Revise no dia seguinte, em câmera lenta ou quadro a quadro. Defeito de timing que passou despercebido ao vivo
aparece a 0.2x. Isso vale para animação (ver `references/animacao.md`) e para a página inteira
(`references/review.md`).

## 9. Subtração

Refino é subtração e disciplina, não mais coisa na tela. Quase todo "front feio" é falta de espaço, hierarquia
tímida, acento espalhado ou ícone mal resolvido. Corrija esses quatro antes de procurar efeito novo.
