# Componentes · HTML + CSS prontos

Copiáveis. Usam as vars de `assets/tokens.css`. Todos já passam AA. Movimento segue `references/animacao.md`.

## Botão pílula

```html
<a class="btn" href="#form">Quero a franquia</a>
<a class="btn btn-sec" href="#como">Ver como funciona</a>
```

```css
.btn{display:inline-flex;align-items:center;justify-content:center;
  min-height:44px;padding:13px 24px;border-radius:var(--raio-pill);
  background:var(--acento);color:#fff;font-weight:600;font-size:17px;
  text-decoration:none;border:0;cursor:pointer;
  transition:background 150ms var(--ease),transform 160ms var(--ease-out)}
.btn:hover{background:var(--acento-hover)}          /* ESCURECE. clarear derruba o contraste */
.btn:active{transform:scale(.97)}
.btn:focus-visible{outline:3px solid var(--acento);outline-offset:3px}
.btn-sec{background:transparent;color:var(--acento);
  box-shadow:inset 0 0 0 1px var(--borda)}
.btn-sec:hover{background:var(--superficie)}
```

`min-height:44px` não é enfeite, é o alvo de toque mínimo.

## Nav de vidro

```html
<header class="nav">
  <div class="nav-in">
    <a class="marca" href="/">Marca</a>
    <nav aria-label="Principal"><a href="#a">Item</a><a href="#b">Item</a></nav>
    <a class="btn" href="#form">Quero a franquia</a>
    <button class="hamb" aria-expanded="false" aria-controls="menu" aria-label="Abrir menu">
      <span></span><span></span>
    </button>
  </div>
</header>
```

```css
.nav{position:sticky;top:0;z-index:50;
  background:rgba(255,255,255,.72);
  backdrop-filter:saturate(180%) blur(20px);
  -webkit-backdrop-filter:saturate(180%) blur(20px);
  border-bottom:1px solid rgba(0,0,0,.06)}
.nav-in{max-width:var(--container-full);margin-inline:auto;
  display:flex;align-items:center;gap:24px;padding:0 24px;height:56px}
.nav nav{margin-left:auto;display:flex;gap:28px}
.nav nav a{color:var(--texto-sec);text-decoration:none;font-size:14px}
.nav nav a:hover{color:var(--texto)}
.hamb{display:none}
@media (max-width:733px){
  .nav nav{display:none} .hamb{display:grid;gap:5px;background:none;border:0;
    min-width:44px;min-height:44px;place-content:center}
  .hamb span{display:block;width:20px;height:1.5px;background:var(--texto)}
}
```

Vidro **só aqui**. Espalhado pela página é marcador de IA.

## Card

```css
.card{background:var(--fundo);border-radius:var(--raio-card);padding:28px;
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);
  transition:transform 250ms var(--ease-out),box-shadow 250ms var(--ease-out)}
@media (hover:hover) and (pointer:fine){
  .card:hover{transform:translateY(-2px);
    box-shadow:inset 0 0 0 1px rgba(0,0,0,.12),0 12px 32px rgba(0,0,0,.06)}
}
```

Hairline em vez de sombra difusa. A sombra (com deslocamento) só aparece no hover, e discreta. **Card dentro de
card nunca**; grade de 3 cards iguais de ícone + título + texto não é estrutura de página (ver
`references/recusas-anti-ai-slop.md`).

## Bento com hierarquia real

```css
.bento{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.bento .span-2{grid-column:span 2}
@media (max-width:1067px){.bento{grid-template-columns:repeat(2,1fr)}}
@media (max-width:733px){.bento{grid-template-columns:1fr}.bento .span-2{grid-column:auto}}
```

`span-2` sai do `peso` do bloco no wireframe. **Bento sem variação de tamanho é só um grid**, e
grid de três cards iguais está no anti-manual.

## FAQ accordion

```html
<details class="faq">
  <summary>Pergunta<span class="chev" aria-hidden="true"></span></summary>
  <div class="faq-corpo"><p>Resposta.</p></div>
</details>
```

```css
.faq{border-bottom:1px solid var(--borda)}
.faq summary{display:flex;justify-content:space-between;align-items:center;gap:16px;
  padding:22px 0;cursor:pointer;font-weight:600;font-size:19px;list-style:none;min-height:44px}
.faq summary::-webkit-details-marker{display:none}
.faq .chev{width:10px;height:10px;border-right:1.5px solid var(--texto-sec);
  border-bottom:1.5px solid var(--texto-sec);transform:rotate(45deg);flex:none;
  transition:transform 250ms var(--ease-out)}
.faq[open] .chev{transform:rotate(-135deg)}
.faq-corpo{padding-bottom:22px;color:var(--texto-sec);max-width:65ch}
```

`<details>` nativo: teclado, leitor de tela e busca do navegador funcionam de graça.
Para animar a altura sem tocar `height`, use `display:grid` com `grid-template-rows` indo de `0fr` a `1fr` e
`overflow:hidden` no filho; respeite `prefers-reduced-motion`.

## Formulário

```css
.campo{display:grid;gap:7px;margin-bottom:16px}
.campo label{font-size:14px;color:var(--texto-sec)}
.campo input,.campo select,.campo textarea{
  min-height:52px;padding:14px 16px;font:inherit;color:var(--texto);
  background:var(--fundo);border:1px solid var(--borda);border-radius:12px;width:100%}
.campo input:focus-visible{outline:3px solid var(--acento);outline-offset:1px;border-color:var(--acento)}
.erro{color:#b3261e;font-size:14px}     /* 5.9:1 sobre branco */
```

Label sempre visível. Placeholder como rótulo reprova contraste e some ao digitar.

## Media com scrim

```css
.media-full{position:relative;display:grid;place-items:center;min-height:520px;overflow:hidden}
.media-full img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.media-full::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.45)}
.media-full .conteudo{position:relative;z-index:1;color:#fff;text-align:center;
  max-width:var(--container-texto);padding:0 24px}
```

**Nunca texto sobre imagem sem scrim.** Use o menor valor que passa (comece em `.45` e meça).

## Reveal

```css
.js-anima .revelar{opacity:0;transform:translateY(24px);
  transition:opacity 560ms var(--ease-out),transform 560ms var(--ease-out)}
.js-anima .revelar.visivel{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.js-anima .revelar{opacity:1;transform:none;transition:none}}
```

JS em `references/build-html.md`. O `unobserve` depois de revelar é obrigatório, e o conteúdo é visível sem a classe
`js-anima` (sem JS, ou com movimento reduzido).
