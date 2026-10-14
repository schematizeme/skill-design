#!/usr/bin/env node
/**
 * render-wireframe.mjs · schematize-design
 *
 * wireframe.json  ->  wireframe.svg
 *
 * Deterministico e sem dependencias. O mesmo JSON produz sempre o mesmo SVG,
 * para que a iteracao seja "edite dois campos e rode de novo", nao "redesenhe".
 *
 *   node scripts/render-wireframe.mjs wireframe.json [saida.svg]
 */

import { readFileSync, writeFileSync } from 'node:fs';

/* ---------- constantes de layout ---------- */

const ALTURA_BLOCO = {
  nav: 48, eyebrow: 20, h1: 62, h2: 42, h3: 28, sub: 26, corpo: 22,
  cta: 52, 'cta-sec': 52, icone: 44, chip: 32, logo: 40, stat: 78,
  divisor: 1, espaco: 40, lista: 28,
};

const GAP       = { airy: 32, normal: 24, densa: 16 };
const PAD_SECAO = { airy: 120, normal: 88, densa: 56 };
const LARGURA_TEXTO = 688;

const COR = {
  papel:      '#ffffff',
  secaoAlt:   '#fafafa',
  secaoDark:  '#eaeaea',
  bloco:      '#ececec',
  blocoBorda: '#d4d4d4',
  destaque:   '#dfe8f5',
  destBorda:  '#9fbde4',
  media:      '#e4e4e4',
  mediaBorda: '#c8c8c8',
  rotulo:     '#5a5a5a',
  fraco:      '#9a9a9a',
  guia:       '#c0c0c0',
  tag:        '#333333',
  aviso:      '#b06a00',
};

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/* ---------- utilidades ---------- */

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

function cortar(s, max) {
  const t = String(s ?? '');
  return t.length <= max ? t : t.slice(0, Math.max(0, max - 1)) + '…';
}

function alturaPedida(altura, vhBase) {
  if (altura == null) return null;
  if (typeof altura === 'number') return altura;
  const m = /^(\d+(?:\.\d+)?)vh$/.exec(String(altura).trim());
  return m ? Math.round((parseFloat(m[1]) / 100) * vhBase) : null;
}

function razao(formato) {
  if (!formato || formato === 'preencher') return null;
  const m = /^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/.exec(formato);
  return m ? parseFloat(m[1]) / parseFloat(m[2]) : null;
}

/* ---------- medicao ---------- */

function medirBloco(b, larguraDisp) {
  const tipo = b.tipo;

  if (tipo === 'media') {
    const r = razao(b.formato);
    return r ? Math.round(larguraDisp / r) : 320;
  }
  if (tipo === 'lista') {
    const n = b.itens ?? 3;
    return n * ALTURA_BLOCO.lista + (n - 1) * 8;
  }
  if (tipo === 'form') {
    const campos = b.itens ?? 3;
    return campos * 56 + (campos - 1) * 12 + 16 + ALTURA_BLOCO.cta;
  }
  if (tipo === 'card') {
    const filhos = b.blocos ?? [];
    const alturas = filhos.map((x) => medirBloco(x, larguraDisp - 48));
    const soma = alturas.reduce((a, c) => a + c, 0);
    const gaps = Math.max(0, alturas.length - 1) * GAP.densa;
    return filhos.length ? soma + gaps + 48 : 160;
  }

  const base = ALTURA_BLOCO[tipo] ?? 24;
  const linhas = b.linhas ?? 1;
  const multilinha = ['h1', 'h2', 'h3', 'sub', 'corpo', 'eyebrow'].includes(tipo);
  return multilinha ? base * linhas + (linhas - 1) * 4 : base;
}

function larguraBloco(b, disponivel) {
  switch (b.tipo) {
    case 'cta':
    case 'cta-sec': return Math.min(disponivel, 220);
    case 'chip':    return Math.min(disponivel, 140);
    case 'icone':   return 44;
    case 'logo':    return Math.min(disponivel, 150);
    case 'eyebrow': return Math.min(disponivel, 260);
    case 'stat':    return Math.min(disponivel, 200);
    default:        return disponivel;
  }
}

/* ---------- posicionamento ---------- */

function empilhar(blocos, x, y, largura, dens, alinhar) {
  const itens = [];
  let cy = y;
  blocos.forEach((b, i) => {
    const h = medirBloco(b, largura);
    const w = larguraBloco(b, largura);
    let bx = x;
    if (w < largura) {
      if (alinhar === 'centro') bx = x + (largura - w) / 2;
      else if (alinhar === 'direita') bx = x + largura - w;
    }
    itens.push({ ...b, _x: Math.round(bx), _y: Math.round(cy), _w: Math.round(w), _h: Math.round(h) });
    cy += h;
    if (i < blocos.length - 1) cy += GAP[dens];
  });
  return { itens, fim: cy };
}

function posicionarSecao(sec, top, viewport, container) {
  const dens = sec.densidade ?? 'normal';
  const pad = PAD_SECAO[dens];
  const nominal =
    sec.largura === 'texto' ? LARGURA_TEXTO :
    sec.largura === 'full'  ? viewport - 48 : container;
  const larg = Math.min(nominal, viewport - 48);
  const x0 = Math.round((viewport - larg) / 2);
  const y0 = top + pad;
  const blocos = sec.blocos ?? [];
  const layout = sec.layout;

  let colocados = [];
  let fim = y0;

  if (layout === 'split' || layout === 'split-invertido') {
    const gapCol = 64;
    const wText = Math.round((larg - gapCol) * 0.52);
    const wMedia = larg - gapCol - wText;
    const inv = layout === 'split-invertido';
    const xText = inv ? x0 + wMedia + gapCol : x0;
    const xMedia = inv ? x0 : x0 + wText + gapCol;

    const midia = blocos.filter((b) => b.tipo === 'media');
    const texto = blocos.filter((b) => b.tipo !== 'media');

    const a = empilhar(texto, xText, y0, wText, dens, 'esquerda');
    const m = empilhar(midia, xMedia, y0, wMedia, dens, 'esquerda');
    colocados = a.itens.concat(m.itens);
    fim = Math.max(a.fim, m.fim);

  } else if (layout === 'grid' || layout === 'bento' || layout === 'faixa') {
    const cols = layout === 'faixa' ? Math.max(blocos.length, 1) : (sec.colunas ?? 3);
    const gapCol = layout === 'faixa' ? 32 : 24;
    const unidade = (larg - gapCol * (cols - 1)) / cols;

    let col = 0;
    let linhaY = y0;
    let alturaLinha = 0;

    for (const b of blocos) {
      const peso = layout === 'bento' ? Math.min(b.peso ?? 1, cols) : 1;
      if (col + peso > cols) {
        col = 0;
        linhaY += alturaLinha + gapCol;
        alturaLinha = 0;
      }
      const w = unidade * peso + gapCol * (peso - 1);
      const x = x0 + col * (unidade + gapCol);
      const h = medirBloco(b, w);
      colocados.push({ ...b, _x: Math.round(x), _y: Math.round(linhaY), _w: Math.round(w), _h: Math.round(h) });
      alturaLinha = Math.max(alturaLinha, h);
      col += peso;
    }
    fim = linhaY + alturaLinha;

  } else if (layout === 'media-full') {
    const midia = blocos.find((b) => b.tipo === 'media');
    const texto = blocos.filter((b) => b.tipo !== 'media');
    const altura = alturaPedida(sec.altura, 900) ?? 520;
    if (midia) {
      colocados.push({ ...midia, _x: 0, _y: top, _w: viewport, _h: altura, _sangra: true });
    }
    const wText = Math.min(LARGURA_TEXTO, larg);
    const xText = Math.round((viewport - wText) / 2);
    const alturaTexto = texto.reduce((a, b) => a + medirBloco(b, wText), 0)
      + Math.max(0, texto.length - 1) * GAP[dens];
    const yText = top + Math.round((altura - alturaTexto) / 2);
    colocados.push(...empilhar(texto, xText, yText, wText, dens, 'centro').itens);
    return { colocados, top, altura };

  } else {
    const alinhar = layout === 'centro' ? 'centro' : 'esquerda';
    const r = empilhar(blocos, x0, y0, larg, dens, alinhar);
    colocados = r.itens;
    fim = r.fim;
  }

  const alturaConteudo = fim - y0;
  let altura = Math.round(alturaConteudo + pad * 2);

  // `altura` declarada manda, seja para esticar (hero de tela cheia) ou para
  // encurtar (nav, ticker, rodape de altura fixa). O conteudo fica centrado
  // na faixa resultante.
  const pedida = alturaPedida(sec.altura, 900);
  if (pedida) {
    const delta = Math.round((pedida - alturaConteudo) / 2 - pad);
    colocados = colocados.map((b) => (b._sangra ? b : { ...b, _y: b._y + delta }));
    altura = pedida;
  }

  return { colocados, top, altura };
}

/* ---------- desenho ---------- */

function desenharBloco(b) {
  const x = b._x, y = b._y, w = b._w, h = b._h, tipo = b.tipo;
  const p = [];

  if (tipo === 'espaco') return '';

  if (tipo === 'divisor') {
    return `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${COR.guia}" stroke-width="1"/>`;
  }

  if (tipo === 'media') {
    p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${COR.media}" stroke="${COR.mediaBorda}"/>`);
    p.push(`<path d="M${x} ${y} L${x + w} ${y + h} M${x + w} ${y} L${x} ${y + h}" stroke="${COR.mediaBorda}" fill="none"/>`);
    const tag = cortar(b.nota ? `MEDIA · ${b.nota}` : `MEDIA ${b.formato ?? ''}`.trim(), Math.max(8, Math.floor(w / 7.2)));
    const tw = tag.length * 7.2 + 16;
    p.push(`<rect x="${Math.round(x + w / 2 - tw / 2)}" y="${Math.round(y + h / 2 - 13)}" width="${Math.round(tw)}" height="26" rx="4" fill="${COR.papel}" opacity="0.93"/>`);
    p.push(`<text x="${Math.round(x + w / 2)}" y="${Math.round(y + h / 2 + 5)}" font-family="${MONO}" font-size="11" fill="${COR.rotulo}" text-anchor="middle">${esc(tag)}</text>`);
    return p.join('\n');
  }

  if (tipo === 'card') {
    p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${COR.papel}" stroke="${COR.blocoBorda}"/>`);
    const filhos = b.blocos ?? [];
    if (filhos.length) {
      const dentro = empilhar(filhos, x + 24, y + 24, w - 48, 'densa', 'esquerda');
      for (const f of dentro.itens) p.push(desenharBloco(f));
    } else {
      p.push(`<text x="${Math.round(x + w / 2)}" y="${Math.round(y + h / 2)}" font-family="${MONO}" font-size="11" fill="${COR.fraco}" text-anchor="middle">${esc(cortar(b.texto ?? 'CARD', Math.floor(w / 7.2)))}</text>`);
    }
    return p.join('\n');
  }

  if (tipo === 'form') {
    const campos = b.itens ?? 3;
    let cy = y;
    for (let i = 0; i < campos; i++) {
      p.push(`<rect x="${x}" y="${cy}" width="${w}" height="56" rx="10" fill="${COR.papel}" stroke="${COR.blocoBorda}"/>`);
      p.push(`<text x="${x + 14}" y="${cy + 33}" font-family="${MONO}" font-size="11" fill="${COR.fraco}">campo ${i + 1}</text>`);
      cy += 68;
    }
    const wb = Math.min(w, 220);
    p.push(`<rect x="${x}" y="${cy + 4}" width="${wb}" height="52" rx="26" fill="${COR.destaque}" stroke="${COR.destBorda}"/>`);
    p.push(`<text x="${Math.round(x + wb / 2)}" y="${cy + 35}" font-family="${MONO}" font-size="11" fill="${COR.rotulo}" text-anchor="middle">ENVIAR</text>`);
    return p.join('\n');
  }

  const primario = tipo === 'cta';
  const pilula = tipo === 'cta' || tipo === 'cta-sec' || tipo === 'chip';
  const rx = pilula ? Math.round(h / 2) : 6;
  const rotulo = cortar(
    b.texto ? `${tipo.toUpperCase()} · ${b.texto}` : tipo.toUpperCase(),
    Math.max(4, Math.floor((w - 24) / 6.7)),
  );
  p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${primario ? COR.destaque : COR.bloco}" stroke="${primario ? COR.destBorda : COR.blocoBorda}"/>`);
  p.push(`<text x="${x + 12}" y="${Math.round(y + h / 2 + 4)}" font-family="${MONO}" font-size="11" fill="${COR.rotulo}">${esc(rotulo)}</text>`);
  return p.join('\n');
}

/* ---------- montagem ---------- */

function render(wf) {
  const meta = wf.meta ?? {};
  const tokens = wf.tokens ?? {};
  const viewport = meta.viewport ?? 1440;
  const container = tokens.container ?? 980;
  const secoes = wf.secoes ?? [];

  const CABECALHO = 96;
  const partes = [];
  const posicionadas = [];
  let y = CABECALHO;

  for (const sec of secoes) {
    const pos = posicionarSecao(sec, y, viewport, container);
    posicionadas.push({ sec, pos });
    y = pos.top + pos.altura;
  }
  const alturaTotal = y + 40;

  const titulo = `${meta.projeto ?? 'sem projeto'} · ${meta.pagina ?? 'pagina'} · ${meta.stack ?? '?'}`;
  partes.push(`<text x="40" y="40" font-family="${MONO}" font-size="17" font-weight="600" fill="${COR.tag}">${esc(titulo)}</text>`);
  partes.push(`<text x="40" y="62" font-family="${MONO}" font-size="11" fill="${COR.fraco}">origem: ${esc(meta.origem ?? 'sem referencia')}  ·  acao: ${esc(meta.acao ?? 'nao definida')}  ·  ${secoes.length} secoes  ·  viewport ${viewport}px</text>`);
  if ((meta.suposicoes ?? []).length) {
    partes.push(`<text x="40" y="80" font-family="${MONO}" font-size="11" fill="${COR.aviso}">suposicoes nao confirmadas: ${esc(cortar(meta.suposicoes.join('  ·  '), 160))}</text>`);
  }
  partes.push(`<line x1="0" y1="${CABECALHO - 1}" x2="${viewport}" y2="${CABECALHO - 1}" stroke="${COR.guia}"/>`);

  for (const { sec, pos } of posicionadas) {
    const fundo =
      sec.fundo === 'superficie' ? COR.secaoAlt :
      sec.fundo === 'escuro'     ? COR.secaoDark :
      sec.fundo === 'acento'     ? COR.destaque : COR.papel;

    partes.push(`<rect x="0" y="${pos.top}" width="${viewport}" height="${pos.altura}" fill="${fundo}"/>`);
    partes.push(`<line x1="0" y1="${pos.top}" x2="${viewport}" y2="${pos.top}" stroke="${COR.guia}" stroke-dasharray="4 4"/>`);
    partes.push(`<text x="12" y="${pos.top + 18}" font-family="${MONO}" font-size="11" fill="${COR.fraco}">${esc(`${sec.id}  ·  ${sec.layout}  ·  ${sec.densidade ?? 'normal'}`)}</text>`);
    partes.push(`<text x="${viewport - 12}" y="${pos.top + 18}" font-family="${MONO}" font-size="11" fill="${COR.fraco}" text-anchor="end">${pos.altura}px</text>`);
    if (sec.nota) {
      partes.push(`<text x="12" y="${pos.top + pos.altura - 10}" font-family="${MONO}" font-size="11" fill="${COR.aviso}">nota: ${esc(cortar(sec.nota, 130))}</text>`);
    }
    for (const b of pos.colocados) {
      const d = desenharBloco(b);
      if (d) partes.push(d);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${viewport}" height="${alturaTotal}" viewBox="0 0 ${viewport} ${alturaTotal}" role="img" aria-label="${esc(titulo)}">
<rect width="${viewport}" height="${alturaTotal}" fill="${COR.papel}"/>
${partes.join('\n')}
</svg>
`;
}

/* ---------- validacao ---------- */

function validar(wf) {
  const erros = [];
  if (!wf.meta) erros.push('falta "meta"');
  if (!Array.isArray(wf.secoes) || wf.secoes.length === 0) erros.push('"secoes" ausente ou vazio');

  // Percorre blocos e filhos de card. `dentroDeCard` pega card dentro de card (recusa unificada).
  const visitar = (b, caminho, dentroDeCard) => {
    if (!b || typeof b !== 'object') { erros.push(`${caminho} nao e um objeto`); return; }
    if (!b.tipo) erros.push(`${caminho} sem "tipo"`);
    if (typeof b.texto === 'string' && /[—–]|--/.test(b.texto)) {
      erros.push(`${caminho} usa travessao em "texto" (piso 3 da skill)`);
    }
    // Eyebrow (kicker) sobre titulo e recusa. Unica excecao: metadado funcional, com `nota`.
    if (b.tipo === 'eyebrow' && !(typeof b.nota === 'string' && b.nota.trim())) {
      erros.push(`${caminho} e um eyebrow sem "nota": kicker sobre titulo e recusa. So metadado funcional que o titulo nao carrega, e a "nota" diz qual`);
    }
    if (b.tipo === 'card') {
      if (dentroDeCard) erros.push(`${caminho} e um card dentro de card (recusa: um nivel de card so)`);
      (b.blocos ?? []).forEach((f, k) => visitar(f, `${caminho}.blocos[${k}]`, true));
    }
  };

  (wf.secoes ?? []).forEach((s, i) => {
    if (!s.id) erros.push(`secoes[${i}] sem "id"`);
    if (!s.layout) erros.push(`secoes[${i}] sem "layout"`);
    if (!Array.isArray(s.blocos)) erros.push(`secoes[${i}] sem "blocos"`);
    (s.blocos ?? []).forEach((b, j) => visitar(b, `secoes[${i}].blocos[${j}]`, false));
  });

  const ctas = (wf.secoes ?? []).flatMap((s) => (s.blocos ?? []).filter((b) => b.tipo === 'cta'));
  const acoes = new Set(ctas.map((b) => (b.texto ?? '').toLowerCase().trim()).filter(Boolean));
  if (acoes.size > 2) {
    erros.push(`${acoes.size} CTAs primarios com textos diferentes. Piso 4: uma acao por pagina. Repita o mesmo CTA ou rebaixe os outros para "cta-sec".`);
  }
  return erros;
}

/* ---------- cli ---------- */

const entrada = process.argv[2];
if (!entrada) {
  console.error('uso: node scripts/render-wireframe.mjs <wireframe.json> [saida.svg]');
  process.exit(1);
}
const saida = process.argv[3] ?? entrada.replace(/\.json$/i, '') + '.svg';

let wf;
try {
  wf = JSON.parse(readFileSync(entrada, 'utf8'));
} catch (e) {
  console.error(`JSON invalido em ${entrada}: ${e.message}`);
  process.exit(1);
}

if (!wf || typeof wf !== 'object' || Array.isArray(wf)) {
  console.error('wireframe invalido:\n  - a raiz do JSON precisa ser um objeto { meta, secoes }');
  process.exit(1);
}

const erros = validar(wf);
if (erros.length) {
  console.error('wireframe invalido:\n  - ' + erros.join('\n  - '));
  process.exit(1);
}

writeFileSync(saida, render(wf), 'utf8');
const nSec = wf.secoes.length;
const nBloco = wf.secoes.reduce((a, s) => a + (s.blocos?.length ?? 0), 0);
console.log(`ok  ${saida}  ·  ${nSec} secoes, ${nBloco} blocos`);
