#!/usr/bin/env node
/**
 * auditar-dom.mjs · schematize-design
 *
 * Mede a pagina RENDERIZADA em varias larguras. Auditoria de paleta nao basta:
 * overflow, alvo de toque, texto sobre foto e icone quebrado so existem no DOM.
 *
 *   node scripts/auditar-dom.mjs index.html
 *   node scripts/auditar-dom.mjs index.html --larguras=375,744,1440
 *   node scripts/auditar-dom.mjs https://exemplo.com
 *
 * Chrome headless trava a janela em 500px de largura minima, entao 375 e
 * qualquer coisa abaixo de 500 roda dentro de um <iframe> daquele tamanho, que
 * da ao documento a viewport real.
 *
 * O QUE ELE NAO FAZ: nao substitui olhar a pagina. Ele acha defeito medivel,
 * nao acha feiura. Tire screenshot tambem.
 *
 * Codigos de saida (contrato da casa): 0 sem achado grave · 1 ha achado grave ·
 * 2 NAO DEU PARA VERIFICAR (sem Chrome, argumento errado, Chrome falhou em todas as
 * larguras). Exit 2 nunca e aprovacao.
 *
 * SEGURANCA: roda o JavaScript da propria pagina auditada num Chrome headless; audite so
 * pagina sua ou de confianca. Escreve 3 arquivos temporarios `_sdn-*` ao lado da pagina
 * (a sonda precisa resolver caminhos relativos) e os remove ao terminar, mesmo com erro.
 * Nao faz requisicao de rede propria, nao le chave, nao envia nada para fora.
 */

import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve, join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomBytes } from 'node:crypto';

/* ---------- cli ---------- */

const args = process.argv.slice(2);
const alvo = args.find((a) => !a.startsWith('-'));
if (!alvo) {
  console.error('uso: node scripts/auditar-dom.mjs <pagina.html> [--larguras=375,500,744,1068,1440]');
  process.exit(2);
}
const larguras = (args.find((a) => a.startsWith('--larguras=')) || '')
  .split('=')[1]?.split(',').map(Number).filter(Boolean)
  ?? [375, 500, 744, 1068, 1440];

if (/^https?:\/\//i.test(alvo)) {
  console.error('auditar URL remota nao e suportado: salve a pagina e rode no arquivo local');
  process.exit(2);
}
if (!existsSync(alvo)) {
  console.error(`nao encontrei ${alvo}`);
  process.exit(2);
}
if (larguras.some((w) => !Number.isFinite(w) || w < 200 || w > 4000)) {
  console.error('--larguras aceita inteiros entre 200 e 4000');
  process.exit(2);
}

/* ---------- achar o Chrome ---------- */

const CANDIDATOS = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
].filter(Boolean);

const chrome = CANDIDATOS.find((p) => existsSync(p));
if (!chrome) {
  console.error('Chrome nao encontrado (nada foi medido). Aponte com CHROME_PATH=/caminho/do/chrome');
  process.exit(2);
}

/* ---------- a sonda que roda dentro da pagina ---------- */

const SONDA = `
(function () {
  var M = 'AUD' + '|';
  var L = [];
  var de = document.documentElement;
  var vw = de.clientWidth;

  function nome(el) {
    return el.tagName.toLowerCase() +
      (el.id ? '#' + el.id : '') +
      (el.getAttribute('class') ? '.' + el.getAttribute('class').split(/\\s+/)[0] : '');
  }
  function texto(el) { return (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 30); }

  // Um elemento que sai da viewport dentro de um carrossel NAO e defeito.
  // Sem esta checagem o relatorio enche de falso positivo e ninguem le mais.
  function dentroDeScroller(el) {
    for (var p = el.parentElement; p && p !== de; p = p.parentElement) {
      var o = getComputedStyle(p);
      if (/auto|scroll|hidden/.test(o.overflowX) || /auto|scroll|hidden/.test(o.overflow)) return true;
    }
    return false;
  }

  /* --- 1. overflow horizontal da PAGINA --- */
  var rolaHorizontal = de.scrollWidth > vw + 1;
  L.push('VIEWPORT ' + vw + ' scrollWidth=' + de.scrollWidth + ' overflow=' + (rolaHorizontal ? 'SIM' : 'nao'));

  if (rolaHorizontal) {
    var culpados = [];
    document.querySelectorAll('*').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (r.right <= vw + 1 && r.left >= -1) return;
      if (dentroDeScroller(el)) return;
      if (el.closest('.sr-only, [hidden]')) return;
      culpados.push(nome(el) + ' left=' + r.left.toFixed(0) + ' right=' + r.right.toFixed(0));
    });
    // so os 5 mais externos interessam: o resto sao filhos herdando o problema
    culpados.slice(0, 5).forEach(function (c) { L.push('OVERFLOW ' + c); });
  }

  /* --- 2. alvos de toque --- */
  // WCAG 2.5.8 isenta link inline dentro de frase. Sem essa isencao o relatorio
  // acusa todo link de prosa e o achado real se perde no meio.
  function ehLinkDeProsa(el) {
    if (el.tagName !== 'A') return false;
    var p = el.parentElement;
    if (!p) return false;
    if (!/^(P|LI|SPAN|TD|DD|FIGCAPTION|BLOCKQUOTE)$/.test(p.tagName)) return false;
    return (p.textContent || '').trim().length > (el.textContent || '').trim().length + 3;
  }
  document.querySelectorAll('a[href],button,summary,input,select,[role="button"]').forEach(function (el) {
    var r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (el.closest('.sr-only')) return;
    if (ehLinkDeProsa(el)) return;
    if (r.height < 44 || r.width < 44) {
      L.push('ALVO ' + nome(el) + ' "' + texto(el) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
  });

  /* --- 3. icone que e caractere, nao desenho --- */
  // Emoji e dingbat mudam de forma por plataforma, e o proprio anti-manual da
  // casa trata emoji como icone como marcador de IA.
  var RE_GLIFO = /[\\u2190-\\u21FF\\u2300-\\u27BF\\u2B00-\\u2BFF\\uFE0F\\u{1F300}-\\u{1FAFF}]/u;
  document.querySelectorAll('*').forEach(function (el) {
    if (el.children.length) return;
    var t = (el.textContent || '').trim();
    if (!t || t.length > 3) return;
    if (RE_GLIFO.test(t)) {
      L.push('ICONE-GLIFO ' + nome(el) + ' "' + t + '" (troque por SVG inline)');
    }
  });

  /* --- 4. texto claro sobre imagem sem camada escura --- */
  function temFundoDeImagem(el) {
    for (var p = el; p && p !== de; p = p.parentElement) {
      var o = getComputedStyle(p);
      if (o.backgroundImage && o.backgroundImage !== 'none' && !/^linear-gradient/.test(o.backgroundImage)) return p;
      if (p.querySelector && p.querySelector(':scope > img')) {
        var pos = getComputedStyle(p).position;
        if (pos === 'relative' || pos === 'absolute') return p;
      }
    }
    return null;
  }
  function claro(cor) {
    var m = cor.match(/[\\d.]+/g);
    if (!m) return false;
    var r = +m[0], g = +m[1], b = +m[2];
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 150;
  }
  document.querySelectorAll('h1,h2,h3,p,span,a,li').forEach(function (el) {
    var proprio = Array.prototype.some.call(el.childNodes, function (n) {
      return n.nodeType === 3 && n.textContent.trim();
    });
    if (!proprio) return;
    var cs = getComputedStyle(el);
    if (!claro(cs.color)) return;
    var host = temFundoDeImagem(el);
    if (!host) return;
    // procura um scrim: pseudo ou irmao absoluto com fundo escuro semi
    var antes = getComputedStyle(host, '::before');
    var depois = getComputedStyle(host, '::after');
    var temScrim = [antes, depois].some(function (p) {
      return p.content !== 'none' && p.display !== 'none' &&
             (p.backgroundImage !== 'none' || /rgba?\\(/.test(p.backgroundColor));
    });
    if (!temScrim) {
      L.push('SEM-SCRIM ' + nome(el) + ' "' + texto(el) + '" texto claro sobre imagem');
    }
  });

  /* --- 5. texto cortado dentro do proprio elemento --- */
  document.querySelectorAll('h1,h2,h3,p,li,button,a').forEach(function (el) {
    if (el.closest('.sr-only, .visually-hidden, [hidden]')) return;
    if (el.scrollWidth > el.clientWidth + 2 && !dentroDeScroller(el)) {
      var o = getComputedStyle(el);
      if (/auto|scroll/.test(o.overflowX)) return;
      L.push('TEXTO-CORTADO ' + nome(el) + ' "' + texto(el) + '" ' + el.scrollWidth + '>' + el.clientWidth);
    }
  });

  /* --- 6. higiene --- */
  var semAlt = 0, provisorias = 0;
  document.querySelectorAll('img').forEach(function (i) {
    if (!i.hasAttribute('alt')) semAlt++;
    if (i.hasAttribute('data-provisorio')) provisorias++;
    if (i.complete && i.naturalWidth === 0) L.push('IMG-QUEBRADA ' + (i.getAttribute('src') || '').split('/').pop());
    if (!i.getAttribute('width') || !i.getAttribute('height')) {
      L.push('IMG-SEM-DIMENSAO ' + (i.getAttribute('src') || '').split('/').pop() + ' (layout shift)');
    }
  });
  var h1 = document.querySelectorAll('h1').length;
  if (h1 !== 1) L.push('H1 ' + h1 + ' na pagina (tem que ser exatamente 1)');
  if (semAlt) L.push('SEM-ALT ' + semAlt + ' imagem(ns)');
  if (provisorias) L.push('PROVISORIAS ' + provisorias + ' imagem(ns) de preview ainda na pagina');
  if (!document.documentElement.lang) L.push('SEM-LANG no elemento html');
  if (!document.querySelector('meta[name="description"]')) L.push('SEM-META-DESCRIPTION');

  var pre = document.createElement('pre');
  pre.textContent = L.map(function (x) { return M + ' ' + x; }).join('\\n');
  document.body.innerHTML = '';
  document.body.appendChild(pre);
})();
`;

/* ---------- execucao ---------- */

// A sonda vive ao lado da pagina: caminho relativo de imagem precisa resolver. Nomes unicos
// por execucao (sem colisao entre execucoes paralelas) e remocao garantida no `finally`.
const baseDir = dirname(resolve(alvo));
const tag = randomBytes(4).toString('hex');
const sondaPath = join(baseDir, `_sdn-${tag}-sonda.js`);
const paginaPath = join(baseDir, `_sdn-${tag}-pagina.html`);
const wrapPath = join(baseDir, `_sdn-${tag}-wrap.html`);
const limpar = () => { for (const p of [sondaPath, paginaPath, wrapPath]) rmSync(p, { force: true }); };
for (const sinal of ['SIGINT', 'SIGTERM']) process.on(sinal, () => { limpar(); process.exit(130); });

function rodarChrome(url, w, h) {
  try {
    const out = execFileSync(chrome, [
      '--headless', '--disable-gpu', '--hide-scrollbars',
      '--force-prefers-reduced-motion', '--allow-file-access-from-files',
      ...(process.env.CHROME_NO_SANDBOX === '1' ? ['--no-sandbox'] : []),
      `--window-size=${w},${h}`, '--virtual-time-budget=8000', '--dump-dom', url,
    ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'], timeout: 90000 });
    // --dump-dom devolve o DOM serializado, entao o texto vem com entidade
    return [...out.matchAll(/AUD\|([^<\n]*)/g)].map((m) => m[1].trim()
      .replace(/&gt;/g, '>').replace(/&lt;/g, '<')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&'));
  } catch (e) {
    return [`AUD-FALHOU ${String(e.message).slice(0, 80)}`];
  }
}

const resultados = new Map();
try {
  writeFileSync(sondaPath, SONDA, 'utf8');
  const html = readFileSync(alvo, 'utf8');
  // funcao no lugar de string: `$&`/`$1` no HTML da pagina nao pode ser interpretado como padrao
  writeFileSync(paginaPath, /<\/body>/i.test(html)
    ? html.replace(/<\/body>/i, () => `<script src="${basename(sondaPath)}"></script></body>`)
    : html + `<script src="${basename(sondaPath)}"></script>`, 'utf8');

  const urlPagina = pathToFileURL(paginaPath).href;
  for (const w of larguras) {
    let linhas;
    if (w < 500) {
      // Chrome headless trava a janela em 500px. Um iframe da a viewport real.
      writeFileSync(wrapPath, `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{margin:0}iframe{border:0;display:block}</style></head><body>
<iframe id="f" src="${basename(paginaPath)}" width="${w}" height="1400"></iframe><pre id="o"></pre>
<script>document.getElementById('f').addEventListener('load',function(){setTimeout(function(){
try{document.getElementById('o').textContent=this.contentDocument.body.textContent}
catch(e){document.getElementById('o').textContent='AUD'+'| erro '+e.message}
}.bind(this),600)})</script></body></html>`, 'utf8');
      linhas = rodarChrome(pathToFileURL(wrapPath).href, 900, 1500);
    } else {
      linhas = rodarChrome(urlPagina, w, 1000);
    }
    resultados.set(w, linhas);
  }
} finally {
  limpar();
}

// Exit 2 se NADA foi medido: o Chrome falhou ou a sonda nao devolveu o VIEWPORT em nenhuma largura.
const mediu = [...resultados.values()].some((l) => l.some((x) => x.startsWith('VIEWPORT')));
if (!mediu) {
  console.error('nada foi medido: o Chrome falhou ou a sonda nao rodou em nenhuma largura.');
  for (const [w, l] of resultados) console.error(`  ${w}px: ${l[0] ?? '(sem saida)'}`);
  process.exit(2);
}

/* ---------- relatorio ---------- */

const CATEGORIAS = [
  ['OVERFLOW',         'rola na horizontal', 'grave'],
  ['TEXTO-CORTADO',    'texto cortado',       'grave'],
  ['IMG-QUEBRADA',     'imagem nao carrega',  'grave'],
  ['SEM-SCRIM',        'texto claro sobre imagem sem camada escura', 'grave'],
  ['ALVO',             'alvo de toque abaixo de 44px', 'medio'],
  ['ICONE-GLIFO',      'icone e caractere, nao SVG',   'medio'],
  ['IMG-SEM-DIMENSAO', 'sem width/height (layout shift)', 'medio'],
  ['H1',               'contagem de h1',      'medio'],
  ['SEM-ALT',          'imagem sem alt',      'medio'],
  ['SEM-LANG',         'html sem lang',       'medio'],
  ['SEM-META-DESCRIPTION', 'sem meta description', 'medio'],
  ['PROVISORIAS',      'imagem de preview ainda na pagina', 'aviso'],
];

console.log(`\nauditoria de DOM · ${basename(alvo)}\n${larguras.length} larguras: ${larguras.join(', ')}px\n`);

let graves = 0, medios = 0;
const vistos = new Set();

for (const [w, linhas] of resultados) {
  const viewport = linhas.find((l) => l.startsWith('VIEWPORT')) || '';
  const achados = linhas.filter((l) => !l.startsWith('VIEWPORT'));
  const rola = /overflow=SIM/.test(viewport);
  console.log(`--- ${w}px ${rola ? '· ROLA NA HORIZONTAL' : ''}`);
  if (!achados.length) { console.log('  nada\n'); continue; }

  for (const [tag, , peso] of CATEGORIAS) {
    const meus = achados.filter((l) => l.startsWith(tag));
    if (!meus.length) continue;
    for (const m of meus) {
      const chave = `${tag}::${m}`;
      if (vistos.has(chave)) continue;   // nao repete o mesmo achado em 5 larguras
      vistos.add(chave);
      if (peso === 'grave') graves++; else if (peso === 'medio') medios++;
      console.log(`  ${peso === 'grave' ? '!!' : peso === 'medio' ? ' !' : '  '} ${m}`);
    }
  }
  const soltos = achados.filter((l) => !CATEGORIAS.some(([t]) => l.startsWith(t)));
  for (const s of soltos) console.log(`   ? ${s}`);
  console.log('');
}

console.log(`${graves} grave(s), ${medios} medio(s)\n`);
console.log('Isto acha defeito medivel, NAO acha feiura. Tire screenshot em pelo menos');
console.log('duas larguras e olhe, antes de dizer que esta pronto.');

process.exit(graves ? 1 : 0);
