# Build · HTML único autocontido

`meta.stack: "html"`. Um arquivo `.html` que abre com duplo clique. Sem build, sem npm, sem CDN
obrigatório. É o formato mais portátil para protótipo, campanha e seção colável em tema.

## Quando usar

Landing de campanha, seção para colar num tema, protótipo para o cliente ver, link para WhatsApp.
Qualquer coisa que precise sobreviver sem deploy.

## Esqueleto

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Título da página</title>
<meta name="description" content="Uma frase, 150 a 160 caracteres.">
<style>
:root{
  --fundo:#fff; --superficie:#f5f5f7; --texto:#1d1d1f; --texto-sec:#6e6e73;
  --borda:#d2d2d7; --acento:#0071e3; --acento-hover:#0064c8;
  --raio:18px; --raio-pill:980px;
  --container:980px; --container-texto:688px;
  --ease-out:cubic-bezier(.23,1,.32,1);
  --pad-secao:clamp(64px,8vw,120px);
  --fonte:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:var(--fonte);font-size:16px;line-height:1.47;
     color:var(--texto);background:var(--fundo);-webkit-font-smoothing:antialiased}
@media (min-width:744px){body{font-size:17px}}
section{padding:var(--pad-secao) 24px}
.container{max-width:var(--container);margin-inline:auto}
.container-texto{max-width:var(--container-texto);margin-inline:auto}
h1{font-size:clamp(40px,5.5vw,80px);line-height:1.05;letter-spacing:-.035em;font-weight:600;margin:0}
h2{font-size:clamp(32px,3.6vw,48px);line-height:1.08;letter-spacing:-.03em;font-weight:600;margin:0}
img{max-width:100%;height:auto;display:block}
/* O conteudo e visivel por padrao. O estado oculto so existe sob .js-anima (ver o script). */
.js-anima .revelar{opacity:0;transform:translateY(24px);
  transition:opacity 560ms var(--ease-out),transform 560ms var(--ease-out)}
.js-anima .revelar.visivel{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;
                       scroll-behavior:auto!important}
  .js-anima .revelar{opacity:1;transform:none}
}
</style>
</head>
<body>
  <!-- uma <section id="..."> por secao do wireframe, na mesma ordem -->
<script>
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
document.documentElement.classList.add('js-anima');
const io=new IntersectionObserver((es)=>{
  es.forEach((e,i)=>{
    if(!e.isIntersecting)return;
    e.target.style.transitionDelay=(i*60)+'ms';
    e.target.classList.add('visivel');
    io.unobserve(e.target);
  });
},{threshold:.15,rootMargin:'0px 0px -10% 0px'});
document.querySelectorAll('.revelar').forEach(el=>io.observe(el));
}
</script>
</body>
</html>
```

## Regras

- **Um `<section id>` por seção do wireframe, na mesma ordem.** O `id` sai do `secao.id`.
- CSS num único `<style>` no `<head>`. JS num único `<script>` antes de `</body>`.
- **Zero dependência de rede obrigatória.** Se usar Google Fonts ou Lucide, a página tem que
  continuar legível sem eles. Com `fonte: "system"` no wireframe, não carregue fonte nenhuma.
- Imagens: `<picture>` com `srcset`, `aspect-ratio` declarado no CSS (evita layout shift),
  `loading="lazy"` em tudo abaixo da dobra e `decoding="async"`.
- Formulário sem back-end: `wa.me` com mensagem pré-preenchida, ou `mailto:`. Formulário que envia dado a terceiro
  de verdade exige endpoint do próprio projeto, com validação no servidor (`schematize-web → references/seguranca.md`).

## Imagens de preview

Se existir `./imagens.json` (ver `imagens.md`), cada bloco `media` sai assim:

```html
<div class="ph" data-ph="foto: a casa inteira">
  <img src="imagens/01-hero.jpg" alt="" data-provisorio
       loading="lazy" decoding="async" width="1600" height="900">
</div>
```

```css
.ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit}
.ph:has(img)::after{display:none}          /* some com o rotulo quando ha foto */

/* SCRIM vai em ::before, NUNCA em ::after.
   A regra acima tem especificidade maior que qualquer `.minha-foto::after`, e
   leva o scrim junto: o texto branco fica sobre a foto sem camada escura, e o
   defeito nao aparece em auditoria de paleta porque o fundo e uma imagem.
   z-index porque ::before pinta antes do <img> e precisa ficar por cima. */
.hero-foto::before{
  content:"";position:absolute;inset:0;z-index:1;
  background:linear-gradient(to top,rgba(0,0,0,.62),rgba(0,0,0,0) 68%);
}
```

- **`data-provisorio` em toda imagem de preview.** É o que impede a foto de ir ao ar por descuido,
  e o `/design-audit` exige que `grep -c data-provisorio` dê 0 antes de publicar.
- `width`/`height` reais no atributo, os do `imagens.json`: sem layout shift.
- `alt=""` enquanto for provisória. Alt de verdade entra com a foto de verdade.
- O `data-ph` **fica** no HTML: se a imagem não carregar, o rótulo volta a aparecer.
- `loading="lazy"` em tudo **abaixo da dobra**. No hero, não: lá é `fetchpriority="high"`.
- No fim do `<body>`, um comentário lista cada imagem com licença, fonte e link.

## Mapeamento dos layouts

| `layout` | CSS |
|---|---|
| `centro` | `display:grid;justify-items:center;text-align:center;gap:var(--gap)` |
| `empilhado` | `display:grid;gap:var(--gap)` |
| `split` | `display:grid;grid-template-columns:1.08fr 1fr;gap:64px;align-items:center` |
| `split-invertido` | o mesmo, com `direction:rtl` no pai e `ltr` nos filhos, ou `order` |
| `media-full` | `position:relative` + media absoluta + texto em `z-index:1` e **scrim** |
| `grid` | `grid-template-columns:repeat(N,1fr);gap:24px` |
| `bento` | `grid-template-columns:repeat(N,1fr)` + `grid-column:span P` por card |
| `faixa` | `display:flex;justify-content:space-between;align-items:center;gap:32px` |

Todos colapsam para uma coluna abaixo de 734px.

`media-full` **sempre** leva scrim. Texto sobre imagem sem scrim é a reprovação de contraste mais
comum da casa, e o auditor de paleta não pega.

## Peso

Meta: menos de 150 KB sem imagens. Se passou, ou entrou biblioteca demais, ou tem SVG inline
enorme que devia ser arquivo.
