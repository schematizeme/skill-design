#!/usr/bin/env node
/**
 * buscar-imagens.mjs · schematize-design
 *
 * Preenche os blocos `media` do wireframe com fotos reais de BANCO com licenca
 * (Pexels, Unsplash, Openverse), para a pessoa ver como a pagina fica de verdade em
 * vez de olhar caixa cinza.
 *
 * ISTO NAO GERA IMAGEM. Imagem gerada nunca sai de modelo Claude: ver a regra de midia
 * em references/imagens.md e scripts/detectar-geradores.sh.
 *
 * SEGURANCA: as chaves PEXELS_API_KEY e UNSPLASH_ACCESS_KEY so vem do ambiente e so sao
 * enviadas aos proprios hosts (api.pexels.com, api.unsplash.com). Download so de https,
 * com limite de tamanho, e o nome do arquivo e sanitizado (sem path traversal).
 *
 *   node scripts/buscar-imagens.mjs wireframe.json
 *   node scripts/buscar-imagens.mjs wireframe.json --baixar
 *   node scripts/buscar-imagens.mjs wireframe.json --licenca=comercial
 *
 * Escreve ./imagens.json ao lado do wireframe. Com --baixar, salva os arquivos
 * em ./imagens/ e aponta para eles.
 *
 * LICENCA, que e o ponto todo:
 *   --licenca=cc0 (default)  CC0 e dominio publico. Uso comercial livre,
 *                            SEM obrigacao de creditar. E o que "livre de
 *                            copyright" quer dizer de verdade.
 *   --licenca=comercial      inclui CC BY e CC BY-SA. Uso comercial permitido,
 *                            mas creditar passa a ser OBRIGATORIO, e o BY-SA
 *                            ainda contamina obra derivada.
 *
 *   NUNCA busca NonCommercial (by-nc*). Site de cliente e uso comercial, e a
 *   primeira resposta crua do Openverse vem cheia delas.
 *
 * Fontes, na ordem em que sao tentadas:
 *   1. Pexels    se PEXELS_API_KEY estiver no ambiente (melhor qualidade)
 *   2. Unsplash  se UNSPLASH_ACCESS_KEY estiver no ambiente
 *   3. Openverse sem chave nenhuma (default, sempre disponivel)
 *   4. Picsum    ultimo recurso: foto real, assunto aleatorio
 *
 * source.unsplash.com NAO e usado: foi desligada e responde 503.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

/* ---------- cli ---------- */

const args = process.argv.slice(2);
const entrada = args.find((a) => !a.startsWith('-'));
const baixar = args.includes('--baixar');
const licArg = (args.find((a) => a.startsWith('--licenca=')) || '').split('=')[1] || 'cc0';

if (!entrada) {
  console.error('uso: node scripts/buscar-imagens.mjs <wireframe.json> [--baixar] [--licenca=cc0|comercial]');
  process.exit(2);
}
if (!['cc0', 'comercial'].includes(licArg)) {
  console.error(`--licenca aceita "cc0" ou "comercial", recebi "${licArg}"`);
  process.exit(2);
}

const base = dirname(resolve(entrada));

/** Nome de arquivo seguro: sem separador, sem '..', so [a-z0-9._-]. */
function nomeSeguro(s) {
  const limpo = String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]+/g, '-').replace(/\.{2,}/g, '.').replace(/^[-.]+|[-.]+$/g, '');
  return limpo.slice(0, 60) || 'imagem';
}

const LIMITE_BYTES = 20 * 1024 * 1024;

/**
 * Nome de saida derivado da entrada, pela mesma regra de sufixo do wireframe:
 * dois projetos no mesmo diretorio nao podem sobrescrever o imagens.json um do
 * outro.   wireframe.json -> imagens.json e imagens/01-hero.jpg
 *          lawnbuster.wireframe.json -> lawnbuster.imagens.json
 *                                       e imagens/lawnbuster-01-hero.jpg
 */
const prefixo = (entrada.split(/[\\/]/).pop() || '')
  .replace(/\.json$/i, '')
  .replace(/wireframe/i, '')
  .replace(/^[-._]+|[-._]+$/g, '')
  .replace(/[^A-Za-z0-9._-]+/g, '-');

const arquivoSaida = join(base, prefixo ? `${prefixo}.imagens.json` : 'imagens.json');
let wf;
try {
  wf = JSON.parse(readFileSync(entrada, 'utf8'));
} catch (e) {
  console.error(`JSON invalido em ${entrada}: ${e.message}`);
  process.exit(2);
}

/* ---------- coleta dos blocos media ---------- */

const RAZAO = { '16:9': 16 / 9, '4:3': 4 / 3, '1:1': 1, '3:4': 3 / 4, preencher: 16 / 9 };

function alvos(wf) {
  const out = [];
  const anda = (blocos, secao) => {
    for (const b of blocos ?? []) {
      if (b.tipo === 'media') {
        out.push({
          secao: secao.id,
          termo: b.busca || termoDe(b, secao),
          formato: b.formato || '16:9',
          nota: b.nota || '',
          temBusca: Boolean(b.busca),
        });
      }
      if (b.blocos) anda(b.blocos, secao);
    }
  };
  for (const s of wf.secoes ?? []) anda(s.blocos, s);
  return out;
}

// Sem o campo `busca`, cai num termo generico derivado do id. Funciona, mas o
// resultado e pior: o campo existe justamente para o modelo escrever o assunto
// em ingles, que e onde os bancos tem acervo.
function termoDe(b, secao) {
  const limpo = String(secao.rotulo || secao.id).replace(/[-_]+/g, ' ');
  return limpo;
}

const lista = alvos(wf);
if (!lista.length) {
  console.error('nenhum bloco "media" no wireframe');
  process.exit(2);
}

const semBusca = lista.filter((a) => !a.temBusca).length;

/* ---------- fontes ---------- */

const PEXELS = process.env.PEXELS_API_KEY;
const UNSPLASH = process.env.UNSPLASH_ACCESS_KEY;

async function json(url, opts) {
  const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function orientacaoDe(formato) {
  const r = RAZAO[formato] ?? 16 / 9;
  if (r > 1.2) return 'landscape';
  if (r < 0.85) return 'portrait';
  return 'square';
}

async function viaPexels(termo, formato) {
  const o = orientacaoDe(formato);
  const u = `https://api.pexels.com/v1/search?query=${encodeURIComponent(termo)}&per_page=5&orientation=${o}`;
  const j = await json(u, { headers: { Authorization: PEXELS } });
  const f = (j.photos ?? [])[0];
  if (!f) return null;
  return {
    url: f.src.large2x || f.src.large,
    autor: f.photographer,
    autorUrl: f.photographer_url,
    licenca: 'Pexels License',
    creditoObrigatorio: false,
    fonte: 'pexels',
    pagina: f.url,
    largura: f.width,
    altura: f.height,
  };
}

async function viaUnsplash(termo, formato) {
  const o = orientacaoDe(formato);
  const u = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(termo)}&per_page=5&orientation=${o}`;
  const j = await json(u, { headers: { Authorization: `Client-ID ${UNSPLASH}` } });
  const f = (j.results ?? [])[0];
  if (!f) return null;
  return {
    url: f.urls.regular,
    autor: f.user.name,
    autorUrl: f.user.links.html,
    licenca: 'Unsplash License',
    creditoObrigatorio: false,
    fonte: 'unsplash',
    pagina: f.links.html,
    largura: f.width,
    altura: f.height,
  };
}

/**
 * O Openverse casa TODAS as palavras da consulta (AND). "modern minimalist house
 * exterior garden" devolve zero; "modern house" devolve 240. Entao a busca
 * encurta o termo ate achar acervo, em vez de desistir.
 *
 * MAS encurtar solto e perigoso. "modern modular house exterior architecture"
 * encurtado para "modern modular" devolveu um FUZIL de assalto do acervo CC0
 * do Wikimedia, e foi parar no hero de uma pagina de casas. Por isso:
 *
 *   - a ANCORA e a primeira palavra do termo, e ela NUNCA cai;
 *   - por isso a convencao e escrever `busca` com o substantivo principal
 *     na frente: "house modern modular exterior", nao o contrario.
 */
function ancoraDe(termo) {
  return (termo.trim().split(/\s+/)[0] || '').toLowerCase();
}

function escadaDeTermos(termo) {
  const p = termo.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return [];
  const ancora = p[0];
  const resto = p.slice(1);
  const out = [];
  for (let n = resto.length; n >= 1; n--) out.push([ancora, ...resto.slice(0, n)].join(' '));
  out.push(ancora);                       // a ancora sozinha, nunca menos que isso
  return [...new Set(out)];
}

/**
 * Assuntos que nao podem aparecer numa pagina de marketing por acidente.
 * O acervo livre e generalista: uma busca inocente cai em arma, acidente ou
 * conteudo medico com facilidade.
 */
const ASSUNTOS_VETADOS = /\b(gun|rifle|firearm|weapon|pistol|ammo|ammunition|carbine|assault|military|soldier|war|corpse|autopsy|surgery|wound|nude|nsfw|porn|drug|syringe)\b/i;

/**
 * O acervo de dominio publico e dominado por material de ARQUIVO: gravura do
 * seculo 19, litografia, scan de museu, foto historica em preto e branco.
 * Tudo legalmente perfeito e esteticamente errado numa pagina de 2026: a
 * primeira rodada devolveu uma estrada de terra em P&B para o hero de uma
 * pagina de casas modulares. Isto empurra o resultado para foto moderna.
 */
const NAO_E_FOTO_MODERNA = new RegExp(
  '\\b(' +
  'vintage|antique|retro|historic(al)?|archive|archival|' +
  'engraving|lithograph|etching|woodcut|drawing|sketch|painting|illustration|' +
  'poster|postcard|manuscript|map|diagram|blueprint|clipart|icon|logo|' +
  '1[6-9]\\d0s?|circa|c\\.\\s?1[6-9]|19[0-5]\\d|' +
  'century|museum|collection of|plate\\s?\\d' +
  ')\\b', 'i');

// URLs ja entregues nesta rodada. Tres cards com o mesmo termo tem que receber
// tres fotos diferentes, e rodar o indice nao basta: quando a lista de
// candidatos e curta, o modulo volta para a primeira.
const urlsUsadas = new Set();

/**
 * O Openverse nao indexa so banco de fotos. Estes provedores servem render de
 * modelo 3D, clipart e captura de tela, e uma busca por "modern modular house"
 * devolve alegremente o render de um suporte de impressora 3D chamado
 * MODULAR_HOTBED_SUPPORT. Nao e foto, e nao serve de preview.
 */
const PROVEDORES_RUINS = new Set([
  'thingiverse', 'sketchfab', '3dwarehouse', 'thorvaldsensmuseum',
  'phylopic', 'clipart', 'openclipart', 'svgsilh',
]);

async function openverseBusca(termo, filtro, formato, ancora) {
  const u = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(termo)}&page_size=20&${filtro}`;
  const j = await json(u, { headers: { 'User-Agent': 'schematize-design/0.1 (skill de wireframe)' } });
  const alvo = orientacaoDe(formato);

  const bons = (j.results ?? []).filter((r) => {
    const l = String(r.license || '').toLowerCase();
    if (l.includes('nc')) return false;                 // NonCommercial nunca, e ponto
    if (!r.url) return false;
    if (urlsUsadas.has(r.url)) return false;            // sem foto repetida na mesma pagina
    if (PROVEDORES_RUINS.has(String(r.provider || '').toLowerCase())) return false;
    // sem dimensao declarada nao da para saber se e foto ou miniatura de 200px
    if (!r.width || !r.height) return false;
    if (r.width < 1000) return false;

    const descricao = [r.title, (r.tags || []).map((t) => t.name || t).join(' ')].join(' ');
    // a rede de seguranca que faltava: o assunto tem que aparecer no resultado.
    // Sem isto, "modern modular" devolve um fuzil e ninguem percebe ate abrir a pagina.
    if (ancora && !new RegExp('\\b' + ancora.replace(/[^\w]/g, '') + '', 'i').test(descricao)) return false;
    if (ASSUNTOS_VETADOS.test(descricao)) return false;
    if (NAO_E_FOTO_MODERNA.test(descricao)) return false;
    return true;
  });
  if (!bons.length) return null;

  // orientacao filtrada aqui, nao na consulta: o parametro aspect_ratio do
  // Openverse zera resultado com frequencia e nao vale o acervo que custa
  const ordenados = bons.slice().sort((a, b) => {
    const o = (r) => {
      if (!r.width || !r.height) return 9;
      const razao = r.width / r.height;
      const cls = razao > 1.2 ? 'landscape' : razao < 0.85 ? 'portrait' : 'square';
      return cls === alvo ? 0 : 1;
    };
    return o(a) - o(b) || (b.width || 0) - (a.width || 0);
  });

  const f = ordenados[0];   // ja filtrado contra urlsUsadas, o primeiro e inedito
  urlsUsadas.add(f.url);
  const l = String(f.license).toLowerCase();
  return {
    url: f.url,
    autor: f.creator || 'desconhecido',
    autorUrl: f.creator_url || f.foreign_landing_url,
    licenca: `CC ${String(f.license).toUpperCase()}${f.license_version ? ' ' + f.license_version : ''}`,
    licencaUrl: f.license_url,
    creditoObrigatorio: !(l === 'cc0' || l === 'pdm'),
    fonte: `openverse/${f.provider || '?'}`,
    pagina: f.foreign_landing_url,
    largura: f.width,
    altura: f.height,
  };
}

async function viaOpenverse(termo, formato) {
  // cc0,pdm = dominio publico, sem obrigacao de credito.
  // license_type=commercial = inclui BY e BY-SA, credito obrigatorio.
  const filtros = licArg === 'cc0'
    ? ['license=cc0,pdm']
    : ['license=cc0,pdm', 'license_type=commercial'];

  const ancora = ancoraDe(termo);

  for (const filtro of filtros) {
    for (const t of escadaDeTermos(termo)) {
      try {
        const r = await openverseBusca(t, filtro, formato, ancora);
        if (r) {
          if (t !== termo) r.termoUsado = t;
          return r;
        }
      } catch (e) {
        console.error(`  openverse "${t}": ${e.message}`);
      }
    }
  }
  return null;
}

function viaPicsum(termo, formato) {
  const r = RAZAO[formato] ?? 16 / 9;
  const w = 1600;
  const h = Math.round(w / r);
  const seed = encodeURIComponent(termo.slice(0, 24).replace(/\s+/g, '-'));
  return {
    url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
    autor: 'aleatorio',
    licenca: 'Unsplash License (via Lorem Picsum)',
    creditoObrigatorio: false,
    fonte: 'picsum',
    pagina: 'https://picsum.photos',
    largura: w,
    altura: h,
    assuntoAleatorio: true,
  };
}

async function buscar(termo, formato) {
  const tentativas = [];
  if (PEXELS) tentativas.push(['pexels', () => viaPexels(termo, formato)]);
  if (UNSPLASH) tentativas.push(['unsplash', () => viaUnsplash(termo, formato)]);
  tentativas.push(['openverse', () => viaOpenverse(termo, formato)]);

  for (const [nome, fn] of tentativas) {
    try {
      const r = await fn();
      if (r) return r;
      console.error(`  ${nome}: sem resultado para "${termo}"`);
    } catch (e) {
      console.error(`  ${nome}: ${e.message}`);
    }
  }
  console.error(`  caindo para picsum (assunto aleatorio) em "${termo}"`);
  return viaPicsum(termo, formato);
}

/* ---------- download opcional ---------- */

/**
 * A extensao TEM que sair do conteudo, nao da URL.
 * O rawpixel serve WebP numa URL que termina em .jpg. Salvar como .jpg cria um
 * arquivo que mente sobre si mesmo, e sobre file:// o navegador adivinha o tipo
 * pela extensao e se recusa a desenhar: a imagem some da pagina sem erro nenhum.
 */
const PELA_ASSINATURA = [
  { ext: 'webp', teste: (b) => b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP' },
  { ext: 'jpg',  teste: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png',  teste: (b) => b.slice(0, 8).toString('hex') === '89504e470d0a1a0a' },
  { ext: 'gif',  teste: (b) => b.slice(0, 3).toString('ascii') === 'GIF' },
  { ext: 'avif', teste: (b) => b.slice(4, 8).toString('ascii') === 'ftyp' && b.slice(8, 12).toString('ascii').startsWith('avif') },
];

const PELO_TIPO = {
  'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/jpg': 'jpg',
  'image/png': 'png', 'image/gif': 'gif', 'image/avif': 'avif',
};

async function baixarBuffer(url) {
  if (!/^https:\/\//i.test(url)) throw new Error('download recusado: so https');
  const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const declarado = Number(r.headers.get('content-length') || 0);
  if (declarado > LIMITE_BYTES) throw new Error(`arquivo grande demais (${declarado} bytes, limite ${LIMITE_BYTES})`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > LIMITE_BYTES) throw new Error(`arquivo grande demais (${buf.length} bytes, limite ${LIMITE_BYTES})`);
  const tipo = (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();

  let ext = PELO_TIPO[tipo];
  const porBytes = PELA_ASSINATURA.find((f) => f.teste(buf))?.ext;
  if (porBytes) ext = porBytes;            // os bytes ganham do header, sempre
  if (!ext) throw new Error(`nao parece imagem (content-type "${tipo || 'ausente'}")`);

  return { buf, ext, tipo };
}

/* ---------- execucao ---------- */

console.log(`${lista.length} blocos media · licenca=${licArg} · fonte primaria=${PEXELS ? 'pexels' : UNSPLASH ? 'unsplash' : 'openverse'}`);
if (semBusca) {
  console.log(`aviso: ${semBusca} bloco(s) sem o campo "busca". Termo derivado do id, resultado pior.`);
}
console.log('');

const saida = [];
const dirImg = join(base, 'imagens');
if (baixar && !existsSync(dirImg)) mkdirSync(dirImg, { recursive: true });

for (let i = 0; i < lista.length; i++) {
  const a = lista[i];
  console.log(`[${i + 1}/${lista.length}] ${a.secao} · "${a.termo}" (${a.formato})`);
  const achado = await buscar(a.termo, a.formato);

  let urlFinal = achado.url;
  if (baixar) {
    const extUrl = (achado.url.match(/\.(jpe?g|png|webp|avif|gif)(\?|$)/i) || [, ''])[1].toLowerCase();
    try {
      const { buf, ext } = await baixarBuffer(achado.url);
      const nome = `${prefixo ? prefixo + '-' : ''}${String(i + 1).padStart(2, '0')}-${nomeSeguro(a.secao)}.${ext}`;
      writeFileSync(join(dirImg, nome), buf);
      urlFinal = `imagens/${nome}`;
      achado.formatoArquivo = ext;
      const mentiu = extUrl && extUrl.replace('jpeg', 'jpg') !== ext;
      console.log(`  baixada  ${nome}  ${(buf.length / 1024).toFixed(0)} KB` +
                  (mentiu ? `  (a URL dizia .${extUrl}, o conteudo e ${ext.toUpperCase()})` : ''));
    } catch (e) {
      console.error(`  download falhou (${e.message}), mantendo o link remoto`);
    }
  }

  saida.push({
    secao: a.secao,
    termo: a.termo,
    formato: a.formato,
    src: urlFinal,
    alt: a.nota || a.termo,
    ...achado,
    url: achado.url,
  });
  console.log(`  ${achado.fonte} · ${achado.licenca}${achado.creditoObrigatorio ? ' · CREDITO OBRIGATORIO' : ''}` +
              (achado.termoUsado ? ` · termo encurtado para "${achado.termoUsado}"` : ''));
  console.log('');
}

const arquivo = arquivoSaida;
writeFileSync(arquivo, JSON.stringify({
  gerado: new Date().toISOString().slice(0, 10),
  licenca: licArg,
  aviso: 'IMAGENS PROVISORIAS. Servem para ver como a pagina fica, nao para ir ao ar. Todo <img> gerado a partir daqui leva data-provisorio.',
  imagens: saida,
}, null, 2) + '\n', 'utf8');

const precisaCredito = saida.filter((s) => s.creditoObrigatorio);
const aleatorias = saida.filter((s) => s.assuntoAleatorio);

console.log(`ok  ${arquivo}  ·  ${saida.length} imagens`);
if (aleatorias.length) {
  console.log(`\n${aleatorias.length} caiu no picsum e tem ASSUNTO ALEATORIO: ${aleatorias.map((a) => a.secao).join(', ')}`);
  console.log('   Refine o campo "busca" desses blocos, em ingles.');
}
if (precisaCredito.length) {
  console.log(`\n${precisaCredito.length} imagem(ns) exigem CREDITO no rodape:`);
  for (const p of precisaCredito) console.log(`   ${p.secao}: "${p.autor}" (${p.licenca}) ${p.pagina}`);
} else {
  console.log('\nNenhuma exige credito (CC0, dominio publico ou licenca de banco).');
}
const viaOpenverseCount = saida.filter((s) => String(s.fonte).startsWith('openverse')).length;
if (viaOpenverseCount && !PEXELS && !UNSPLASH) {
  console.log(`
+---------------------------------------------------------------------------+
| ${String(viaOpenverseCount).padStart(2)} imagem(ns) vieram do Openverse, o caminho SEM CHAVE.             |
|                                                                           |
| Ele e legalmente impecavel e ruim de estetica: o acervo CC0 e de           |
| ARQUIVO. Foto de museu, scan do seculo 19, preto e branco. Numa pagina     |
| de 2026 isso nao parece preview, parece defeito. Nenhum filtro conserta:   |
| fotografia moderna sob CC0 quase nao existe.                              |
|                                                                           |
| Para preview que voce mostra ao cliente, pegue uma chave gratis (1 min):  |
|   https://www.pexels.com/api/   ->   export PEXELS_API_KEY="sua-chave"    |
|   https://unsplash.com/developers -> export UNSPLASH_ACCESS_KEY="..."    |
|                                                                           |
| Com chave, o script usa Pexels ou Unsplash e a diferenca e enorme.        |
+---------------------------------------------------------------------------+`);
}

console.log('\nLembrete: isto e preview. Antes de publicar, troque por foto do cliente');
console.log('e confirme que nao sobrou nenhum data-provisorio na pagina.');
