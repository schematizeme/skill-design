# Revisão: formato, severidade e o que a máquina não vê

Vale para `/design-critique`, `/design-audit`, `/design-visual` e para qualquer pedido de "revise esta UI". O formato é
um só, para o resultado ser comparável entre revisões.

## 1. Formato obrigatório: uma tabela Before / After / Why

Ao revisar código de UI, a saída **tem** de ser uma única tabela markdown com as colunas `Before | After | Why`, uma
linha por problema encontrado. Nunca uma lista com "Before:" e "After:" em linhas separadas. A coluna `Why` explica o
raciocínio em uma frase e **começa com a severidade** entre colchetes: `[grave]`, `[médio]` ou `[polimento]`. Ordene
as linhas da mais grave para a menos grave.

| Before | After | Why |
| --- | --- | --- |
| `transition: all 300ms` | `transition: transform 200ms var(--ease-out)` | [médio] Especifique as propriedades; `all` anima o que não devia e custa layout |
| `transform: scale(0)` | `transform: scale(.95); opacity: 0` | [polimento] Nada no mundo real surge do nada |
| `ease-in` num dropdown | `ease-out` com curva forte | [médio] `ease-in` arrasta o início; `ease-out` dá resposta instantânea |
| botão sem `:active` | `transform: scale(.97)` no `:active` | [polimento] Botão precisa sentir o toque |
| `transform-origin: center` num popover | `transform-origin: var(--transform-origin)` | [polimento] Popover nasce do gatilho (modal fica centralizado) |
| texto `#86868b` sobre `#fff` (3.62:1) | `#67676c` (5.62:1) | [grave] Reprova AA como texto pequeno |
| `<span>☎</span>` como ícone | `<svg class="i"><use href="#i-telefone"/></svg>` | [médio] Caractere muda de desenho por plataforma |

Quando o achado não é código (estrutura, hierarquia, copy), a coluna `Before` descreve o estado atual e `After` o
estado proposto, ambos concretos ("três cards iguais de ícone + título + texto" para "um card de 2 colunas com a prova
principal e dois menores").

Regras do formato:

- **Separe o que está quebrado do que dá para melhorar.** `[grave]` é bloqueio; `[médio]` entra na entrega;
  `[polimento]` é opcional. Misturar os dois faz a pessoa tratar tudo como opinião.
- **Número medido quando houver** (razão de contraste, px de alvo, ms de duração). Achado sem número onde cabia número
  é opinião.
- **Um número absurdo e repetido é o auditor quebrado, não o site.** Confira um caso na mão antes de mandar corrigir.
- **Não corrija em silêncio.** Revisão entrega a tabela; aplicar é um passo seguinte, pedido ou confirmado.

## 2. Notas por heurística (`/design-critique`)

Antes da tabela, de 1 a 5 linhas com nota de 0 a 4 em cada heurística, uma frase de motivo cada:

| Heurística | Pergunta |
|---|---|
| Hierarquia | o olho sabe onde pousar primeiro, segundo, terceiro? |
| Clareza | em 5 segundos, dá para dizer o que é e o que fazer? |
| Carga cognitiva | há escolha, texto ou elemento a mais do que a tarefa pede? |
| Consistência | mesmo componente, mesma aparência e comportamento? |
| Acessibilidade | contraste, foco, alvo, movimento reduzido, semântica |
| Voz | a copy soa como o produto, ou como template? |
| Cara de IA | quantos itens de `references/recusas-anti-ai-slop.md` por omissão (não por briefing)? |

Fecha com **os três melhores acertos** (o que preservar) e **a ordem de ataque** dos achados.

## 3. O que a máquina mede e o que não mede

`scripts/auditar-dom.mjs` mede o DOM renderizado em 375, 500, 744, 1068 e 1440px. `scripts/checar-contraste.mjs`
mede a paleta. Nenhum dos dois acha feiura.

| Achado do auditor de DOM | Peso |
|---|---|
| `OVERFLOW`, `TEXTO-CORTADO`, `SEM-SCRIM`, `IMG-QUEBRADA` | grave |
| `ALVO` (toque abaixo de 44px), `ICONE-GLIFO`, `IMG-SEM-DIMENSAO`, `H1`, `SEM-ALT`, `SEM-LANG`, `SEM-META-DESCRIPTION` | médio |
| `PROVISORIAS` (imagem de preview ainda na página) | aviso |

O auditor já isenta o que é legítimo: item fora de vista em carrossel, link inline em prosa (WCAG 2.5.8) e `.sr-only`.
Código de saída: `0` sem grave, `1` com grave, `2` não deu para medir (nunca aprovação).

**Tire screenshot em pelo menos duas larguras e olhe.** Use Chrome headless com `--force-prefers-reduced-motion`,
senão metade da página sai apagada esperando o reveal. Para ver uma seção do meio, faça uma cópia temporária com
`display:none` nas de cima (âncora de fragmento não rola no headless).

```
chrome --headless --disable-gpu --hide-scrollbars --force-prefers-reduced-motion \
  --window-size=1440,1100 --screenshot=topo.png --virtual-time-budget=10000 file:///...
```

## 4. A lista do que quase sempre dá para melhorar (`/design-visual`)

Percorra olhando, e proponha só o que tem motivo:

- **Densidade uniforme.** Se toda seção tem o mesmo respiro, a página não tem hierarquia (`airy` no hero e na
  conversão, `densa` em nav, faixa e rodapé).
- **Raio uniforme.** Botão é pílula, card não.
- **Nenhuma quebra de grade.** Um elemento que sai de propósito muda a página inteira.
- **Título pequeno demais.** O erro mais comum. Display de landing vive em `clamp(40px, 5.5vw, 80px)`, com tracking
  negativo (teto 96px).
- **Cinza secundário sem hierarquia.** Três níveis de texto, não dois.
- **CTA do fim que não repete a palavra do hero.**
- **Foto genérica** ou caixa cinza onde devia haver produto real.
- **Ícone de biblioteca cru** em página de marca.
- **Movimento sem propósito:** se a animação sumir e a página comunicar igual, ela é enfeite.
- **Mais de um momento autoral.**

## 5. Teste de mutação (obrigatório em auditoria de contraste)

Devolva uma cor reprovada ao token, confirme que o auditor acusa, e só então confie no verde. Auditor que nunca falhou
não provou nada. Se a mutação passar, desconfie do harness antes do CSS (`references/contraste.md`).

## 6. Rodadas

Uma inspeção (mobile e desktop juntos), correção de tudo de uma vez, no máximo uma confirmação, e pare. Item `[grave]`
que falha continua bloqueando; não vira ressalva na mensagem de entrega.
