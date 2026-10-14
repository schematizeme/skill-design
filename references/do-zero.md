# Construir do zero, sem referência

Quando não há comp, não há site-mãe e não há imagem. Só um briefing.

**O erro a evitar tem nome:** sem referência, o modelo cai no mediano do treino. É de onde vêm o
gradiente roxo, os três cards idênticos e a headline centralizada que o `recusas-anti-ai-slop.md` cataloga.
Não é falta de capricho, é a gravidade estatística. O jeito de escapar é **decidir de propósito**,
por escrito, antes de desenhar.

---

## Passo 1 · Buscar referência de verdade, em vez de lembrar

```bash
node scripts/buscar-referencias.mjs
node scripts/buscar-referencias.mjs --tag=fintech
node scripts/buscar-referencias.mjs --extrair=https://site-que-interessou.com
```

Puxa One Page Love e Minimal Gallery, que são as duas galerias curadas com feed aberto
(verificado: Awwwards, Land-book e Lapa Ninja bloqueiam). Sai nome, URL e as tags com que a
galeria classificou cada site, mais os padrões mais frequentes do momento.

**A lista não é o design.** Abra três ou quatro e olhe. Depois `--extrair=` num deles para ler
paleta, tipografia e raios.

Galerias que exigem abrir na mão: `awwwards.com/websites` · `land-book.com` · `godly.website` ·
`lapa.ninja` · `siteinspire.com` · `curated.design` · `mobbin.com` (padrões de mobile).

---

## Passo 2 · Escrever a direção antes de desenhar

Quatro linhas, no `meta` do wireframe. Sem elas você vai improvisar, e improviso converge para o
mediano.

```json
"direcao": {
  "sensacao": "oficina de precisão, não startup",
  "referencia": "https://... (o que foi olhado)",
  "aposta": "tipografia grande e foto crua, sem ilustração",
  "proibido": "gradiente, card com sombra, ícone genérico"
}
```

O campo **`proibido`** é o que mais trabalha. Escrever "sem gradiente" antes de começar vale mais
que apagar gradiente depois.

### Como achar a sensação

Pergunte à pessoa por **contraste**, não por adjetivo. "Mais perto de um relógio suíço ou de uma
loja de tinta?" produz resposta útil. "Que estilo você quer?" produz "moderno e limpo".

---

## Passo 3 · Escolher a estrutura pelo que a página faz

| A página existe para | Estrutura |
|---|---|
| vender um produto único | hero com preço · specs · prova · faixa de compra |
| captar lead de serviço | hero com região e promessa · como funciona · prova local · formulário |
| apresentar empresa | manifesto · o que fazemos · trabalhos · gente · contato |
| lançar um app | o problema em uma tela · o recurso estrela em scroll · planos · FAQ |
| portfólio | trabalho primeiro, sempre. Sobre depois. Contato no fim |

A ordem completa que converte está em `secoes.md`. É o default de onde se desvia **com motivo
escrito na `nota`**.

---

## O que os sites premiados têm em comum

Destilado de olhar galeria, não de teoria. São seis coisas, e nenhuma é efeito.

### 1. Uma decisão tipográfica forte, e só uma
Título muito maior do que parece confortável (`clamp(48px, 7vw, 96px)`, teto de 96px), com **tracking negativo**
e entrelinha apertada (1.0 a 1.05). O resto da página é discreto. Sites premiados quase nunca têm
duas famílias brigando: têm uma família e uma exceção deliberada.

### 2. Espaço negativo em quantidade que assusta
Padding de seção de 120 a 200px, não 64. É o item que mais separa "profissional" de "template", e
o mais fácil de copiar.

### 3. Uma quebra de grade, proposital
Tudo alinhado, e **um** elemento que sai do alinhamento de propósito: uma foto que sangra, um
número que invade a margem, um bloco deslocado. Grade perfeita em tudo lê como gerado.

### 4. Foto crua, não stock
Fotografia real com grão, ou nenhuma foto. Stock genérico é pior que caixa cinza.
Ver `imagens.md`.

### 5. Movimento que acompanha o scroll, não que dispara sozinho
`scrub`, não `autoplay`. O usuário controla o ritmo. Ver `animacao.md`.

### 6. Paleta curta
Dois neutros e um acento. Sites premiados quase nunca têm cinco cores.

**O que NÃO copiar deles:** cursor customizado, preloader de porcentagem, scroll hijacking e
WebGL pesado. Ganham prêmio e perdem conversão, e três deles estão no `recusas-anti-ai-slop.md`.

---

## Passo 4 · Paleta do zero

1. **Escolha o neutro primeiro**, não o acento. Off-black `#09090B` ou neutro quente `#F8F5F1`
   decidem a página inteira. Ver `recusas-anti-ai-slop.md`.
2. **Um acento só**, e tire do assunto: verde de gramado, azul de água, terracota de tijolo.
   Acento que não tem relação com o produto é decoração.
3. **Meça antes de usar**, nos quatro papéis:
   ```bash
   node scripts/checar-contraste.mjs wireframe.json
   ```
   `acento` (preenchimento) · `acentoRotulo` (texto em cima) · `acentoBorda` (filete, se o acento
   for claro) · `acentoTexto` (link em prosa). Ver `contraste.md`.
4. **Nunca roxo/índigo por default.** Se o projeto pede roxo, ótimo. Se você chegou nele sem
   decidir, é o mediano do treino falando.

---

## Passo 5 · Copy do zero

Copy genérica é o marcador de IA mais forte e o menos notado.

| Não escreva | Escreva |
|---|---|
| "Soluções completas para o seu negócio" | "Sessenta dias da fábrica à chave na mão" |
| "Qualidade e excelência" | "Preço fechado em contrato, sem aditivo" |
| "Transforme sua presença digital" | o que o cliente ganha, com número |

Regra prática: **se a frase serve para outra empresa, apague.** Headline carrega o benefício, o
número vai para a sublinha. E zero travessão.

Sem informação real do cliente, escreva a **intenção** no `texto` do wireframe e marque em
`meta.suposicoes`. Inventar número é pior que deixar em branco.

---

## Passo 6 · O resto é o pipeline normal

Wireframe, SVG, aprovação, build, auditoria. Construir do zero muda a **entrada**, não o processo.

E declare em `meta.origem`:

```json
"origem": "sem referencia, direcao escrita a partir do briefing"
```

Assim, seis meses depois, dá para saber se aquela página foi decidida ou herdada.
