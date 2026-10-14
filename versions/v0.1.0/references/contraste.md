# Contraste · o piso 2

Destilado de um estudo que acumulou **sete reincidências em produção** do mesmo defeito. Nenhuma foi erro
de gosto: todas passaram por revisão visual e só apareceram quando alguém mediu.

## A armadilha de origem

Copiar a paleta de cinzas de um sistema de referência dá um site elegante e inacessível.

Medido com `scripts/checar-contraste.mjs`, sobre os três fundos claros do sistema:

| Cor | Papel no sistema de referência | `#ffffff` | `#fbfbfd` | `#f5f5f7` | AA 4.5:1 |
|---|---|---|---|---|---|
| `#1d1d1f` | texto principal | 16.83 | 16.28 | 15.46 | passa |
| `#6e6e73` | secundário | 5.07 | 4.91 | **4.66** | passa raspando |
| `#86868b` | terciário | 3.62 | 3.51 | **3.33** | **reprova** |

`#86868b` é o cinza da legenda, do preço, da nota de rodapé e do disclaimer. Nesses usos ele
reprova. Só passaria como texto grande (≥24px, ou ≥18.66px bold), que não é o uso real dele.

> Os números desta tabela foram medidos com `scripts/checar-contraste.mjs` contra os fundos listados. Versões
> antigas citavam `3.25` e `4.55`, que batem com um fundo ~`#f2f2f4` fora da paleta. **Os vereditos não mudam.**

### Substitutos aprovados

Escureça um degrau, não invente paleta. A diferença visual é quase imperceptível.

| Token | Hex | Sobre `#ffffff` |
|---|---|---|
| `ink1` | `#1d1d1f` | 16.83 |
| `ink2` | `#5f5f65` | 6.25 |
| `ink3` | `#67676c` | 5.62 (o `#6e6e73` clássico passa em 5.07, mas cai para 4.38 sobre o hover `#eeeef0`) |

Três níveis de hierarquia, todos passando.

### Duas exceções que já mordem

- **Sobre faixa escura o problema some.** `#86868b` sobre `#1d1d1f` dá 4.65 e passa.
  Mas sobre `#2c2c2e` dá 3.85 e **reprova**. Escuro não é um fundo só.
- **Superfície de hover nasce depois da paleta.** `#6e6e73` passou contra `#fff`, `#fbfbfd` e
  `#f5f5f7`, e caiu para **4.38** quando um hover de linha `#eeeef0` entrou no CSS.
  Corolário: **a lista de fundos tem que sair do CSS final, não ser digitada no começo.**

## A cor de marca precisa de dois valores

A armadilha irmã, e a mais fácil de passar batido: **a mesma cor serve como texto e como
preenchimento de botão, e são dois testes diferentes.**

Caso real (cor de marca magenta de uma loja):

| Cor | Como texto | Com branco em cima | Veredito |
|---|---|---|---|
| `#a8608f` (a da marca) | 3.98 | 4.44 | reprova nos dois |
| `#9b5583` | 4.69 | 5.22 | passa nos dois |

Um botão de acento com rótulo branco costuma ser o **pior contraste da página inteira**, e ninguém
olha, porque "é a cor da marca". Reincidiu em vários projetos (um azul `#179cd6` deu 3.10 com rótulo branco; um vermelho `#d9534f` deu 4.34).

`checar-contraste.mjs` testa os dois papéis automaticamente quando recebe um `wireframe.json`.

## Estado interativo é superfície nova

Nenhum auditor pega isso, porque todos varrem a página em repouso.

O instinto vindo de sistemas de referência é **clarear no hover** (`#0071e3` → `#0077ed`). Com rótulo claro em
cima, clarear o fundo **derruba** o contraste, justo no estado em que a pessoa vai clicar:
4.54 em repouso, **4.18** no hover. Escurecer (`#0064c8`, 5.56) resolve e continua lendo como
resposta ao toque.

`:hover`, `:focus`, `:active`, selecionado, desabilitado — **cada um é uma combinação nova.**

## Degradê: o pior caso e o mais invisível

Um degradê tem contraste variável, então testar "a cor de fundo" não significa nada. Testa-se a
**parada mais clara**.

O rodapé de uma loja, com texto branco sobre
`linear-gradient(118deg, #0c1423, #614173, #d9678b, #ffb881)`, dá **1.69:1** na ponta pêssego, e é
exatamente ali que ficam o e-mail e o WhatsApp.

Correção que preserva a identidade, sem tocar as paradas:

```css
background-image:
  linear-gradient(rgba(12,20,35,.5), rgba(12,20,35,.5)),   /* scrim */
  linear-gradient(118deg, #0c1423 2%, #614173 51%, #d9678b 74%, #ffb881 98.9%);
```

Use o **menor** scrim que passa (aqui, 50%). Acima disso você só apaga a marca de graça.

## Nunca use opacidade em utilitário de texto

`text-ink-3/85` sobre branco compõe para `#848488`, que é praticamente o `#86868b` já reprovado.
`text-white/88` compila para `oklab(...)` e quebra o auditor.

Cor sólida (`text-[#dcdcde]`) dá o mesmo resultado visual e é auditável. Casos reais: preço riscado
em 2.76:1, contador `rgba(255,255,255,.24)` sobre `#0071e3` compondo para 3.20 com rótulo branco.

## O auditor precisa ser auditado

Cinco variantes de auditor mentiroso, todas em produção. O padrão:
**número absurdo e repetido = auditor quebrado, não site quebrado.** E pior:
**número plausível e errado = ninguém desconfia.**

| Variante | Sintoma | Correção |
|---|---|---|
| não entende degradê | `1.04` para tudo sobre o degradê | declarar a parada mais clara de cada degradê |
| pula elemento em silêncio | `0 reprovações` que parece aprovação | **reportar quantos não foram parseados** |
| `fillRect` sobre canvas sujo | `1.02`, `1.25` repetidos | `clearRect` antes do `fillStyle` |
| regex em `oklab()` | um número só, plausível, errado | **nunca leia cor com regex, use canvas** |
| mede no meio da transição de tema | cores dos dois temas no mesmo relatório | `await sleep(400)` após trocar o tema |

Decodificador universal de cor:

```js
const cvs = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
cvs.clearRect(0, 0, 1, 1);          // limpa de verdade — fillRect compõe, não substitui
cvs.fillStyle = corComputada;       // aceita oklab, color-mix, lab, hwb
cvs.fillRect(0, 0, 1, 1);
const [r, g, b, a] = cvs.getImageData(0, 0, 1, 1).data;
```

**Teste de mutação é obrigatório e leva um minuto:** devolva a cor reprovada ao token, confirme que
o auditor acusa, e só então confie no verde. Auditor que nunca falhou não provou nada. Quando a
mutação falha, desconfie do harness antes do CSS.

## Os dois níveis de auditoria

`scripts/checar-contraste.mjs` é **auditoria de paleta**. Ele pega a cor de marca errada, o cinza
terciário e o botão com rótulo branco, antes de existir código. É rápido e é o piso.

Ele **não substitui auditar o DOM renderizado**, porque o CSS ganha superfícies que a paleta não
tinha (foi assim que o `#eeeef0` derrubou o `#6e6e73`), e porque opacidade, herança e fundo composto
só existem no DOM. Para página em produção, rode o auditor Playwright com as cinco correções acima.

## Uso

```bash
node scripts/checar-contraste.mjs "#a8608f" "#ffffff"      # um par
node scripts/checar-contraste.mjs wireframe.json           # todos os tokens + o botão
node scripts/checar-contraste.mjs assets/tokens.css        # varre as cores do arquivo
```

Sai com código 1 se algum par reprovar AA de texto normal, e sugere o substituto mais próximo
dentro da mesma família.
