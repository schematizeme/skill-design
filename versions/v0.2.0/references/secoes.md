# Seções: catálogo e ordem

## A ordem que converte

Ordem de landing de produto, no espírito de um site de produto bem resolvido:

1. **hero** com a promessa e o preço (se houver)
2. **destaques**: três a quatro provas curtas, não features
3. **bento de features** com hierarquia real de tamanho
4. **scroll fixo do recurso estrela**: a única seção cara da página (candidata natural ao momento autoral)
5. **specs**: a tabela para quem já decidiu
6. **comparação**: qual é o certo para você
7. **prova**: depoimento, logo cloud, um número dentro de uma frase
8. **faixa de compra**: repete o CTA do hero, **mesma palavra**
9. **footer de confiança**: razão social, endereço, contato

Não é obrigatória. É o default de onde se desvia **com motivo escrito** na `nota` da seção.

Regras que atravessam:

- **um CTA focal por tela**, cor de acento só no clicável;
- o CTA do fim usa **exatamente a mesma palavra** do CTA do hero;
- a página alterna `fundo` e `superficie` para dar ritmo, nunca duas faixas coloridas seguidas;
- a ordem muda com o **modo**: em Ler, o conteúdo vem primeiro e a navegação lateral ajuda; em Operar, a ordem é a da
  tarefa, não a do funil (`references/modos-e-fluxo.md`).

## Biblioteca de seções prontas

Antes de construir uma seção, olhe se o projeto já tem uma equivalente (tema existente, design system do cliente,
seções de projetos anteriores). **Reconstruir uma seção que já existe é o desperdício mais comum.** Padrões
recorrentes que merecem componente reutilizável:

| Seção | O que é |
|---|---|
| Mapa da jornada | paradas conectadas por rota SVG animada |
| Mapa mental | nó central com ramos radiais |
| Carrossel interativo | coverflow com arrasto e pontos de navegação |
| FAQ accordion | expansão fluida, ícone que gira |
| Preços | três planos, alternância mensal e anual |
| Card com inclinação 3D | cards que seguem o cursor em perspectiva (usar com moderação, é "efeito") |
| Marquee de depoimentos | filas em direções opostas (cuidado: letreiro rolando é recusa em geral) |
| Logo cloud | grade de logos em cinza, cor no hover |

Ao trazer uma seção de outro projeto: troque a fonte pelo sistema tipográfico do projeto, os breakpoints por
734/1068/1440 e ícones de biblioteca crus por ícones do conjunto do projeto (`references/icones.md`). O resto do
código serve como está.

## Mapeamento layout para seção

| Seção | `layout` típico | Densidade |
|---|---|---|
| hero | `split` ou `centro` | `airy` |
| destaques | `faixa` ou `grid` 3 | `normal` |
| bento | `bento` 3 colunas | `normal` |
| recurso estrela | `media-full` | `airy` |
| specs | `empilhado`, largura `texto` | `densa` |
| comparação | `grid` 2 ou 3 | `normal` |
| prova | `faixa` (logos) ou `grid` 3 | `normal` |
| faixa de compra | `centro`, fundo `superficie` | `airy` |
| footer | `grid` 4, fundo `escuro`, largura `full` | `densa` |

## Copy

- Headline carrega o **benefício**. O número vai para a sublinha.
- **Sem eyebrow (kicker) sobre título.** O título se sustenta sozinho. Metadado funcional que o título não pode
  carregar (categoria e data de artigo, "Novo", versão) é a única exceção e exige `nota` no wireframe.
- Preço com parcela: `A partir de R$ X ou R$ Y/mês`.
- **Zero travessão.** Ponto, vírgula, dois-pontos ou `·`.
- Frase de CTA é verbo na primeira pessoa do desejo: `Quero a franquia`, não `Saiba mais`.
- Número de prova entra dentro de uma frase que o contextualize; não monte faixa de "métricas-herói".

## Quando cortar

Se a página passa de nove seções, uma delas está repetindo argumento. Corte antes de construir: seção cortada no
wireframe custa um campo de JSON, seção cortada depois custa um componente.
