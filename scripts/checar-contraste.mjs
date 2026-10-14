#!/usr/bin/env node
/**
 * checar-contraste.mjs · schematize-design
 *
 * Auditoria WCAG 2.1 de contraste. Existe porque o cinza terciario classico de
 * sistemas de referencia (#86868b) reprova AA como texto pequeno em fundo claro, e
 * isso ja foi para producao antes de ser medido.
 *
 *   node scripts/checar-contraste.mjs "#6e6e73" "#ffffff"
 *   node scripts/checar-contraste.mjs wireframe.json
 *   node scripts/checar-contraste.mjs tokens.css
 *
 * Saida: ratio, veredito AA/AAA para texto normal, grande e componente.
 * Exit code (contrato da casa): 0 passa, 1 reprova AA de texto normal,
 * 2 nao deu para verificar (arquivo ausente, sem cor para medir, uso errado).
 */

import { readFileSync, existsSync } from 'node:fs';

/* ---------- matematica do WCAG ---------- */

function hexParaRgb(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function luminancia([r, g, b]) {
  const canal = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function ratio(a, b) {
  const la = luminancia(hexParaRgb(a));
  const lb = luminancia(hexParaRgb(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/* ---------- veredito ---------- */

const LIMITES = {
  'texto normal': { AA: 4.5, AAA: 7.0 },   // < 18pt, ou < 14pt bold
  'texto grande': { AA: 3.0, AAA: 4.5 },   // >= 18pt (24px), ou >= 14pt bold
  'componente':   { AA: 3.0, AAA: 3.0 },   // borda de input, icone, foco
};

function avaliar(fg, bg, rotulo) {
  const r = ratio(fg, bg);
  const linhas = [];
  let reprovouNormal = false;

  for (const [uso, lim] of Object.entries(LIMITES)) {
    const aa = r >= lim.AA;
    const aaa = r >= lim.AAA;
    const marca = aaa ? 'AAA' : aa ? 'AA ' : 'REPROVA';
    if (uso === 'texto normal' && !aa) reprovouNormal = true;
    linhas.push(`    ${uso.padEnd(14)} ${marca.padEnd(8)} (precisa ${lim.AA}:1)`);
  }

  const cab = `${fg} sobre ${bg}   ${r.toFixed(2)}:1${rotulo ? '   ' + rotulo : ''}`;
  return { texto: [cab, ...linhas].join('\n'), reprovouNormal, r };
}

/* ---------- sugestao ---------- */

function escurecer(hex, passo) {
  const [r, g, b] = hexParaRgb(hex);
  const f = (v) => Math.max(0, Math.round(v * (1 - passo)));
  return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function clarear(hex, passo) {
  const [r, g, b] = hexParaRgb(hex);
  const f = (v) => Math.min(255, Math.round(v + (255 - v) * passo));
  return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function sugerir(fg, bg, alvo = 4.5) {
  const bgClaro = luminancia(hexParaRgb(bg)) > 0.4;
  for (let p = 0.02; p <= 0.96; p += 0.02) {
    const cand = bgClaro ? escurecer(fg, p) : clarear(fg, p);
    if (ratio(cand, bg) >= alvo) {
      return `${cand}  (${ratio(cand, bg).toFixed(2)}:1, ${bgClaro ? 'escurecido' : 'clareado'} ${Math.round(p * 100)}%)`;
    }
  }
  return bgClaro ? '#000000' : '#ffffff';
}

/* ---------- extracao de cores ---------- */

/**
 * Extrai blocos de regra de um CSS, com as custom properties de cor de cada um.
 *
 * Medir todas as cores de um arquivo contra um unico fundo e a armadilha do
 * "auditor que mente": cor de tema escuro contra fundo branco produz reprovacao
 * falsa e esconde a verdadeira. Cada bloco e medido contra os fundos que ele
 * mesmo declara.
 */
function blocosDeCss(entrada) {
  // Arquivo HTML: so o que esta dentro de <style> e CSS. Sem isto o parser trata
  // o <head> inteiro como seletor e o relatorio sai ilegivel.
  let conteudo = entrada;
  if (/<style[\s>]/i.test(entrada)) {
    const estilos = [...entrada.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
    conteudo = estilos.join('\n');
  }
  const semComentario = conteudo.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocos = [];
  const pilha = [];
  let buffer = '';
  let seletor = '';

  for (let i = 0; i < semComentario.length; i++) {
    const c = semComentario[i];
    if (c === '{') {
      pilha.push(seletor.trim().replace(/\s+/g, ' '));
      seletor = '';
      buffer = '';
    } else if (c === '}') {
      const nome = pilha.join(' > ');
      const cores = [];
      const re = /(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g;
      let m;
      while ((m = re.exec(buffer)) !== null) {
        if (hexParaRgb(m[2])) cores.push({ nome: m[1], hex: m[2].toLowerCase() });
      }
      if (cores.length) blocos.push({ seletor: nome, cores });
      pilha.pop();
      buffer = '';
      seletor = '';
    } else if (pilha.length) {
      buffer += c;
    } else {
      seletor += c;
    }
  }
  return blocos;
}

const EH_FUNDO  = /fundo|superficie|off-white|papel|surface|bg|vidro|escuro|dark|elevad/i;
const EH_BORDA  = /borda|hairline|divis|border/i;
const EH_ROTULO = /rotulo|label|on-accent|sobre-acento/i;
// Cor de preenchimento de botao. Nao e texto: precisa de DOIS testes, o do
// rotulo em cima (4.5:1) e o da forma contra o fundo (3:1). Ver contraste.md.
const EH_FILL   = /acento|accent|bot(a|ã)o|btn|fill|preenchimento/i;
const EH_TEXTO  = /texto|erro|link|ink|text|positivo|negativo|sucesso|aviso|alerta|perigo/i;

/**
 * Uma cor de texto clara pertence a um fundo escuro, e vice-versa. Medir
 * --texto-inv (claro) contra --fundo (branco) produz reprovacao falsa e esconde
 * a verdadeira: e a armadilha do "auditor que mente", so que por pareamento.
 */
const ehClaro = (hex) => luminancia(hexParaRgb(hex)) > 0.45;
const combinam = (fg, bg) => ehClaro(fg) !== ehClaro(bg);

/**
 * O nome manda mais que a luminancia.
 *
 * Um token chamado --texto-inv existe para o tema INVERSO, e pertence a
 * superficie escura mesmo quando a cor dele fica em cima do limite. Aconteceu:
 * #a9b0a7 tem luminancia 0.423, logo abaixo do corte de 0.45, entao o auditor
 * o pareou com fundo branco e reprovou em 2.22:1. No fundo real (#0b0d0c) ele
 * da 8.78:1. Reprovacao falsa, e das piores, porque parece plausivel.
 */
const EH_INVERSO = /\binv\b|inverso|on-dark|sobre-escuro|-dark\b/i;

function fundosCompativeis(fgNome, fgHex, fundos) {
  if (EH_INVERSO.test(fgNome)) {
    const escuros = fundos.filter((b) => !ehClaro(b.hex));
    if (escuros.length) return escuros;      // pertence ao tema escuro, e ponto
  }
  return fundos.filter((b) => combinam(fgHex, b.hex));
}

/* ---------- cli ---------- */

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('uso:\n  node scripts/checar-contraste.mjs "#fg" "#bg"\n  node scripts/checar-contraste.mjs <wireframe.json | tokens.css>');
  process.exit(2);
}

let falhou = false;

if (args.length >= 2 && hexParaRgb(args[0]) && hexParaRgb(args[1])) {
  const { texto, reprovouNormal } = avaliar(args[0], args[1]);
  console.log(texto);
  if (reprovouNormal) {
    console.log(`\n  substituto sugerido: ${sugerir(args[0], args[1])}`);
    falhou = true;
  }

} else {
  const arquivo = args[0];
  if (!existsSync(arquivo)) {
    console.error(`nao encontrei ${arquivo}`);
    process.exit(2);
  }
  const conteudo = readFileSync(arquivo, 'utf8');

  let tokens = null;
  if (/\.json$/i.test(arquivo)) {
    // wireframe sem bloco `tokens` mede os defaults do spec; JSON invalido cai no parser de CSS e sai 2
    try { const j = JSON.parse(conteudo); tokens = (j && typeof j === 'object' && !Array.isArray(j)) ? (j.tokens ?? {}) : null; } catch { /* segue para regex */ }
  }

  if (tokens) {
    const fundos = [
      ['fundo', tokens.fundo ?? '#ffffff'],
      ['superficie', tokens.superficie ?? '#f5f5f7'],
    ];
    const frentes = [
      ['texto', tokens.texto ?? '#1d1d1f'],
      ['textoSec', tokens.textoSec ?? '#6e6e73'],
    ];
    // acentoTexto so entra se declarado: e o token de LINK, distinto do preenchimento
    if (tokens.acentoTexto) frentes.push(['acentoTexto', tokens.acentoTexto]);

    console.log(`tokens de ${arquivo}\n`);
    for (const [nf, fg] of frentes) {
      for (const [nb, bg] of fundos) {
        if (!hexParaRgb(fg) || !hexParaRgb(bg)) continue;
        const { texto, reprovouNormal } = avaliar(fg, bg, `${nf} sobre ${nb}`);
        console.log(texto);
        if (reprovouNormal) {
          console.log(`    -> substituto: ${sugerir(fg, bg)}`);
          falhou = true;
        }
        console.log('');
      }
    }

    // O acento e PREENCHIMENTO, nao texto. Dois testes diferentes, e e por isso
    // que a cor de marca reprova em producao: ninguem faz os dois.
    const acento = tokens.acento ?? '#0071e3';
    if (hexParaRgb(acento)) {
      const rotulo = tokens.acentoRotulo ?? '#ffffff';
      const a = avaliar(rotulo, acento, `rotulo ${rotulo} sobre acento (botao)`);
      console.log(a.texto);
      if (a.reprovouNormal) {
        const claro = luminancia(hexParaRgb(acento)) > 0.4;
        console.log(`    -> ${claro
          ? `o acento e claro demais para rotulo ${rotulo}. Use rotulo escuro (acentoRotulo), ou escureca o acento para ${sugerir(rotulo, acento)}`
          : `escureca o acento para ${sugerir(rotulo, acento)}`}`);
        falhou = true;
      }
      console.log('');
      // terceiro papel: a BORDA. Um acento claro nao se separa de um fundo claro,
      // e WCAG 1.4.11 pede 3:1 para componente. Verde limao sobre branco da 1.5:1:
      // o rotulo dentro passa folgado e o botao some assim mesmo.
      const borda = tokens.acentoBorda;
      for (const [nb, bg] of fundos) {
        if (!hexParaRgb(bg)) continue;
        const r = ratio(acento, bg);
        const ok = r >= 3;
        console.log(`${acento} sobre ${bg}   ${r.toFixed(2)}:1   acento (forma do botao) sobre ${nb}`);
        console.log(`    componente     ${ok ? 'AA ' : 'REPROVA'}  (precisa 3:1)`);

        if (!ok) {
          if (borda && hexParaRgb(borda)) {
            const rb = ratio(borda, bg);
            const rbA = ratio(borda, acento);
            const bordaSalva = rb >= 3 && rbA >= 1.8;
            console.log(`    -> com filete ${borda}: ${rb.toFixed(2)}:1 contra ${nb}, ${rbA.toFixed(2)}:1 contra o acento  ${bordaSalva ? 'RESOLVIDO' : 'INSUFICIENTE'}`);
            if (!bordaSalva) falhou = true;
          } else {
            console.log(`    -> o acento e claro demais para se separar de ${nb}. Declare "acentoBorda" e ponha um filete de 1px. Sugestao: ${sugerir(acento, bg, 3)}`);
            falhou = true;
          }
        }

        if (r < 4.5) {
          console.log(`    nota: como FORMA pode passar com filete, mas nao use esta cor como TEXTO sobre ${nb} (${r.toFixed(2)} < 4.5).`);
          if (!tokens.acentoTexto) {
            console.log(`          declare "acentoTexto" no wireframe para o link. Sugestao: ${sugerir(acento, bg)}`);
          }
        }
      }
      console.log('');
    }

  } else {
    const blocos = blocosDeCss(conteudo);
    if (!blocos.length) {
      console.error('nenhuma custom property de cor encontrada no arquivo (nada para verificar)');
      process.exit(2);
    }

    let naoAvaliadas = 0;
    const foraDeBloco = [];

    console.log(`${arquivo}\n${blocos.length} blocos com cor. Cada um e medido contra os fundos que ele mesmo declara.\n`);

    for (const bloco of blocos) {
      // ordem importa: --texto-inv casa com EH_TEXTO e tambem com "inv" de
      // fundo escuro. Texto tem que ganhar, senao vira fundo.
      const classe = (c) => {
        if (EH_ROTULO.test(c.nome)) return 'rotulo';
        if (EH_BORDA.test(c.nome)) return 'borda';
        if (EH_TEXTO.test(c.nome)) return 'texto';
        if (EH_FUNDO.test(c.nome)) return 'fundo';
        if (EH_FILL.test(c.nome)) return 'fill';
        return 'resto';
      };
      const por = (k) => bloco.cores.filter((c) => classe(c) === k);

      const fundos  = por('fundo');
      const frentes = por('texto');
      const fills   = por('fill');
      const bordas  = por('borda');
      const rotulo  = por('rotulo')[0]?.hex ?? '#ffffff';
      naoAvaliadas += por('resto').length;

      if (!frentes.length && !bordas.length && !fills.length) continue;

      if (!fundos.length) {
        const n = frentes.length + bordas.length + fills.length;
        naoAvaliadas += n;
        foraDeBloco.push(`${bloco.seletor}  (${n} cores, nenhum fundo declarado no bloco)`);
        continue;
      }

      console.log(`--- ${bloco.seletor} ---`);
      for (const fg of frentes) {
        const compativeis = fundosCompativeis(fg.nome, fg.hex, fundos);
        if (!compativeis.length) {
          naoAvaliadas++;
          console.log(`${fg.hex}   ${fg.nome}: nenhum fundo de luminancia oposta neste bloco, nao avaliado`);
          continue;
        }
        for (const bg of compativeis) {
          const { texto, reprovouNormal } = avaliar(fg.hex, bg.hex, `${fg.nome} sobre ${bg.nome}`);
          console.log(texto);
          if (reprovouNormal) {
            console.log(`    -> substituto: ${sugerir(fg.hex, bg.hex)}`);
            falhou = true;
          }
        }
      }
      // cor de preenchimento: DOIS testes, o rotulo em cima e a forma contra o fundo
      for (const f of fills) {
        const { texto, reprovouNormal } = avaliar(rotulo, f.hex, `rotulo sobre ${f.nome}`);
        console.log(texto);
        if (reprovouNormal) {
          const claro = luminancia(hexParaRgb(f.hex)) > 0.4;
          console.log(`    -> ${claro
            ? `${f.nome} e claro demais para rotulo ${rotulo}. Use rotulo escuro, ou escureca para ${sugerir(rotulo, f.hex)}`
            : `escureca ou clareie o preenchimento; alvo ${sugerir(rotulo, f.hex)}`}`);
          falhou = true;
        }
        // so contra fundo de luminancia oposta: botao escuro sobre faixa escura
        // nao e uma combinacao que exista, e medi-la produz reprovacao falsa
        for (const bg of fundos.filter((b) => combinam(f.hex, b.hex))) {
          const r = ratio(f.hex, bg.hex);
          console.log(`${f.hex} sobre ${bg.hex}   ${r.toFixed(2)}:1   ${f.nome} (forma) sobre ${bg.nome}`);
          console.log(`    componente     ${r >= 3 ? 'AA ' : 'REPROVA'}  (precisa 3:1)`);
          if (r < 3) falhou = true;
        }
      }
      // borda e componente: limite 3:1, nao 4.5:1
      for (const bd of bordas) {
        for (const bg of fundos.filter((b) => combinam(bd.hex, b.hex))) {
          const r = ratio(bd.hex, bg.hex);
          const ok = r >= 3.0;
          console.log(`${bd.hex} sobre ${bg.hex}   ${r.toFixed(2)}:1   ${bd.nome} sobre ${bg.nome}`);
          console.log(`    componente     ${ok ? 'AA ' : 'REPROVA'}  (precisa 3:1)`);
          if (!ok) console.log('    nota: borda decorativa pode ficar abaixo de 3:1; borda de input nao.');
        }
      }
      console.log('');
    }

    if (foraDeBloco.length) {
      console.log('blocos ignorados por nao declararem fundo proprio:');
      for (const f of foraDeBloco) console.log(`  - ${f}`);
      console.log('');
    }
    // regra da casa: um auditor que nao conta o que deixou de avaliar reporta
    // "0 reprovacoes" e parece aprovacao.
    console.log(`cores nao avaliadas: ${naoAvaliadas}${naoAvaliadas ? '  (se nao for zero, o relatorio nao vale sozinho)' : ''}`);
  }
}

if (falhou) {
  console.log('\nREPROVOU. Piso 2 da skill: nenhuma cor entra sem passar em AA de texto normal (4.5:1).');
  process.exit(1);
}
console.log('\nok. Todos os pares passam AA de texto normal.');
