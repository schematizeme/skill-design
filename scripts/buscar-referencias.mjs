#!/usr/bin/env node
/**
 * buscar-referencias.mjs · schematize-design
 *
 * Puxa sites premiados e curados de galerias, para construir do zero com
 * referencia REAL e atual em vez da memoria do modelo, que tem data de corte e
 * puxa para o mediano do treino.
 *
 *   node scripts/buscar-referencias.mjs
 *   node scripts/buscar-referencias.mjs --tag=fintech
 *   node scripts/buscar-referencias.mjs --extrair=https://exemplo.com
 *
 * SEGURANCA: --extrair so aceita http(s) e RECUSA destino local ou privado (localhost,
 * 127.0.0.0/8, 10/8, 172.16/12, 192.168/16, 169.254/16, ::1, fc00::/7), porque um agente
 * induzido por conteudo hostil nao deve usar esta ferramenta para sondar a rede interna.
 * `--permitir-local` desliga a recusa quando a pessoa pede de proposito (ex.: preview local).
 * Limite conhecido: nome de host que RESOLVE para IP privado (DNS) nao e detectado aqui.
 * O script nao le chave nem segredo, e so escreve ./referencias.json.
 *
 * O QUE ELE DA: nome, URL e as tags com que a galeria classificou o site.
 * O QUE ELE NAO DA: o design. Abra os que interessam e OLHE.
 *
 * Fontes verificadas em 2026-09-19:
 *   One Page Love    https://onepagelove.com/feed        RSS, funciona
 *   Minimal Gallery  https://minimal.gallery/feed/       RSS, funciona
 *   Awwwards         /websites/rss/ devolve HTML, NAO e feed
 *   Land-book        403
 *   Lapa Ninja       403
 *   httpster         404
 * Nenhuma galeria grande abre API. Estas duas sao o que existe sem chave.
 */

import { writeFileSync } from 'node:fs';

const NOME_UA = 'schematize-design/0.1 (skill de design)';

const args = process.argv.slice(2);
const tag = (args.find((a) => a.startsWith('--tag=')) || '').split('=')[1];
const extrair = (args.find((a) => a.startsWith('--extrair=')) || '').split('=').slice(1).join('=');
const permitirLocal = args.includes('--permitir-local');

/** Devolve o motivo da recusa, ou null se o destino e aceitavel. */
function recusarDestino(entrada, permitir = false) {
  let u;
  try { u = new URL(entrada); } catch { return `URL invalida: ${entrada}`; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return `protocolo ${u.protocol} nao aceito (so http e https)`;
  if (permitir) return null;
  const h = u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return `destino local recusado (${h})`;
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) {
      return `endereco privado ou local recusado (${h})`;
    }
  }
  if (h === '::1' || h === '::' || /^f[cd][0-9a-f]{2}:/.test(h) || /^fe80:/.test(h) || h.startsWith('::ffff:')) return `endereco IPv6 local ou privado recusado (${h})`;
  return null;
}

const FONTES = [
  { nome: 'One Page Love',   url: 'https://onepagelove.com/feed' },
  { nome: 'Minimal Gallery', url: 'https://minimal.gallery/feed/' },
];

const limpar = (s) => String(s || '')
  .replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8211;/g, '-')
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/<[^>]+>/g, '')
  .trim();

async function lerFeed(fonte) {
  try {
    const r = await fetch(fonte.url, {
      headers: { 'User-Agent': NOME_UA },
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const xml = await r.text();
    if (!/<item>/i.test(xml)) throw new Error('resposta nao e RSS (a galeria mudou?)');

    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(([, it]) => ({
      fonte: fonte.nome,
      titulo: limpar((it.match(/<title>([\s\S]*?)<\/title>/i) || [])[1])
        .replace(/^Website Inspiration:\s*/i, ''),
      pagina: limpar((it.match(/<link>([\s\S]*?)<\/link>/i) || [])[1]),
      tags: [...it.matchAll(/<category>([\s\S]*?)<\/category>/gi)]
        .map((m) => limpar(m[1]))
        .filter((t) => t && !/^inspiration$/i.test(t)),
    }));
  } catch (e) {
    console.error(`  ${fonte.nome}: ${e.message}`);
    return [];
  }
}

/* ---------- extrair o UI system de um site ---------- */

async function extrairUiSystem(url) {
  console.log(`extraindo o UI system de ${url}\n`);
  const r = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ' + NOME_UA + ')' },
    redirect: 'manual',
    signal: AbortSignal.timeout(25000),
  });
  if (r.status >= 300 && r.status < 400) {
    throw new Error(`redirecionamento (${r.status}) para ${r.headers.get('location') || '?'}: rode de novo apontando o destino final, para a checagem de destino valer`);
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const html = await r.text();

  const conta = (re) => {
    const m = new Map();
    for (const x of html.matchAll(re)) {
      const v = (x[1] || '').trim().toLowerCase();
      if (v) m.set(v, (m.get(v) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const cores = conta(/(#[0-9a-f]{6}|#[0-9a-f]{3}\b|oklch\([^)]+\)|rgba?\([^)]+\))/gi).slice(0, 14);
  const fontes = conta(/font-family\s*:\s*([^;}"']+)/gi).slice(0, 6);
  const raios = conta(/border-radius\s*:\s*([^;}]+)/gi).slice(0, 8);
  const googleFonts = [...new Set([...html.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^&"']+)/g)]
    .map((m) => decodeURIComponent(m[1]).split(':')[0]))];

  console.log('CORES mais repetidas');
  for (const [c, n] of cores) console.log(`  ${String(n).padStart(4)}x  ${c}`);
  console.log('\nFAMILIAS TIPOGRAFICAS');
  for (const [f, n] of fontes) console.log(`  ${String(n).padStart(4)}x  ${f.slice(0, 70)}`);
  if (googleFonts.length) console.log(`\nGOOGLE FONTS: ${googleFonts.join(', ')}`);
  console.log('\nRAIOS');
  for (const [b, n] of raios) console.log(`  ${String(n).padStart(4)}x  ${b.slice(0, 40)}`);

  console.log(`\nbiblioteca de animacao: ${
    /gsap|greensock/i.test(html) ? 'GSAP' :
    /lenis/i.test(html) ? 'Lenis' :
    /framer-motion|motion\.dev/i.test(html) ? 'Motion' :
    /aos\.js|data-aos/i.test(html) ? 'AOS' : 'nenhuma detectada'}`);

  console.log('\nISTO E O CSS SERVIDO NO HTML, nao o bundle inteiro. Folha externa e');
  console.log('CSS-in-JS nao aparecem aqui. Para o sistema completo, abra o site e');
  console.log('leia o DOM renderizado (scripts/auditar-dom.mjs ou o DevTools).');
}

/* ---------- execucao ---------- */

if (extrair) {
  const recusa = recusarDestino(extrair, permitirLocal);
  if (recusa) {
    console.error(`recusado: ${recusa}`);
    process.exit(2);
  }
  try {
    await extrairUiSystem(extrair);
  } catch (e) {
    console.error(`falhou: ${e.message}`);
    process.exit(1);
  }
} else {
  console.log('buscando referencias atuais...\n');
  const listas = await Promise.all(FONTES.map(lerFeed));
  // o feed mistura artigo com site, e artigo nao e referencia visual
  let itens = listas.flat()
    .filter((i) => !/^(Article|Roundup|Interview|Freebie)\b/i.test(i.titulo))
    .filter((i) => !i.tags.some((t) => /^(articles?|roundups?|news|freebies?)$/i.test(t)));

  if (tag) {
    const re = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    itens = itens.filter((i) => re.test(i.tags.join(' ')) || re.test(i.titulo));
  }

  if (!itens.length) {
    console.log(tag ? `nenhuma referencia com a tag "${tag}"` : 'nenhuma referencia (as duas galerias falharam)');
    console.log('\nGalerias para abrir na mao, que nao expoem feed:');
    console.log('  awwwards.com/websites  ·  land-book.com  ·  godly.website');
    console.log('  lapa.ninja  ·  siteinspire.com  ·  curated.design  ·  mobbin.com (mobile)');
    process.exit(0);
  }

  for (const i of itens) {
    console.log(`  ${i.titulo}`);
    console.log(`    ${i.pagina}`);
    if (i.tags.length) console.log(`    ${i.tags.slice(0, 7).join(' · ')}`);
    console.log(`    via ${i.fonte}\n`);
  }

  const frequentes = new Map();
  for (const i of itens) for (const t of i.tags) frequentes.set(t, (frequentes.get(t) || 0) + 1);
  const top = [...frequentes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (top.length) {
    console.log('padroes que mais aparecem agora:');
    console.log('  ' + top.map(([t, n]) => `${t} (${n})`).join(' · '));
  }

  writeFileSync('referencias.json', JSON.stringify({
    buscado: new Date().toISOString().slice(0, 10),
    fontes: FONTES.map((f) => f.nome),
    aviso: 'Isto e uma LISTA, nao um design. Abra os que interessam e olhe antes de decidir qualquer coisa.',
    itens,
  }, null, 2) + '\n', 'utf8');

  console.log(`\nok  referencias.json  ·  ${itens.length} sites`);
  console.log('\nAbra tres ou quatro e OLHE. Depois use --extrair=<url> para ler a');
  console.log('paleta, a tipografia e os raios de um deles.');
}
