---
description: schematize-design — carrega à força TODO o corpo normativo de design (filosofia, modos, piso, recusas, animação, tokens, pipeline, builds, mídia, revisão) e passa a aplicá-lo.
---
Carregue **agora** o corpo normativo da skill `schematize-design`. A partir daqui, nesta sessão, isto **não é
opcional**. Não trabalhe de memória: os números (escala, contraste, easings, durações) estão nos arquivos.

1. **Leia na íntegra** `references/*.md` da skill (`.claude/skills/schematize-design/references/` no projeto ou
   `~/.claude/skills/schematize-design/references/` global):
   - `filosofia-e-gosto.md`, `modos-e-fluxo.md`, `piso-de-qualidade.md`, `recusas-anti-ai-slop.md` (inclui a tabela
     de **conflitos entre as fontes**, já resolvidos);
   - `animacao.md`, `tokens-tipografia-cor.md`, `contraste.md`, `componentes.md`, `secoes.md`, `icones.md`;
   - `pipeline.md`, `leitura-de-imagem.md`, `wireframe-spec.md`, `do-zero.md`;
   - `build-html.md`, `build-nextjs.md`, `build-liquid.md`;
   - `imagens.md` (**regra de mídia**), `review.md`, `comandos.md`, `checklist.md`.
2. **Aplique daqui em diante** os pisos do `SKILL.md`, em especial a **regra de mídia**: imagem gerada nunca por
   modelo Claude; detectar `codex` e `gemini` (`scripts/detectar-geradores.sh`), perguntar qual usar, delegar à
   `schematize-models`.
3. Confirme em até três linhas o que carregou. Não rode nenhum comando por conta própria.
