# Imagens e a regra de mídia

## Regra de mídia (piso inegociável da casa)

**Imagem gerada, visual gerado e mídia gerada NUNCA saem de um modelo Claude.** Claude é o melhor modelo para
código e um mau gerador de imagem: a qualidade do visual gerado por ele é inversamente proporcional à qualidade do
código que ele escreve, e sai ruim de verdade. Isto vale para foto, ilustração figurativa, arte de hero, textura,
mockup, logo raster, vídeo e áudio.

O procedimento é sempre o mesmo:

1. **Detectar** quais geradores existem na máquina:
   ```bash
   bash scripts/detectar-geradores.sh          # lista codex e gemini no PATH
   bash scripts/detectar-geradores.sh --json
   ```
   Códigos de saída: `0` há pelo menos um gerador; `1` nenhum (não é erro de execução, é o caso que exige o aviso
   abaixo).
2. **Perguntar** à pessoa qual usar (`AskUserQuestion`), listando só os que existem e sempre com a opção
   "nenhum, vou usar banco de imagem ou asset do cliente". Nunca escolher sozinho.
3. **Delegar a execução** da geração à skill `schematize-models` (`schematize-models → /models-image`). Esta skill
   decide **o que** a imagem precisa mostrar (briefing visual: assunto, formato, estilo, onde entra, texto
   alternativo); a `schematize-models` roda o gerador escolhido (`schematize-models → /models-image`; política de
   mídia dela em `schematize-models → references/midia.md`). Se ela não estiver instalada, diga isso e pare no
   briefing. A licença de imagem gerada é **não verificada**: depende dos termos do provedor e do plano da pessoa;
   nunca afirme que é livre para uso comercial.
4. **Nenhum gerador disponível:** avise sem rodeio que visual gerado pelo Claude sai ruim (qualidade inversamente
   proporcional à de código) e ofereça as três saídas:
   - **instalar Codex ou Gemini** (a ferramenta de linha de comando de um deles) e repetir a detecção;
   - **banco de imagem com licença comercial** (`scripts/buscar-imagens.mjs`, abaixo);
   - **asset do cliente** (foto própria, material da marca, site-mãe).

### O que o Claude pode escrever (é código, não imagem gerada)

- **SVG de wireframe** (`scripts/render-wireframe.mjs` gera; é determinístico).
- **SVG de ícone** funcional: sprite de `assets/icones.svg`, traço consistente (`references/icones.md`).
- **SVG estrutural**: diagrama, gráfico de dados, divisória, padrão geométrico, moldura. Tudo o que é descrito por
  uma regra e não por "um desenho bonito".
- **CSS**: gradiente monocromático, grão, máscara, forma.

O que **não** vale como "é só SVG": ilustração figurativa, cena, mascote, retrato, "foto" desenhada em paths, arte de
hero. Isso é visual gerado e cai na regra. Ilustração de placeholder feita de círculos e blocos é, além disso, uma
recusa (`references/recusas-anti-ai-slop.md`).

---

# Imagens de preview de banco com licença

Foto real de banco com licença comercial nos blocos `media`, para a pessoa ver como a página fica em vez de olhar
caixa cinza. É **provisória**. Script: `scripts/buscar-imagens.mjs`.

```bash
node scripts/buscar-imagens.mjs wireframe.json            # hotlink
node scripts/buscar-imagens.mjs wireframe.json --baixar   # salva em ./imagens/
node scripts/buscar-imagens.mjs wireframe.json --licenca=comercial
```

Escreve `./imagens.json` ao lado do wireframe. O builder lê esse arquivo.

---

## A verdade sobre o caminho sem chave

**Leia isto antes de prometer preview bonito à pessoa.**

Sem chave de API, a fonte é o **Openverse** com filtro `license=cc0,pdm`. É legalmente impecável e
**esteticamente ruim**: o acervo de domínio público é de **arquivo**. Scan de museu, gravura do
século 19, foto em preto e branco dos anos 50. Numa página de 2026 isso não parece
preview, parece defeito.

Medido: numa LP de casas modulares, o hero sem chave devolveu, em rodadas sucessivas, um render de
peça de impressora 3D, **um fuzil de assalto**, uma estrada de terra em P&B e um galpão avícola dos
anos 50. Todos legalmente livres. Nenhum serve.

**Nenhum filtro conserta isso**, porque fotografia arquitetônica moderna sob CC0 praticamente não
existe. O script já barra provedor de modelo 3D, assunto perigoso e material de arquivo, e ainda
assim o teto é baixo.

### A solução é uma chave grátis, e leva um minuto

| Banco | Chave | Licença | Crédito |
|---|---|---|---|
| **Pexels** | https://www.pexels.com/api/ | Pexels License, uso comercial livre | não obrigatório |
| **Unsplash** | https://unsplash.com/developers | Unsplash License, uso comercial livre | não obrigatório |

```bash
export PEXELS_API_KEY="sua-chave"       # no perfil do shell, não em arquivo versionado
```

Com a variável no ambiente, o script usa Pexels antes de tudo. A diferença é enorme: catálogo
inteiro de fotografia moderna, e o filtro de orientação funciona de verdade.

**Ordem de tentativa:** Pexels (se houver chave) → Unsplash (se houver chave) → Openverse (sempre)
→ Picsum (último recurso, foto moderna de assunto aleatório).

`source.unsplash.com` **não** é usada: foi desligada e responde 503. Se você viu essa URL em algum
tutorial, está desatualizado.

---

## Licença, que é o ponto todo

"Livre de copyright" tem significado técnico, e errar aqui põe o site do cliente em risco.

| Flag | O que entra | Uso comercial | Crédito |
|---|---|---|---|
| `--licenca=cc0` (default) | CC0, domínio público | livre | **não** obrigatório |
| `--licenca=comercial` | acrescenta CC BY e CC BY-SA | livre | **obrigatório** |

**NonCommercial (`by-nc*`) nunca entra, em nenhum modo.** Site de cliente é uso comercial, e a
resposta crua do Openverse vem cheia de NC: o primeiro resultado de uma busca por "modern house"
veio `by-nc-sa`. Quem pega a API sem filtrar coloca uma licença NC num site pago sem perceber.

`CC BY-SA` tem outra armadilha: é **viral**, contamina obra derivada. Em página de cliente, evite.

Quando alguma imagem exigir crédito, o script avisa no fim e o `imagens.json` marca
`creditoObrigatorio: true`. O build tem que emitir os créditos, e o checklist cobra.

---

## O campo `busca`, e a convenção que não é opcional

Cada bloco `media` do wireframe leva `busca`: o assunto **em inglês**, porque é onde os bancos têm
acervo.

```json
{ "tipo": "media", "formato": "16:9", "busca": "house modern modular exterior" }
```

### Substantivo principal PRIMEIRO

O Openverse casa **todas** as palavras (AND): `"modern minimalist house exterior garden"` devolve
zero, `"modern house"` devolve 240. Então o script encurta o termo até achar acervo.

Encurtar solto é perigoso. `"modern modular house exterior architecture"` encurtou para
`"modern modular"` e trouxe **um fuzil de assalto** para o hero de uma página de casas.

Por isso: **a primeira palavra é a âncora e nunca cai.** Escreva o substantivo na frente.

| Errado | Certo |
|---|---|
| `modern modular house exterior` | `house modern modular exterior` |
| `beautiful forest cabin` | `cabin forest beautiful` |
| `smiling team office` | `office team smiling` |

O script ainda **valida**: o título ou as tags do resultado precisam conter a âncora, senão
descarta. É a rede que pega o fuzil.

---

## Como o build usa

O builder lê `imagens.json` e injeta dentro do placeholder:

```html
<div class="ph" data-ph="foto: a casa inteira">
  <img src="imagens/01-hero.jpg" alt="" data-provisorio
       loading="lazy" decoding="async" width="1600" height="900">
</div>
```

```css
.ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit}
.ph:has(img)::after{display:none}
```

- **`data-provisorio` em toda imagem de preview.** É o que impede a foto de ir ao ar por descuido.
- `width`/`height` reais no atributo: sem layout shift.
- `alt=""` enquanto for provisória. **Alt de verdade entra com a foto de verdade**, porque alt
  descreve a imagem final, e inventar alt para placeholder é pior que não ter.
- O `data-ph` fica no HTML: se a imagem não carregar, o rótulo volta a aparecer.

No fim do `<body>`, um comentário lista cada imagem com licença, fonte e link.

---

## Antes de publicar

```bash
grep -c data-provisorio index.html    # tem que dar 0
```

Imagem de preview **não vai ao ar**. Ela existe para a pessoa e o cliente verem a página respirando,
e para testar o que caixa cinza não testa: scrim sobre foto, contraste de texto sobre imagem,
recorte em `object-fit: cover` nos breakpoints.

Esse último ponto é o valor real da funcionalidade. Contraste de texto sobre foto é a reprovação
mais comum da casa, e `checar-contraste.mjs` não pega, porque o fundo é uma imagem.
