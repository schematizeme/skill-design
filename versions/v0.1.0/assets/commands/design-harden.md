---
description: schematize-design — deixa a UI pronta para produção (estados, i18n, onboarding, adaptação a telas, desempenho de UI); argumentos estados, i18n, onboard, adapt, optimize
argument-hint: "<estados | i18n | onboard | adapt | optimize>"
---
Método em `references/comandos.md` (seção `/design-harden`).

Argumento: $ARGUMENTS

**Sem argumento:** liste os cinco e pergunte qual.

- `estados`: vazio, carregando (esqueleto), erro com saída, sucesso, desabilitado, texto longo, zero e mil itens.
- `i18n`: tradução maior que o original, RTL, formatos de data e número, nada chumbado.
- `onboard`: primeiro uso, estados vazios, ativação.
- `adapt`: 375 a 1440, toque, teclado, hover só atrás de `(hover: hover)`.
- `optimize`: **meça** desempenho de UI (imagens, fontes, movimento, CLS); a correção de CWV é da `schematize-web`
  (`schematize-web → references/performance.md`).

Entregue a tabela Before / After / Why (`references/review.md`). Teste com conteúdo real, não com "Lorem ipsum".
