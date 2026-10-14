# Build · Next.js App Router

`meta.stack: "nextjs"`. É o formato para sites e landings dentro de um app Next.js. Engenharia de front (RSC, segurança, a11y como piso
técnico, CWV, SEO técnico, testes) é da `schematize-web`; esta reference cobre só o que vem do design.

## Estrutura

```
app/
  layout.tsx            fonte, metadata base, <html lang="pt-BR">
  page.tsx              importa e ordena as secoes do wireframe
  globals.css           tokens + reset
components/
  Hero.tsx              um componente por secao.id, PascalCase
  Bento.tsx
  Faq.tsx
lib/
  reveal.ts             o IntersectionObserver, uma vez
wireframe.json          fica no repo, ao lado do codigo
```

**Um componente por `secao.id`.** `secao.id: "bento-vantagens"` vira `BentoVantagens.tsx` com
`<section id="bento-vantagens">`. Isso é o que faz o wireframe continuar legível depois.

## Server Components por padrão

`"use client"` **só** no componente que precisa de estado ou de evento: carrossel, accordion,
formulário, menu mobile. Hero, bento, specs e footer são server.

O reveal on-scroll precisa de cliente, mas não arraste a seção inteira para o cliente por causa
dele: faça um `<Revelar>` client minúsculo que só envolve os filhos.

```tsx
// components/Revelar.tsx
'use client';
import { useEffect, useRef } from 'react';

export function Revelar({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // movimento reduzido: o conteudo ja e visivel (o estado oculto so existe sob .js-anima)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add('visivel');
      io.unobserve(el);
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <div ref={ref} className="revelar">{children}</div>;
}
```

O estado oculto inicial (`.js-anima .revelar`) só vale se a classe `js-anima` estiver no `<html>` **antes da
primeira pintura**; senão o conteúdo pisca. Ponha um script inline estático no `<head>` do `app/layout.tsx`
(literal fixo, sem dado de usuário, compatível com CSP por nonce ou hash):

```tsx
<script
  dangerouslySetInnerHTML={{
    __html:
      "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-anima')",
  }}
/>
```

Sem JS ou com movimento reduzido, a classe não existe e o conteúdo está visível.

## Tokens

Em `globals.css` como custom properties, **não** em `tailwind.config`. Motivo: utilitário com alpha (`text-ink-3/85`) compila para `color-mix`/`oklab` e quebra auditoria de
contraste. Token sólido em CSS var é medível.

Se usar Tailwind, mapeie as vars para as cores e **nunca use o modificador de opacidade em texto**.

## Fonte

Com `fonte: "system"`, não carregue nada:

```css
--fonte: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

Com fonte de marca, `next/font/google` ou `next/font/local` (self-host, zero layout shift).
Nunca `<link>` para Google Fonts no App Router.

## Imagens

`next/image` com `width`/`height` ou `fill` + `sizes`. `priority` **só** na imagem do hero.
`placeholder="blur"` quando a imagem for local.

`sizes` errado é o defeito de performance mais comum: sem ele o Next serve a maior variante.

### Imagens de preview

Se existir `./imagens.json` (ver `imagens.md`), rode o script com **`--baixar`** e ponha os
arquivos em `public/imagens/`. Hotlink de banco livre não funciona bem aqui: o `next/image`
precisa do domínio liberado em `next.config`, e um domínio remoto a mais é configuração que vai
sobrar depois que a foto real entrar.

```tsx
<Image
  src="/imagens/01-hero.jpg"
  alt=""                       /* alt de verdade entra com a foto de verdade */
  fill
  sizes="100vw"
  priority                     /* só no hero */
  data-provisorio="true"
  style={{ objectFit: 'cover' }}
/>
```

`data-provisorio` passa pelo `next/image` como atributo do `<img>` renderizado, então o gate
`grep -c data-provisorio` do `/design-audit` continua funcionando no HTML servido.

Os créditos vão num comentário em `app/page.tsx`, ou num `<!-- -->` no `layout.tsx` se alguma
licença exigir crédito visível.

## Metadata

```tsx
export const metadata: Metadata = {
  title: '...',
  description: '...',
  alternates: { canonical: 'https://...' },
  openGraph: { images: ['/og.png'] },
};
```

**Se a página precisa rankear, carregue a `schematize-seo`.** Esta skill não governa SEO: o
`o quê e por quê` é lá, incluindo JSON-LD, canonical e a regra de uma intenção por URL.

## Landing dentro de site que já existe

Use **route group** para a landing não herdar o menu do site, e `noindex` para ela não competir
com a página que já ranqueia. Registrado em `Código/Landing sem saidas com route group do Next.js`.

```
app/
  (site)/layout.tsx      com menu
  (landing)/layout.tsx   sem menu, sem saidas
```

## Cuidado de ambiente

Armadilha recorrente de ambiente: **servidor preso numa porta serve HTML de um build com chunks de outro.**
Se a página mudar e o browser não, mate o processo da porta antes de investigar o código.
