# Tokens: tipografia, cor, espaço, profundidade, movimento

Valores concretos de um sistema inspirado no HIG da Apple para web, com as correções de contraste já aplicadas.
CSS pronto em `assets/tokens.css`. Contraste em `references/contraste.md` (leia antes de trocar qualquer cor).
Princípios em `references/filosofia-e-gosto.md`; o que recusar em `references/recusas-anti-ai-slop.md`.

Esse é **um** mundo visual (sóbrio, neutro, um acento), adequado a briefings no estilo HIG, a produtos cuja interface
deve sumir e aos modos Operar e Ler. Para Persuadir e Experienciar com identidade própria, mantenha a **estrutura**
dos tokens (papéis, escala, medidas, contraste) e substitua os **valores** pela direção escrita em `meta.direcao`.

## Tipografia

### A voz tipográfica é uma decisão

| Situação | Voz |
|---|---|
| Operar, Ler, produto cuja interface deve sumir, briefing no estilo HIG | pilha de sistema, **por decisão registrada** |
| Persuadir e Experienciar com marca própria | fonte de display escolhida e licenciada (OFL ou comprada), servida do próprio domínio |
| Existe site-mãe | a fonte dele |

Pilha de sistema (renderiza a SF nativa em aparelho Apple, **0 KB**):

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

**SF Pro não pode ser servida por `@font-face`: a licença da Apple proíbe.** Fallback livre: Inter (OFL). Se usar
Inter, replique o comportamento do display com `letter-spacing` negativo nos tamanhos grandes (o Safari faz essa
troca sozinho com a pilha de sistema). SF Pro Text abaixo de 20pt, SF Pro Display acima.

Monoespaçada só para código, dado, ID, terminal e numeral tabular. Nunca como voz de título ou rótulo.

### Pesos
400 corpo; **600 (semibold) para títulos**; 700 quase nunca. Se tudo está em 700, é template.

### Escala

| Papel | `font-size` | `line-height` | `letter-spacing` |
|---|---|---|---|
| Display / h1 | `clamp(40px, 5.5vw, 80px)` | 1.05 | `-0.035em` |
| h2 | `clamp(32px, 3.6vw, 48px)` | 1.08 | `-0.03em` |
| h3 | `clamp(21px, 2vw, 28px)` | 1.15 | `-0.02em` |
| Sublinha | `clamp(19px, 1.6vw, 24px)` | 1.35 | `-0.01em` |
| Corpo | `17px` (16px abaixo de 744px) | 1.47 | `0` |
| Legenda | `14px` | 1.4 | `0` |

Limites duros: **display no máximo 96px (6rem)**; **tracking nunca abaixo de -0.04em**; corpo com tracking `0`.
Direção editorial pode subir o display até 96px, não além. Medida de linha 65 a 75 caracteres. Corpo em **degraus**
(16px no mobile, 17px a partir de 744px): corpo fluido oscila nos tamanhos intermediários. Títulos com
`text-wrap: balance`; parágrafos longos com `text-wrap: pretty`.

## Cores

### Claro
| Papel | Hex |
|---|---|
| fundo | `#ffffff` |
| off-white | `#fbfbfd` |
| superfície / faixa | `#f5f5f7` |
| divisória | `#d2d2d7` |
| texto | `#1d1d1f` (**nunca `#000`**) |
| secundário | `#5f5f65` |
| terciário | `#67676c` |

O cinza terciário "clássico" `#86868b` **reprova AA** como texto pequeno (3.62 sobre branco, 3.33 sobre `#f5f5f7`).
Não use. Ver `references/contraste.md`.

### Escuro
| Papel | Hex |
|---|---|
| fundo | `#000000` (ou off-black `#09090B`) |
| superfície | `#1d1d1f` |
| elevada | `#2c2c2e` |
| texto | `#f5f5f7` |
| secundário | `#c7c7cc` |
| terciário | `#a1a1a6` |

### Ação
| Papel | Hex |
|---|---|
| link (texto) | `#0066cc` |
| botão (preenchimento) | `#0071e3` |
| hover do botão | `#0064c8` (**escurece**; clarear derruba o contraste do rótulo) |
| azul no escuro | `#2997ff`, com rótulo **escuro** `#1d1d1f` |

**Cor de acento é rara e só no que é clicável.** Uma landing inteira em neutro com um acento é o padrão; cinco cores
não são este sistema. O acento sai do **assunto** (verde de gramado, azul de água, terracota de tijolo), nunca do
roxo estatístico do treino.

### Regras de cor que atravessam
- **Superfície colorida:** texto secundário tinge-se com o matiz da superfície. Nunca cinza neutro sobre fundo
  colorido.
- **Neutros** levam leve tint do acento em vez de cinza morto. Neutro quente (bege, creme) é escolha com motivo
  no assunto, não reflexo.
- **OKLCH é o formato de autoria** (Chrome 111+, Safari 15.4+, Firefox 113+, ~93 a 95% dos usuários; Tailwind v4 usa
  internamente). HEX vira formato de compatibilidade. Ressalva: OKLCH em utilitário de texto com alpha quebra
  auditor de contraste. **Autore em OKLCH, entregue token de texto em cor sólida.**
- Nunca opacidade em texto (`text-ink/85`): compõe para cor imprevisível e some do auditor.
- Claro ou escuro pelo **contexto de uso**, não pela categoria.

## Espaço

Base **8px**; tudo é múltiplo.

| Medida | Valor |
|---|---|
| container de texto | `688px` |
| container de conteúdo | `980px` |
| container full | `1440px` |
| padding de seção | `clamp(64px, 8vw, 120px)` (direção editorial: 120 a 200px) |
| gap entre blocos (airy) | `32px` |
| gap entre blocos (normal) | `24px` |
| gap entre blocos (densa) | `16px` |

O padding de seção é o que mais diferencia "profissional" de "template". Varie a densidade por seção.

## Profundidade

Sombras **muito** sutis: se você vê a sombra, está forte demais.

```css
--sombra-sutil: 0 1px 2px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.05);
--sombra-card:  0 2px 4px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.06);
--hairline:     inset 0 0 0 1px rgba(0,0,0,.08);
```

**Hairline de 1px para separação estática**; sombra em camadas (com deslocamento) só para elevação real.

Nav de vidro, **só quando há conteúdo rolando por baixo**:

```css
background: rgba(255,255,255,.72);
backdrop-filter: saturate(180%) blur(20px);
-webkit-backdrop-filter: saturate(180%) blur(20px);
```

### Raios
`12px` pequeno; `18px` card; `28px` card grande; **`980px` pílula** (botão). Não use o mesmo raio em tudo. Raio
aninhado: `raio_interno = raio_externo - padding`.

## Movimento

Tokens e regras completas em `references/animacao.md`. Resumo:

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease:        ease;
--dur-rapida:  150ms;   /* feedback */
--dur-padrao:  250ms;   /* UI */
--dur-lenta:   560ms;   /* reveal de marketing, teto 600ms */
```

Reveal padrão: fade + subida de 24px (marketing) ou 8 a 16px (UI), `IntersectionObserver`, `threshold: .15`, stagger
de 60ms, `unobserve` depois de revelar, estado oculto só sob `.js-anima`. Sempre `prefers-reduced-motion`, com o
conteúdo visível nesse ramo.

## Responsividade

Mobile-first. Breakpoints: **734 · 1068 · 1440**. Alvo de toque **mínimo 44px**. Imagens com `srcset` e
`aspect-ratio` declarado (evita salto de layout, que é CWV, que é SEO). Nav colapsa para overlay acessível com foco
preso e fechamento por Esc.

## Copy

**Nenhum travessão** (`—`, `–`, `--`) em texto de usuário final. Ponto, vírgula, dois-pontos ou o bullet `·`.
Headline carrega o **benefício**; o número vai para a sublinha. Preço com parcela: `A partir de R$ X ou R$ Y/mês`.
Botão diz a ação em primeira pessoa do desejo: "Quero a franquia", não "Saiba mais".
