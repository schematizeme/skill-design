# Build · seção Shopify (Liquid)

`meta.stack: "liquid"`. É o formato das seções de tema de loja Shopify (Online Store 2.0).

## Estrutura

Um arquivo em `sections/<secao-id>.liquid`, com três partes: markup, `{% style %}` e `{% schema %}`.

```liquid
{%- comment -%} Gerado de wireframe.json · secao "hero" {%- endcomment -%}

<section id="sec-{{ section.id }}" class="hero-{{ section.id }}">
  <div class="container">
    <h1>{{ section.settings.headline }}</h1>
    {%- if section.settings.sub != blank -%}
      <p class="sub">{{ section.settings.sub }}</p>
    {%- endif -%}
    {%- if section.settings.cta_texto != blank -%}
      <a class="btn" href="{{ section.settings.cta_url }}">{{ section.settings.cta_texto }}</a>
    {%- endif -%}
  </div>
</section>

{% style %}
  #sec-{{ section.id }} { padding: {{ section.settings.pad_top }}px 24px {{ section.settings.pad_bottom }}px; }
  #sec-{{ section.id }} .container { max-width: 980px; margin-inline: auto; }
  #sec-{{ section.id }} h1 { font-size: clamp(40px,5.5vw,80px); line-height:1.05; letter-spacing:-.035em; font-weight:600; margin:0; }
  #sec-{{ section.id }} .btn { display:inline-block; padding:14px 26px; border-radius:980px;
    background:{{ section.settings.acento }}; color:#fff; text-decoration:none; font-weight:600; }
{% endstyle %}

{% schema %}
{
  "name": "Hero",
  "tag": "section",
  "settings": [
    { "type": "text",   "id": "headline",   "label": "Headline", "default": "Headline de beneficio" },
    { "type": "textarea","id": "sub",       "label": "Sublinha" },
    { "type": "text",   "id": "cta_texto",  "label": "Texto do botao" },
    { "type": "url",    "id": "cta_url",    "label": "Link do botao" },
    { "type": "color",  "id": "acento",     "label": "Cor do botao", "default": "#0071e3" },
    { "type": "range",  "id": "pad_top",    "label": "Espaco acima", "min": 0, "max": 160, "step": 8, "default": 96, "unit": "px" },
    { "type": "range",  "id": "pad_bottom", "label": "Espaco abaixo", "min": 0, "max": 160, "step": 8, "default": 96, "unit": "px" }
  ],
  "presets": [{ "name": "Hero" }]
}
{% endschema %}
```

## Regras que o Shopify impõe

- **CSS escopado por `#sec-{{ section.id }}`.** Sem isso, duas instâncias da mesma seção na mesma
  página brigam. É o bug mais comum e o mais difícil de ver.
- `{% schema %}` é **JSON estrito**: sem vírgula sobrando, sem comentário, sem Liquid dentro.
- Todo texto editável vira `setting`. Texto chumbado no markup é retrabalho garantido.
- `blocks` quando a quantidade é variável (cards, depoimentos, FAQ), `settings` quando é fixa.
  No wireframe: `blocos` repetidos com `tipo: "card"` viram `blocks`.
- Imagem: `{{ section.settings.img | image_url: width: 1600 | image_tag: loading: 'lazy', widths: '400,800,1200,1600' }}`.
  Nunca `img_url` (deprecado).
- Cada `range` precisa de `min`, `max`, `step`, `default` e `unit`, e `(max - min)` tem que ser
  divisível por `step`, senão o tema não salva.

## Do wireframe para o schema

| Campo do wireframe | Vira |
|---|---|
| `secao.id` | nome do arquivo e escopo do CSS |
| `secao.densidade` | defaults de `pad_top`/`pad_bottom` (airy 120, normal 88, densa 56) |
| `secao.fundo` | um `color` setting com o default da paleta |
| bloco com `texto` | um `text` ou `textarea` setting |
| bloco `cta` | par `text` + `url` |
| bloco `media` | `image_picker` setting |
| blocos `card` repetidos | um `block` type com os settings internos |

## Imagens de preview

Seção Shopify não recebe arquivo de imagem direto: o cliente sobe pelo `image_picker`. Então o
preview vai num **default do setting**, e o markup aceita os dois caminhos:

```liquid
{%- if section.settings.img != blank -%}
  {{ section.settings.img | image_url: width: 1600 | image_tag:
     loading: 'lazy', widths: '400,800,1200,1600', alt: section.settings.img.alt }}
{%- else -%}
  {%- comment -%} preview: trocar pela foto do cliente antes de publicar {%- endcomment -%}
  <img src="{{ 'preview-hero.jpg' | asset_url }}" alt="" data-provisorio
       loading="lazy" width="1600" height="900">
{%- endif -%}
```

- Suba os arquivos de `./imagens/` para `assets/` do tema, com prefixo `preview-`.
- **`data-provisorio`** só no ramo do preview, nunca no `image_tag` do cliente.
- Nunca `img_url`: está deprecado. `image_url` mais `image_tag`.
- O `alt` do ramo real vem de `image.alt`, que o cliente preenche no admin.

Ao entregar, diga ao cliente que os `preview-*` de `assets/` podem ser apagados.

## Contraste

O `color` setting deixa o cliente escolher qualquer cor, inclusive uma que reprova. Não há como
impedir pelo schema. **Defina um default que passa** e registre o valor aprovado no `wireframe.json` (`tokens`) e no handoff do projeto, para a próxima sessão não
redescobrir.

## Onde isso vive

No tema do cliente. As decisões (cores aprovadas, justificativas) ficam no `wireframe.json` e no handoff.
