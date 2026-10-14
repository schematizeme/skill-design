# Changelog — schematize-design

Todas as mudanças relevantes deste pacote, no formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
com versionamento [SemVer](https://semver.org/lang/pt-BR/).

## [0.2.0] — 2026-10-14
Description reduzida para o orçamento de listagem do catálogo; sem mudança de piso.

### Alterado
- Description encurtada para ≤190 caracteres (catálogo estourou o orçamento de 9000 com 45 skills), mantendo O QUE + gatilho concreto + divisa com as irmãs.

## [0.1.1] — 2026-10-14
Integração ao catálogo (grafo, skills.json, herdados) e correção do texto de precedência herdado.

### Alterado
- Description reduzida (≤235 chars) para caber no orçamento de listagem de skills (soma ≤8300); mesmo território, fronteiras com as irmãs preservadas.
- Blocos herdados ressincronizados com a `schematize-engineering` v0.27.0 (`tools/sync-herdados.mjs`): orquestração com a regra de imagem (nunca pelo Claude; detecta Codex/Gemini e pergunta ao usuário qual usar, Codex como sugestão) e `schematize overdev delegar` (comando do app) no lugar do falso nome de skill `schematize-overdev`.
- Bloco "Precedência e herança" passa à variante `dominio`: o texto antigo dizia que os comandos `/design-*` "cobrem só o piso da linguagem", o que é falso para skill de domínio/ferramenta.

## [0.1.0] — 2026-10-14
Primeira versão: a superskill de design. Havia três fontes boas e incompatíveis entre si, usadas à mão e uma de cada vez: o pipeline de wireframe da casa (a skill de design anterior da casa, v1.3.1, com scripts e números medidos), a filosofia de polimento e o framework de animação de Emil Kowalski (MIT) e o método de direção de arte do Impeccable v4.4 de Paul Bakaus (Apache 2.0). Três skills coladas dariam três respostas diferentes para a mesma pergunta (easing, kicker, travessão, fonte de sistema); esta funde as três e **resolve os conflitos por escrito**. A fronteira com a `schematize-web` fica explícita: design é direção visual, a web é engenharia de front.

### Adicionado
- `SKILL.md` enxuto (fronteiras, comandos, pisos, regra de mídia, créditos) e 21 `references/` por tema: `filosofia-e-gosto`, `modos-e-fluxo` (Persuadir, Operar, Ler, Experienciar), `piso-de-qualidade` (inclui as 13 alavancas de refino migradas da web), `recusas-anti-ai-slop` (lista unificada e **19 conflitos entre as fontes resolvidos**), `animacao`, `tokens-tipografia-cor`, `contraste`, `componentes`, `secoes`, `pipeline`, `leitura-de-imagem`, `wireframe-spec`, `do-zero`, `build-html`, `build-nextjs`, `build-liquid`, `imagens`, `icones`, `review`, `comandos`, `checklist`.
- 16 comandos `design-*`: os cinco do pipeline (`wire`, `visual`, `build`, `audit`, `help`), os do Impeccable agrupados (`shape`, `critique`, `polish`, `tune`, `animate`, `harden`, `variants`) e `load`, `claude`, `handoff`, `cc`. Comando sem alvo ou sem argumento **pergunta; nunca roda sozinho**.
- **Regra de mídia (piso inegociável):** imagem/visual/mídia gerada nunca por modelo Claude. `scripts/detectar-geradores.sh` detecta `codex` e `gemini` no PATH (exit 0 há ao menos um, 1 nenhum); a skill PERGUNTA qual usar e delega a execução à `schematize-models` (`/models-image`); sem gerador, avisa sem rodeio e oferece instalar Codex/Gemini, banco com licença comercial ou asset do cliente. SVG de wireframe, de ícone e estrutural é código e é permitido.
- 6 scripts, todos com `*.test.sh` de casos vermelhos: `render-wireframe.mjs` (20 casos), `checar-contraste.mjs` (22), `auditar-dom.mjs` (19, a parte com Chrome é pulada e dita como pulada se não houver Chrome), `buscar-imagens.mjs` (15, offline) e `buscar-referencias.mjs` (20, offline), `detectar-geradores.sh` (12). A parte de rede dos dois buscadores não é testável offline e está documentada nos cabeçalhos dos testes.
- `THIRD_PARTY_NOTICES.md` com o texto integral da MIT (Emil Kowalski) e da Apache 2.0 (Impeccable) e o aviso de modificações "condensado, adaptado e fundido em 2026-10-14"; anexado também ao `LICENSE` para viajar no zip da release.

### Decisões (conflitos entre as fontes, resumo; a tabela completa está em `references/recusas-anti-ai-slop.md` §6)
- **Easing:** ease-out forte `cubic-bezier(.23,1,.32,1)` para entrada, saída e feedback; `ease-in` vetado em UI; a curva `.4,0,.2,1` do pipeline foi aposentada como default.
- **Estado inicial de entrada:** o conteúdo é visível por padrão; o `opacity: 0` inicial só existe sob `.js-anima` (classe posta por JS quando o movimento pode rodar). O reveal antigo escondia o conteúdo sem JS.
- **Kicker (eyebrow):** proibido como rótulo sobre título; exceção só para metadado funcional com `nota`. O renderer de wireframe passou a **recusar** `eyebrow` sem `nota` e **card dentro de card**.
- **Travessão:** zero em copy (a regra da casa engloba a do Impeccable). **Monoespaçada:** só para código, dado, ID, terminal. **Display:** teto de 96px e tracking de -0.04em (a receita de 120px foi aposentada). **Contador animado e halo radial:** removidos.
- **Fonte de sistema:** aceita por decisão registrada (HIG, Operar, Ler); em Persuadir e Experienciar, a voz de display é escolhida e licenciada. SF Pro continua proibida por `@font-face`.

### Segurança dos scripts (revisados por inteiro antes de entrarem)
- `buscar-referencias.mjs --extrair` recusa protocolo que não seja http(s), destino local ou privado (localhost, 127/8, 10/8, 172.16/12, 192.168/16, 169.254/16, IPv6 local) e não segue redirecionamento; `--tag` é escapado.
- `buscar-imagens.mjs`: chaves só do ambiente e só para o próprio host; download só https com teto de 20 MB; nome de arquivo sanitizado (o `secao.id` do wireframe virava caminho).
- `auditar-dom.mjs`: nomes de temporário aleatórios e remoção no `finally` e nos sinais; `pathToFileURL` (URL de arquivo portável entre Windows e Linux, em vez de concatenar `file:///`); substituição por função (um `$&` no HTML da página corrompia a cópia); **exit 2** quando nada foi medido (Chrome ausente ou quebrado nunca vira aprovação).
- `checar-contraste.mjs`: exit 2 quando não deu para verificar; wireframe sem bloco `tokens` mede os defaults em vez de falhar.

### Removido
- A "Initial Response" do material do Emil (a frase fixa de abertura), que não cabe numa superskill.
- Nomes de clientes, caminhos de máquina e referências a cofre/vault da skill de origem; "Apple" como nome da skill e como marca no texto de produto (resta "padrão inspirado no HIG da Apple para web" como descrição de referência).
