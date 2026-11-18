/* Arcade Local — Lote 3: Boliche, Mini Golf, Pinball, Doodle Jump.
   Usa o framework de games2.js (window.ArcadeKit): tela inicial, Pausar/Continuar, Reiniciar, resultado e recorde. */
(() => {
const K = window.ArcadeKit, A = window.ArcadeGames;
if (!K || !A) return;
const { arcade, sfx, clamp, rnd, rr } = K;
const PI = Math.PI, hypot = Math.hypot;
const pop = (x, p, big) => { x.save(); const k = p.t / 1.1; x.globalAlpha = Math.max(0, 1 - k * k); x.font = (big ? "900 30px" : "800 18px") + " sans-serif"; x.textAlign = "center"; x.lineWidth = 5; x.strokeStyle = "rgba(0,0,0,.65)"; x.strokeText(p.text, p.x, p.y - k * 40); x.fillStyle = p.col; x.fillText(p.text, p.x, p.y - k * 40); x.restore(); };
// círculo (bola) contra segmento (parede). vs = velocidade da superfície (para paredes móveis). Retorna a velocidade de impacto ou 0.
const segHit = (b, ax, ay, bx, by, rest, vsx = 0, vsy = 0) => {
  const ex = bx - ax, ey = by - ay, l2 = ex * ex + ey * ey; let t = ((b.x - ax) * ex + (b.y - ay) * ey) / l2; t = clamp(t, 0, 1);
  const px = ax + ex * t, py = ay + ey * t; let dx = b.x - px, dy = b.y - py, d = hypot(dx, dy); if (d >= b.r) return 0;
  if (d < 1e-6) { const l = Math.sqrt(l2) || 1; dx = -ey / l; dy = ex / l; d = 1; }
  const nx = dx / d, ny = dy / d; b.x = px + nx * b.r; b.y = py + ny * b.r;
  const vn = (b.vx - vsx) * nx + (b.vy - vsy) * ny; if (vn >= 0) return 0;
  b.vx -= (1 + rest) * vn * nx; b.vy -= (1 + rest) * vn * ny; return -vn;
};
// colisão círculo × círculo com massas (impulso elástico). Retorna a velocidade de impacto.
const circHit = (a, b, ma, mb, e) => {
  const dx = b.x - a.x, dy = b.y - a.y, d = hypot(dx, dy), mn = a.r + b.r; if (d >= mn || d === 0) return 0;
  const nx = dx / d, ny = dy / d, ov = mn - d, tm = ma + mb;
  a.x -= nx * ov * mb / tm; a.y -= ny * ov * mb / tm; b.x += nx * ov * ma / tm; b.y += ny * ov * ma / tm;
  const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (vn >= 0) return 0;
  const j = -(1 + e) * vn / (1 / ma + 1 / mb); a.vx -= j * nx / ma; a.vy -= j * ny / ma; b.vx += j * nx / mb; b.vy += j * ny / mb; return -vn;
};

/* ═══════════ 1) BOLICHE ═══════════ */
const scoreBowling = frames => {
  const rolls = frames.flatMap(f => f.r); let s = 0, i = 0;
  for (let f = 0; f < 10 && i < rolls.length; f++) {
    if (rolls[i] === 10) { s += 10 + (rolls[i + 1] || 0) + (rolls[i + 2] || 0); i++; }
    else if (rolls[i + 1] !== undefined && rolls[i] + rolls[i + 1] === 10) { s += 10 + (rolls[i + 2] || 0); i += 2; }
    else { s += rolls[i] + (rolls[i + 1] || 0); i += 2; }
  }
  return s;
};
/*BOWL-BEGIN*/
const L = 125, R = 355, BR = 24, PR = 13;
const bowlStep = (ball, pins, h) => {
    if (ball && ball.alive) {
      const b = ball; b.rot += hypot(b.vx, b.vy) * h / BR;
      if (!b.gut && b.y < 400) b.vx += b.spin * 300 * h; // efeito: a bola "pega" no seco, no fundo da pista
      b.x += b.vx * h; b.y += b.vy * h;
      if (!b.gut && (b.x < L || b.x > R)) { b.gut = true; b.vx = 0; b.x = b.x < L ? L - 10 : R + 10; }
      if (b.gut) { b.vx = 0; b.x = b.x < L ? L - 10 : R + 10; }
      if (b.y < 12) b.alive = false;
      if (!b.gut) for (const p of pins) { if (p.gone) continue; const imp = circHit(b, p, 6, 1.5, .62); if (imp > 30) { p.down = true; if (imp > 120) sfx(120 + Math.random() * 60, .06); } }
    }
    for (let i = 0; i < pins.length; i++) {
      const p = pins[i]; if (p.gone) continue; p.x += p.vx * h; p.y += p.vy * h;
      const s = hypot(p.vx, p.vy); if (s > 0) { const ns = Math.max(0, s - 260 * h); p.vx *= ns / s; p.vy *= ns / s; }
      if (p.x < L + PR) { p.x = L + PR; p.vx = Math.abs(p.vx) * .5; } if (p.x > R - PR) { p.x = R - PR; p.vx = -Math.abs(p.vx) * .5; } if (p.y < 20 + PR) { p.y = 20 + PR; p.vy = Math.abs(p.vy) * .4; }
      for (let j = i + 1; j < pins.length; j++) { const q = pins[j]; if (q.gone) continue; const imp = circHit(p, q, 1.5, 1.5, .7); if (imp > 25) { if (p.vx || p.vy || imp > 60) q.down = true; if (imp > 25) p.down = p.down || hypot(p.vx, p.vy) > 40; } }
    }
  };
/*BOWL-END*/
const boliche = arcade({
  id: "bowling", title: "Boliche", W: 480, H: 640, def: "Normal",
  hud: [["QUADRO", "1/10"], ["PINOS", "0"], ["PONTOS", "0"]],
  instr: ["10 quadros, 2 jogadas por quadro, como no boliche de verdade: strike (10 de uma vez) e spare (10 em duas) valem bônus. Máximo: 300 pontos.",
    "Mouse/toque: arraste para os lados na parte de baixo para escolher a posição, depois dê um deslize rápido para cima. A direção do deslize é a direção da bola, a velocidade é a força e a curva do gesto vira efeito (a bola faz a curva no fundo da pista).",
    "Teclado: ←/→ posição, A/D ângulo, segure Espaço (ou ↑) para carregar a força e solte para lançar. Bola na canaleta não derruba nada. Faça 100 pontos ou mais para vencer."],
  create(api) {
    const x = api.ctx, W = 480, L = 125, R = 355, BR = 24, PR = 13, BY = 566, FOUL = 590;
    const HOME = []; for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) HOME.push({ x: 240 + (i - r / 2) * 66.8, y: 215 - 57.8 * r });
    let pins, ball, frames, f, phase, tm, aim, drag, keys = {}, charge, chDir, pops, strikes, spares, tr, rollT, ang, kb, fin, pend;
    const rack = () => HOME.map(h => ({ hx: h.x, hy: h.y, x: h.x, y: h.y, vx: 0, vy: 0, r: PR, down: false, gone: false, a: 1, rot: Math.random() * 6 }));
    const hudAll = () => { api.hud(0, Math.min(f + 1, 10) + "/10"); api.hud(1, pins.filter(p => !p.gone && !p.down).length === 10 ? 0 : pins.filter(p => !p.gone && p.down).length); api.hud(2, scoreBowling(frames)); };
    const init = () => { pins = rack(); frames = Array.from({ length: 10 }, () => ({ r: [] })); f = 0; phase = "aim"; tm = 0; aim = { x: 240 }; drag = null; charge = 0; chDir = 1; pops = []; strikes = 0; spares = 0; tr = []; ball = null; ang = 0; kb = false; fin = null; pend = null; };
    const launch = (vx, vy, spin) => { ball = { x: aim.x, y: BY, vx, vy, spin, r: BR, gut: false, rot: 0, alive: true, stall: 0 }; phase = "roll"; rollT = 0; tr = []; sfx(180, .12); api.msg(""); };
    const fromSwipe = () => {
      const now = performance.now(), ps = drag.pts.filter(p => now - p.t < 200); if (ps.length < 2) return;
      const p1 = ps[0], p2 = ps[ps.length - 1], dt = (p2.t - p1.t) / 1000; if (dt < .015) return;
      const vx = (p2.x - p1.x) / dt, vy = (p2.y - p1.y) / dt, sp = hypot(vx, vy);
      if (vy > -200 || sp < 350) { api.msg("Deslize mais rápido para cima!"); return; }
      const a = clamp(Math.atan2(vx, -vy), -.5, .5), v = clamp(sp * .5, 430, 980), m = ps[ps.length >> 1], ch = hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      const cross = (p2.x - p1.x) * (m.y - p1.y) - (p2.y - p1.y) * (m.x - p1.x), spin = clamp(-(cross / ch) / 40, -1, 1);
      launch(Math.sin(a) * v, -Math.cos(a) * v, spin);
    };
    const endRoll = () => {
      pins.forEach(p => { if (!p.gone && !p.down && hypot(p.x - p.hx, p.y - p.hy) > 26) p.down = true; });
      const k = pins.filter(p => !p.gone && p.down).length, fr = frames[f].r; fr.push(k);
      let done = false, reset = false, txt = k + (k === 1 ? " pino" : " pinos");
      if (f < 9) { if (fr.length === 1 && k === 10) { done = true; reset = true; } else if (fr.length === 2) { done = true; reset = true; } }
      else if (fr.length === 1) reset = k === 10;
      else if (fr.length === 2) { if (fr[0] === 10) reset = k === 10; else if (fr[0] + k === 10) reset = true; else done = true; }
      else done = true;
      const spare = fr.length >= 2 && !(fr.length === 2 && fr[0] === 10) && fr[fr.length - 2] + k === 10 && fr[fr.length - 2] < 10 && !(f === 9 && fr.length === 3 && fr[0] + fr[1] === 10 && false);
      if (k === 10 && (fr.length === 1 || f === 9)) { strikes++; txt = "STRIKE!"; sfx(880, .25); } else if (spare && k > 0) { spares++; txt = "SPARE!"; sfx(660, .2); } else if (k === 0) txt = ball && ball.gut ? "Canaleta..." : "Errou tudo";
      pops.push({ x: 240, y: 330, t: 0, text: txt, col: k === 10 ? "#fde047" : "#e2e8f0" }); api.msg(txt);
      pend = { done, reset }; phase = "sweep"; tm = 0; hudAll();
    };
    const next = () => {
      pins = pend.reset ? rack() : pins.filter(p => !p.gone);
      if (pend.done && f < 9) f++;
      else if (pend.done && f === 9) { const t = scoreBowling(frames); api.finish(t, t >= 100 ? "win" : "loss", { title: t === 300 ? "JOGO PERFEITO!" : t >= 100 ? "BOA PARTIDA!" : "FIM DE JOGO", lines: [`Strikes: ${strikes}  •  Spares: ${spares}`, "Meta para vencer: 100 pontos"] }); return; }
      phase = "aim"; ball = null; aim.x = clamp(aim.x, L + BR, R - BR); hudAll();
    };
    const step = h => bowlStep(ball, pins, h);
    init();
    return {
      start() { init(); hudAll(); api.msg("Deslize para cima para lançar"); },
      idle() { init(); }, dbg: () => ({ phase, f, frames, pins: pins.filter(q => !q.gone).length, ball }),
      ptr(type, px, py) {
        if (phase !== "aim") return; const now = performance.now();
        if (type === "down") { drag = { pts: [{ x: px, y: py, t: now }] }; kb = false; if (py > 470) aim.x = clamp(px, L + BR, R - BR); }
        else if (type === "move" && drag) { drag.pts.push({ x: px, y: py, t: now }); if (drag.pts.length > 40) drag.pts.shift(); if (py > 500) aim.x = clamp(px, L + BR, R - BR); }
        else if (type === "up" && drag) { drag.pts.push({ x: px, y: py, t: now }); fromSwipe(); drag = null; }
      },
      key(e, down) {
        const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (["ArrowLeft", "ArrowRight", "a", "d"].includes(k)) { keys[k] = down; kb = true; return true; }
        if (k === " " || k === "ArrowUp") { if (phase === "aim") { if (down && !charge && !keys.ch) { keys.ch = true; charge = .001; chDir = 1; kb = true; } else if (!down && keys.ch) { keys.ch = false; const pw = charge; charge = 0; launch(Math.sin(ang) * (430 + pw * 550), -Math.cos(ang) * (430 + pw * 550), 0); } } return true; }
        return false;
      },
      update(dt) {
        tm += dt; pops.forEach(p => { p.t += dt; }); pops = pops.filter(p => p.t < 1.1);
        if (phase === "aim") {
          aim.x = clamp(aim.x + ((keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)) * 200 * dt, L + BR, R - BR);
          ang = clamp(ang + ((keys.d ? 1 : 0) - (keys.a ? 1 : 0)) * .9 * dt, -.5, .5);
          if (keys.ch) { charge += chDir * 1.3 * dt; if (charge > 1) { charge = 1; chDir = -1; } if (charge < 0) { charge = 0; chDir = 1; } }
        } else if (phase === "roll") {
          rollT += dt; const n = 8; for (let i = 0; i < n; i++) step(dt / n);
          if (ball.alive && !ball.gut) { tr.push({ x: ball.x, y: ball.y }); if (tr.length > 14) tr.shift(); }
          if (ball.alive && hypot(ball.vx, ball.vy) < 25) ball.stall += dt; else ball.stall = 0;
          const moving = pins.some(p => !p.gone && hypot(p.vx, p.vy) > 12), over = !ball.alive || ball.stall > .5 || ball.y < 12;
          if ((over && !moving) || rollT > 9) { tm = 0; phase = "settle"; }
        } else if (phase === "settle") { const n = 8; for (let i = 0; i < n; i++) step(dt / n); if (tm > .6) endRoll(); }
        else if (phase === "sweep") { pins.forEach(p => { if (p.down && !p.gone) { p.a = Math.max(0, 1 - tm / .8); if (p.a <= 0) p.gone = true; } }); if (tm > 1.1) next(); }
      },
      draw() {
        x.clearRect(0, 0, W, 640); let g = x.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, "#050816"); g.addColorStop(1, "#0b1030"); x.fillStyle = g; x.fillRect(0, 0, W, 640);
        x.fillStyle = "#0a0f24"; x.fillRect(0, 0, W, 640);
        // canaletas, pista e tábuas
        x.fillStyle = "#1b2540"; x.fillRect(L - 22, 0, 22, FOUL + 10); x.fillRect(R, 0, 22, FOUL + 10); x.fillStyle = "#0b1220"; x.fillRect(L - 16, 0, 10, FOUL + 10); x.fillRect(R + 6, 0, 10, FOUL + 10);
        g = x.createLinearGradient(L, 0, R, 0); g.addColorStop(0, "#b7791f"); g.addColorStop(.5, "#d69e3a"); g.addColorStop(1, "#b7791f"); x.fillStyle = g; x.fillRect(L, 0, R - L, FOUL + 10);
        x.strokeStyle = "rgba(90,50,10,.28)"; x.lineWidth = 1; for (let i = 1; i < 20; i++) { x.beginPath(); x.moveTo(L + i * (R - L) / 20, 0); x.lineTo(L + i * (R - L) / 20, FOUL + 10); x.stroke(); }
        x.fillStyle = "rgba(0,0,0,.55)"; x.fillRect(L, 0, R - L, 26); // fosso
        x.fillStyle = "rgba(60,30,5,.65)"; for (let i = 0; i < 7; i++) { const ax = L + 20 + i * 31, ay = 430 + Math.abs(3 - i) * 14; x.beginPath(); x.moveTo(ax, ay - 12); x.lineTo(ax + 6, ay + 4); x.lineTo(ax - 6, ay + 4); x.fill(); }
        x.fillStyle = "rgba(60,30,5,.55)"; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(L + 28 + i * 43, 520, 3, 0, 7); x.fill(); }
        x.fillStyle = "#ef4444"; x.fillRect(L - 22, FOUL, R - L + 44, 4);
        // pinos
        pins.forEach(p => {
          if (p.gone) return; x.save(); x.globalAlpha = p.a; x.translate(p.x, p.y);
          if (p.down) { x.rotate(Math.atan2(p.vy, p.vx) + p.rot); x.fillStyle = "#f8fafc"; x.beginPath(); x.ellipse(0, 0, 21, 8, 0, 0, 7); x.fill(); x.fillStyle = "#ef4444"; x.fillRect(5, -8, 4, 16); x.fillRect(11, -7, 3, 14); }
          else { x.fillStyle = "rgba(0,0,0,.28)"; x.beginPath(); x.ellipse(2, 3, 13, 11, 0, 0, 7); x.fill(); x.fillStyle = "#f8fafc"; x.beginPath(); x.arc(0, 0, PR, 0, 7); x.fill(); x.strokeStyle = "#ef4444"; x.lineWidth = 3; x.beginPath(); x.arc(0, 0, 8.5, 0, 7); x.stroke(); x.fillStyle = "#e2e8f0"; x.beginPath(); x.arc(0, 0, 5, 0, 7); x.fill(); }
          x.restore();
        });
        // rastro e bola
        tr.forEach((t, i) => { x.fillStyle = `rgba(167,139,250,${i / 40})`; x.beginPath(); x.arc(t.x, t.y, BR * .6, 0, 7); x.fill(); });
        const bx = ball ? ball.x : aim.x, by = ball ? ball.y : BY;
        if ((ball && ball.alive) || !ball) {
          x.save(); x.translate(bx, by); x.fillStyle = "rgba(0,0,0,.3)"; x.beginPath(); x.ellipse(3, 4, BR, BR * .92, 0, 0, 7); x.fill();
          g = x.createRadialGradient(-7, -8, 3, 0, 0, BR); g.addColorStop(0, "#c4b5fd"); g.addColorStop(.5, "#6d28d9"); g.addColorStop(1, "#1e1b4b"); x.fillStyle = g; x.beginPath(); x.arc(0, 0, BR, 0, 7); x.fill();
          x.rotate(ball ? ball.rot : 0); x.fillStyle = "#0f0a2e"; [[-5, -8], [5, -8], [0, 2]].forEach(([hx, hy]) => { x.beginPath(); x.arc(hx, hy, 3.2, 0, 7); x.fill(); }); x.restore();
        }
        if (phase === "aim") {
          x.strokeStyle = "rgba(34,211,238,.55)"; x.lineWidth = 2; x.setLineDash([6, 8]); x.beginPath(); x.moveTo(aim.x, BY - BR);
          const a = kb ? ang : 0; x.lineTo(aim.x + Math.sin(a) * 340, BY - BR - Math.cos(a) * 340); x.stroke(); x.setLineDash([]);
          if (drag && drag.pts.length > 1) { x.strokeStyle = "rgba(253,224,71,.8)"; x.lineWidth = 3; x.beginPath(); drag.pts.forEach((p, i) => i ? x.lineTo(p.x, p.y) : x.moveTo(p.x, p.y)); x.stroke(); }
          if (keys.ch || charge > 0) { x.fillStyle = "#0b1220"; x.fillRect(40, 470, 14, 100); x.fillStyle = `hsl(${120 - charge * 120},90%,55%)`; x.fillRect(40, 570 - charge * 100, 14, charge * 100); }
        }
        // placar
        const sc = []; { const rolls = frames.flatMap(q => q.r); let i = 0, tot = 0; for (let q = 0; q < 10; q++) { const r = frames[q].r; let cum = null; if (rolls[i] === 10) { if (rolls[i + 1] !== undefined && rolls[i + 2] !== undefined) { tot += 10 + rolls[i + 1] + rolls[i + 2]; cum = tot; } i++; } else if (rolls[i + 1] !== undefined) { if (rolls[i] + rolls[i + 1] === 10) { if (rolls[i + 2] !== undefined) { tot += 10 + rolls[i + 2]; cum = tot; } } else { tot += rolls[i] + rolls[i + 1]; cum = tot; } i += 2; } else i += 2; sc.push({ r, cum }); } }
        x.font = "700 10px sans-serif"; x.textAlign = "center";
        sc.forEach((q, i) => {
          const bx0 = 10 + i * 46; x.fillStyle = i === f && phase !== "over" ? "#1e3a5f" : "#111a33"; x.fillRect(bx0, 598, 44, 38); x.strokeStyle = "#334155"; x.strokeRect(bx0 + .5, 598.5, 43, 37);
          x.fillStyle = "#e2e8f0"; q.r.forEach((k, j) => { const prev = q.r[j - 1]; let t = k === 0 ? "-" : String(k); if (k === 10 && (i < 9 ? j === 0 : true)) t = "X"; else if (j > 0 && prev !== 10 && prev + k === 10) t = "/"; x.fillText(t, bx0 + 12 + j * 14, 612); });
          if (q.cum !== null) { x.font = "800 13px sans-serif"; x.fillStyle = "#67e8f9"; x.fillText(q.cum, bx0 + 22, 630); x.font = "700 10px sans-serif"; }
        }); x.textAlign = "left";
        pops.forEach(p => pop(x, p, true));
      }
    };
  }
});

/* ═══════════ 2) MINI GOLF ═══════════ */
/*GOLF-BEGIN*/
const GOLF = [
  { par: 2, poly: [[150, 90], [330, 90], [330, 610], [150, 610]], tee: [240, 560], cup: [240, 140] },
  { par: 3, poly: [[60, 430], [290, 430], [290, 90], [420, 90], [420, 610], [60, 610]], tee: [110, 550], cup: [360, 140] },
  { par: 3, poly: [[100, 90], [380, 90], [380, 610], [100, 610]], circ: [[190, 320, 22], [290, 320, 22], [240, 230, 22]], tee: [240, 560], cup: [240, 140] },
  { par: 3, poly: [[120, 90], [360, 90], [360, 610], [120, 610]], sand: [[120, 300, 240, 110]], tee: [240, 570], cup: [240, 130] },
  { par: 3, poly: [[100, 90], [380, 90], [380, 610], [100, 610]], water: [[100, 290, 200, 90]], tee: [160, 570], cup: [160, 130] },
  { par: 3, poly: [[140, 90], [340, 90], [340, 610], [140, 610]], mill: [{ x: 240, y: 350, len: 92, w: 1.7 }], tee: [240, 570], cup: [240, 130] },
  { par: 4, poly: [[80, 90], [400, 90], [400, 610], [80, 610]], rect: [[80, 420, 210, 14], [190, 280, 210, 14], [80, 150, 210, 14]], tee: [120, 570], cup: [350, 125] },
  { par: 3, poly: [[120, 90], [360, 90], [360, 610], [120, 610]], boost: [{ x: 120, y: 300, w: 240, h: 70, ax: 520, ay: 0 }], tee: [160, 570], cup: [320, 130] },
  { par: 4, poly: [[60, 90], [420, 90], [420, 610], [60, 610]], mill: [{ x: 240, y: 330, len: 80, w: -1.4 }], circ: [[130, 210, 20], [350, 210, 20]], sand: [[60, 470, 110, 60]], water: [[330, 470, 90, 60]], tee: [240, 570], cup: [240, 130] }
];
const GV = 560, GFR = 150; // velocidade máxima da tacada (px/s) e atrito da grama (px/s²)
GOLF.forEach(H => {
  H.segs = []; H.poly.forEach((p, i) => { const q = H.poly[(i + 1) % H.poly.length]; H.segs.push([p[0], p[1], q[0], q[1], .8]); });
  (H.rect || []).forEach(([a, b, w, h]) => { [[a, b, a + w, b], [a + w, b, a + w, b + h], [a + w, b + h, a, b + h], [a, b + h, a, b]].forEach(s => H.segs.push([...s, .75])); });
});
const inR = (b, r) => b.x > r[0] && b.x < r[0] + r[2] && b.y > r[1] && b.y < r[1] + r[3];
const golfNew = H => ({ b: { x: H.tee[0], y: H.tee[1], vx: 0, vy: 0, r: 7 }, t: Math.random() * 6, sunk: false, wet: false });
const golfStep = (S, H, h) => {
  const b = S.b; S.t += h; let fr = GFR, boosted = false;
  if (H.sand && H.sand.some(r => inR(b, r))) fr = 720;
  if (H.boost) H.boost.forEach(z => { if (inR(b, [z.x, z.y, z.w, z.h])) { b.vx += z.ax * h; b.vy += z.ay * h; boosted = true; } });
  const sp = hypot(b.vx, b.vy); if (sp > 0) { const ns = Math.max(0, sp - fr * h); b.vx *= ns / sp; b.vy *= ns / sp; if (ns < 8 && !boosted) { b.vx = b.vy = 0; } }
  b.x += b.vx * h; b.y += b.vy * h;
  for (let k = 0; k < 2; k++) H.segs.forEach(s => segHit(b, s[0], s[1], s[2], s[3], s[4]));
  if (H.circ) H.circ.forEach(([cx, cy, cr]) => { const dx = b.x - cx, dy = b.y - cy, d = hypot(dx, dy), mn = cr + b.r; if (d < mn && d > 0) { const nx = dx / d, ny = dy / d; b.x = cx + nx * mn; b.y = cy + ny * mn; const vn = b.vx * nx + b.vy * ny; if (vn < 0) { b.vx -= 1.9 * vn * nx; b.vy -= 1.9 * vn * ny; } } });
  if (H.mill) H.mill.forEach(m => { for (let k = 0; k < 2; k++) { const th = m.w * S.t + k * PI / 2 + (m.ph || 0), c = Math.cos(th) * m.len, s = Math.sin(th) * m.len, r0 = b.r; b.r = r0 + 3; segHit(b, m.x - c, m.y - s, m.x + c, m.y + s, .8, -m.w * (b.y - m.y), m.w * (b.x - m.x)); b.r = r0; } });
  if (H.water && H.water.some(r => inR(b, r))) S.wet = true;
  const dx = H.cup[0] - b.x, dy = H.cup[1] - b.y, d = hypot(dx, dy), spd = hypot(b.vx, b.vy);
  if (d < 11 && spd < 260) S.sunk = true; else if (d < 16 && d > 0) { b.vx += dx / d * 260 * h; b.vy += dy / d * 260 * h; }
};
/*GOLF-END*/
const NAMES = ["Eagle!", "Birdie!", "Par", "Bogey"];
const golf = arcade({
  id: "minigolf", title: "Mini Golf", W: 480, H: 640, def: "Normal",
  hud: [["BURACO", "1/9"], ["TACADAS", "0"], ["PONTOS", "0"]],
  instr: ["9 buracos com paredes, obstáculos, areia (freia a bola), água (+1 tacada e volta ao ponto anterior), moinhos e rampas. Menos tacadas = mais pontos: (par + 3 − tacadas) × 100, e buraco em uma: +300.",
    "Mouse/toque: puxe para trás como num estilingue (em qualquer lugar da tela); a bola vai na direção contrária e a força é o tamanho da puxada. A bola só cai no buraco se chegar devagar.",
    "Teclado: ←/→ gira a mira, segure Espaço (ou ↑) para carregar a força e solte para tacar. Máximo de 7 tacadas por buraco. Termine com no máximo par + 3 no total para vencer."],
  create(api) {
    const x = api.ctx, W = 480, TP = GOLF.reduce((s, h) => s + h.par, 0);
    let hi, S, st, strokes, last, tot, pts, drag, aimA, charge, chDir, kb, keys = {}, pops, tm, trail, sink, tt = 0, held;
    const hudAll = () => { api.hud(0, Math.min(hi + 1, 9) + "/9"); api.hud(1, strokes); api.hud(2, pts); };
    const load = i => { hi = i; const H = GOLF[hi]; S = golfNew(H); last = { x: H.tee[0], y: H.tee[1] }; strokes = 0; st = "aim"; drag = null; trail = []; sink = 0; aimA = Math.atan2(H.cup[0] - H.tee[0], -(H.cup[1] - H.tee[1])); charge = 0; hudAll(); };
    const init = () => { tot = 0; pts = 0; pops = []; kb = false; held = false; tm = 0; load(0); };
    const shoot = (a, pw) => { S.b.vx = Math.sin(a) * pw * GV; S.b.vy = -Math.cos(a) * pw * GV; last = { x: S.b.x, y: S.b.y }; strokes++; st = "roll"; trail = []; sfx(260 + pw * 200, .08); hudAll(); api.msg(""); };
    const holeDone = (picked) => {
      const H = GOLF[hi]; let add = picked ? 0 : Math.max(0, H.par + 3 - strokes) * 100 + (strokes === 1 ? 300 : 0); pts += add; tot += strokes;
      const d = strokes - H.par, txt = picked ? "Máximo de tacadas (0 pts)" : strokes === 1 ? "HOLE IN ONE! +" + add : (NAMES[d + 2] || "+" + d) + " +" + add; api.msg(txt);
      pops.push({ x: 240, y: 320, t: 0, text: txt, col: add >= 300 ? "#fde047" : "#e2e8f0" }); st = "done"; tm = 0; if (!picked) sfx(740, .2); hudAll();
    };
    init();
    return {
      start() { init(); api.msg(""); },
      idle() { init(); }, dbg: () => ({ hi, st, strokes, S }),
      ptr(type, px, py) {
        if (st !== "aim") return;
        if (type === "down") { drag = { sx: px, sy: py, px, py }; kb = false; }
        else if (type === "move" && drag) { drag.px = px; drag.py = py; }
        else if (type === "up" && drag) { const dx = drag.sx - px, dy = drag.sy - py, pw = Math.min(1, hypot(dx, dy) / 140); drag = null; if (pw > .06) shoot(Math.atan2(dx, -dy), pw); }
      },
      key(e, down) {
        const k = e.key;
        if (k === "ArrowLeft" || k === "ArrowRight") { keys[k] = down; kb = true; return true; }
        if (k === " " || k === "ArrowUp") { if (st === "aim") { if (down && !held) { held = true; charge = .001; chDir = 1; kb = true; } else if (!down && held) { held = false; const pw = Math.max(.08, charge); charge = 0; shoot(aimA, pw); } } return true; }
        return false;
      },
      update(dt) {
        tt += dt; tm += dt; pops.forEach(p => { p.t += dt; }); pops = pops.filter(p => p.t < 1.1);
        const H = GOLF[hi];
        if (st === "aim") { aimA += ((keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)) * 1.5 * dt; if (held) { charge += chDir * 1.2 * dt; if (charge > 1) { charge = 1; chDir = -1; } if (charge < 0) { charge = 0; chDir = 1; } } }
        else if (st === "roll") {
          const n = Math.max(1, Math.ceil(dt * 240)); for (let i = 0; i < n && st === "roll"; i++) {
            golfStep(S, H, dt / n);
            if (S.sunk) { st = "sink"; sink = 0; break; }
            if (S.wet) { S.wet = false; S.b.x = last.x; S.b.y = last.y; S.b.vx = S.b.vy = 0; strokes++; pops.push({ x: S.b.x, y: S.b.y - 20, t: 0, text: "Água! +1", col: "#38bdf8" }); sfx(150, .2); hudAll(); st = "aim"; break; }
          }
          if (st === "roll") { trail.push({ x: S.b.x, y: S.b.y }); if (trail.length > 10) trail.shift(); if (!S.b.vx && !S.b.vy) { if (strokes >= 7) holeDone(true); else { st = "aim"; aimA = Math.atan2(H.cup[0] - S.b.x, -(H.cup[1] - S.b.y)); } } }
        } else if (st === "sink") { sink += dt; S.b.x += (H.cup[0] - S.b.x) * Math.min(1, dt * 14); S.b.y += (H.cup[1] - S.b.y) * Math.min(1, dt * 14); if (sink > .35) holeDone(false); }
        else if (st === "done") { if (tm > 1.3) { if (hi >= 8) { api.finish(pts, tot <= TP + 3 ? "win" : "loss", { title: tot <= TP ? "MESTRE DO GOLF!" : tot <= TP + 3 ? "BOA RODADA!" : "FIM DA RODADA", lines: [`Tacadas: ${tot}  (par ${TP})`, "Meta para vencer: par + 3"] }); } else load(hi + 1); } }
      },
      draw() {
        const H = GOLF[hi]; x.clearRect(0, 0, W, 640); x.fillStyle = "#070b1a"; x.fillRect(0, 0, W, 640);
        x.fillStyle = "rgba(255,255,255,.04)"; for (let i = 0; i < 40; i++) x.fillRect((i * 97) % W, (i * 53) % 640, 2, 2);
        x.beginPath(); H.poly.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath();
        const g = x.createLinearGradient(0, 80, 0, 620); g.addColorStop(0, "#15803d"); g.addColorStop(1, "#166534"); x.fillStyle = g; x.fill();
        x.save(); x.clip(); x.strokeStyle = "rgba(255,255,255,.05)"; x.lineWidth = 8; for (let i = -10; i < 30; i++) { x.beginPath(); x.moveTo(i * 28, 80); x.lineTo(i * 28 + 60, 620); x.stroke(); }
        (H.sand || []).forEach(r => { x.fillStyle = "#d6b878"; x.fillRect(...r); x.fillStyle = "rgba(120,90,40,.35)"; for (let i = 0; i < r[2] * r[3] / 160; i++) x.fillRect(r[0] + (i * 37) % r[2], r[1] + (i * 53) % r[3], 2, 2); });
        (H.water || []).forEach(r => { const gg = x.createLinearGradient(0, r[1], 0, r[1] + r[3]); gg.addColorStop(0, "#0ea5e9"); gg.addColorStop(1, "#0369a1"); x.fillStyle = gg; x.fillRect(...r); x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 2; for (let i = 0; i < 4; i++) { x.beginPath(); for (let k = 0; k <= r[2]; k += 8) x.lineTo(r[0] + k, r[1] + 14 + i * 20 + Math.sin(k / 12 + tt * 3 + i) * 3); x.stroke(); } });
        (H.boost || []).forEach(z => { x.fillStyle = "rgba(34,211,238,.22)"; x.fillRect(z.x, z.y, z.w, z.h); x.strokeStyle = "#22d3ee"; x.lineWidth = 3; for (let k = 0; k < z.w; k += 36) { const ax = z.x + ((k + tt * 60) % z.w); x.beginPath(); x.moveTo(ax, z.y + z.h / 2 - 12); x.lineTo(ax + 12, z.y + z.h / 2); x.lineTo(ax, z.y + z.h / 2 + 12); x.stroke(); } });
        x.restore();
        x.strokeStyle = "#cbd5e1"; x.lineWidth = 7; x.lineJoin = "round"; x.beginPath(); H.poly.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.shadowColor = "#22d3ee"; x.shadowBlur = 14; x.stroke(); x.shadowBlur = 0;
        (H.rect || []).forEach(r => { x.fillStyle = "#92400e"; x.fillRect(...r); x.strokeStyle = "#fbbf24"; x.lineWidth = 2; x.strokeRect(r[0] + 1, r[1] + 1, r[2] - 2, r[3] - 2); });
        (H.circ || []).forEach(([cx, cy, cr]) => { x.shadowColor = "#f472b6"; x.shadowBlur = 14; x.fillStyle = "#be185d"; x.beginPath(); x.arc(cx, cy, cr, 0, 7); x.fill(); x.shadowBlur = 0; x.fillStyle = "#f9a8d4"; x.beginPath(); x.arc(cx - 5, cy - 5, cr * .35, 0, 7); x.fill(); });
        (H.mill || []).forEach(m => { for (let k = 0; k < 2; k++) { const th = m.w * (S.t) + k * PI / 2 + (m.ph || 0), c = Math.cos(th) * m.len, s = Math.sin(th) * m.len; x.strokeStyle = "#fde68a"; x.lineWidth = 7; x.lineCap = "round"; x.beginPath(); x.moveTo(m.x - c, m.y - s); x.lineTo(m.x + c, m.y + s); x.stroke(); } x.fillStyle = "#b45309"; x.beginPath(); x.arc(m.x, m.y, 9, 0, 7); x.fill(); });
        // tee e buraco com bandeira
        x.fillStyle = "rgba(255,255,255,.18)"; x.beginPath(); x.arc(H.tee[0], H.tee[1], 14, 0, 7); x.fill();
        x.fillStyle = "#020617"; x.beginPath(); x.arc(H.cup[0], H.cup[1], 11, 0, 7); x.fill(); x.strokeStyle = "#475569"; x.lineWidth = 2; x.stroke();
        x.strokeStyle = "#e2e8f0"; x.lineWidth = 2; x.beginPath(); x.moveTo(H.cup[0], H.cup[1]); x.lineTo(H.cup[0], H.cup[1] - 44); x.stroke(); x.fillStyle = "#ef4444"; x.beginPath(); x.moveTo(H.cup[0], H.cup[1] - 44); x.lineTo(H.cup[0] + 22, H.cup[1] - 37); x.lineTo(H.cup[0], H.cup[1] - 30); x.fill();
        // bola, rastro e mira
        trail.forEach((t, i) => { x.fillStyle = `rgba(255,255,255,${i / 30})`; x.beginPath(); x.arc(t.x, t.y, 5, 0, 7); x.fill(); });
        if (st !== "done" || true) { const r = st === "sink" ? 7 * (1 - sink / .35 * .6) : 7; x.fillStyle = "rgba(0,0,0,.3)"; x.beginPath(); x.ellipse(S.b.x + 2, S.b.y + 3, r, r * .8, 0, 0, 7); x.fill(); x.fillStyle = "#f8fafc"; x.beginPath(); x.arc(S.b.x, S.b.y, r, 0, 7); x.fill(); x.fillStyle = "#cbd5e1"; x.beginPath(); x.arc(S.b.x + 2, S.b.y + 2, r * .5, 0, 7); x.fill(); }
        if (st === "aim") {
          let a = aimA, pw = held ? charge : 0, show = kb || held;
          if (drag) { const dx = drag.sx - drag.px, dy = drag.sy - drag.py; pw = Math.min(1, hypot(dx, dy) / 140); a = Math.atan2(dx, -dy); show = pw > .02; }
          if (show || !drag) { const len = 40 + pw * 140, dx = Math.sin(a), dy = -Math.cos(a); x.strokeStyle = `hsl(${120 - pw * 120},90%,60%)`; x.lineWidth = 3; x.setLineDash([2, 9]); x.lineCap = "round"; x.beginPath(); x.moveTo(S.b.x + dx * 12, S.b.y + dy * 12); x.lineTo(S.b.x + dx * len, S.b.y + dy * len); x.stroke(); x.setLineDash([]); }
        }
        // cabeçalho do buraco
        x.fillStyle = "rgba(2,6,23,.75)"; x.fillRect(0, 0, W, 54); x.fillStyle = "#e2e8f0"; x.font = "800 16px sans-serif"; x.textAlign = "left"; x.fillText("BURACO " + (hi + 1), 16, 24); x.fillStyle = "#94a3b8"; x.font = "700 13px sans-serif"; x.fillText("PAR " + H.par + "  •  TACADA " + (st === "aim" || st === "roll" ? strokes + (st === "aim" ? 1 : 0) : strokes), 16, 44);
        x.textAlign = "right"; x.fillStyle = "#67e8f9"; x.fillText("Total: " + tot + " tacadas  (par " + TP + ")", W - 16, 24); x.textAlign = "left";
        pops.forEach(p => pop(x, p, true));
      }
    };
  }
});

/* ═══════════ 3) PINBALL ═══════════ */
const pinball = arcade({
  id: "pinball", title: "Pinball", W: 480, H: 640, def: "Normal",
  hud: [["BOLAS", "3"], ["MULT", "x1"], ["PONTOS", "0"]],
  instr: ["3 bolas. Bumpers valem 100, estilingues 25, alvos laterais 150. Acenda os 3 sinais de cima para subir o multiplicador (até x5) e derrube os 4 alvos laterais para ganhar 1000. A mesa é inclinada: a gravidade puxa a bola para baixo.",
    "Mouse/toque: segure para carregar a mola e solte para lançar a bola; depois toque no lado esquerdo ou direito da tela para acionar o flipper daquele lado (toque no meio para os dois).",
    "Teclado: ← / Z = flipper esquerdo, → / M = direito, Espaço (ou ↓) = carregar e lançar (com a bola em jogo, Espaço aciona os dois). Faça 2500 pontos para vencer."],
  create(api) {
    const x = api.ctx, W = 480, G = 760, BRAD = 9, FL = 72, FR = 7, WE = 14, WU = 16;
    const segs = []; { // paredes: arco superior, laterais, canal do lançador e guias dos flippers
      let px = 24, py = 240; for (let a = PI + .12; a <= 2 * PI + .001; a += .12) { const nx = 244 + 220 * Math.cos(a), ny = 240 + 220 * Math.sin(a); segs.push([px, py, nx, ny]); px = nx; py = ny; } segs.push([px, py, 464, 240]);
      segs.push([24, 240, 24, 500], [464, 240, 464, 620], [424, 300, 424, 620], [424, 620, 464, 620], [24, 500, 130, 572], [424, 500, 318, 572]);
    }
    const GATE = [464, 284, 424, 300], BUMP = [[140, 200], [300, 185], [218, 285]];
    const SL = [{ a: [64, 420], b: [64, 490], c: [116, 535] }, { a: [384, 420], b: [384, 490], c: [332, 535] }];
    const TG = [[24, 330, 24, 360, 0], [24, 372, 24, 402, 0], [424, 330, 424, 360, 0], [424, 372, 424, 402, 0]]; // alvos: x1,y1,x2,y2,aceso
    let ball, bl, score, mult, st, tm, charge, held, keys, touch, lane, tgt, fl, bflash, sflash, pops, saveT, stuck, tt = 0, still, lastScore;
    const mkFl = (px, py, rest, up) => ({ px, py, rest, up, ph: rest, w: 0, on: false });
    const hudAll = () => { api.hud(0, bl); api.hud(1, "x" + mult); api.hud(2, score); };
    const add = (n, px, py, txt) => { const v = n * mult; score += v; pops.push({ x: px, y: py, t: 0, text: txt || "+" + v, col: "#fde047" }); hudAll(); };
    const newBall = () => { ball = { x: 444, y: 611, vx: 0, vy: 0, r: BRAD }; st = "wait"; charge = 0; held = false; saveT = 0; stuck = 0; };
    const init = () => { score = 0; mult = 1; bl = 3; keys = {}; touch = { l: false, r: false }; lane = [0, 0, 0]; tgt = TG.map(() => 0); fl = [mkFl(138, 580, .5, -.5), mkFl(310, 580, PI - .5, PI + .5)]; bflash = [0, 0, 0]; sflash = [0, 0]; pops = []; tm = 0; lastScore = 0; newBall(); hudAll(); };
    const launch = pw => { ball.vy = -(840 + pw * 700); ball.vx = 0; st = "play"; saveT = 5; sfx(200 + pw * 200, .15); api.msg(""); };
    const flip = (f, on, h) => { // gira com velocidade angular finita (a velocidade da superfície dá o "chute")
      const tgtA = on ? f.up : f.rest, w = on ? 15 : 9, d = tgtA - f.ph, s = Math.sign(d) * Math.min(Math.abs(d), w * h); f.ph += s; f.w = s / h;
    };
    const wall = (b, s, rest, one) => {
      if (one) { const nx = -16 / 43, ny = -40 / 43; if ((b.x - s[0]) * nx + (b.y - s[1]) * ny < 0) return 0; }
      return segHit(b, s[0], s[1], s[2], s[3], rest);
    };
    const step = h => {
      const b = ball; b.vy += G * h; const sp = hypot(b.vx, b.vy); if (sp > 1700) { b.vx *= 1700 / sp; b.vy *= 1700 / sp; }
      b.x += b.vx * h; b.y += b.vy * h;
      flip(fl[0], keys.l || touch.l, h); flip(fl[1], keys.r || touch.r, h);
      for (const s of segs) { const im = wall(b, s, .5); if (im > 260) sfx(300, .03); }
      wall(b, GATE, .3, true);
      TG.forEach((t, i) => { if (b.x > 420 && i >= 2 && b.y > 300 && b.x > 424 + 2) return; const im = segHit(b, t[0], t[1], t[2], t[3], .5); if (im > 60 && b.x < 421 + 1) { if (!tgt[i]) { tgt[i] = 1; add(150, b.x, b.y - 20); sfx(520, .08); if (tgt.every(Boolean)) { add(1000, 240, 380, "ALVOS! +" + 1000 * mult); tgt = tgt.map(() => 0); sfx(900, .3); } } } });
      SL.forEach((s, i) => { segHit(b, s.a[0], s.a[1], s.b[0], s.b[1], .4); segHit(b, s.b[0], s.b[1], s.c[0], s.c[1], .4); const im = segHit(b, s.a[0], s.a[1], s.c[0], s.c[1], .55); if (im > 70) { const dx = s.c[1] - s.a[1], dy = -(s.c[0] - s.a[0]), l = hypot(dx, dy), sg = i ? -1 : 1; b.vx += sg * Math.abs(dy) / l * 330 * (i ? -1 : 1) * 0 + (i ? -1 : 1) * 300; b.vy -= 160; sflash[i] = .15; add(25, b.x, b.y - 15); sfx(420, .05); } });
      BUMP.forEach(([cx, cy], i) => { const dx = b.x - cx, dy = b.y - cy, d = hypot(dx, dy), mn = 22 + b.r; if (d < mn && d > 0) { const nx = dx / d, ny = dy / d; b.x = cx + nx * mn; b.y = cy + ny * mn; const vn = b.vx * nx + b.vy * ny; if (vn < 0) b.vx -= 2 * vn * nx, b.vy -= 2 * vn * ny; const s2 = hypot(b.vx, b.vy); if (s2 < 520) { b.vx = nx * 520; b.vy = ny * 520; } else { b.vx += nx * 160; b.vy += ny * 160; } bflash[i] = .18; add(100, cx, cy - 30); sfx(600 + i * 80, .06); } });
      fl.forEach((f, i) => { const tx = f.px + Math.cos(f.ph) * FL, ty = f.py + Math.sin(f.ph) * FL, r0 = b.r; b.r = r0 + FR; const vsx = -f.w * (b.y - f.py), vsy = f.w * (b.x - f.px); segHit(b, f.px, f.py, tx, ty, .3, vsx, vsy); b.r = r0; });
      // sinais de cima
      [[150, 95], [224, 70], [298, 95]].forEach(([lx, ly], i) => { if (!lane[i] && hypot(b.x - lx, b.y - ly) < 16) { lane[i] = 1; add(100, lx, ly - 20); sfx(700, .06); if (lane.every(Boolean)) { mult = Math.min(5, mult + 1); lane = [0, 0, 0]; add(500, 224, 120, "MULT x" + mult); sfx(1000, .3); hudAll(); } } });
    };
    init();
    return {
      start() { init(); api.msg("Segure e solte para lançar"); },
      idle() { init(); }, dbg: () => ({ st, ball, score, mult, bl, tgt, lane }),
      ptr(type, px, py) {
        if (type === "down") { if (st === "wait") { held = true; charge = .001; } touch.l = px < 270; touch.r = px >= 210; }
        else if (type === "move") { if (touch.l || touch.r) { touch.l = px < 270; touch.r = px >= 210; } }
        else if (type === "up") { touch.l = touch.r = false; if (held && st === "wait") { held = false; launch(Math.max(.15, charge)); charge = 0; } held = false; }
      },
      key(e, down) {
        const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (k === "ArrowLeft" || k === "z") { keys.l = down; return true; }
        if (k === "ArrowRight" || k === "m" || k === "/") { keys.r = down; return true; }
        if (k === " " || k === "ArrowDown") { if (st === "wait") { if (down && !held) { held = true; charge = .001; } else if (!down && held) { held = false; launch(Math.max(.15, charge)); charge = 0; } } else { keys.l = keys.r = down; } return true; }
        return false;
      },
      update(dt) {
        tt += dt; tm += dt; pops.forEach(p => { p.t += dt; }); pops = pops.filter(p => p.t < 1.1); bflash = bflash.map(v => Math.max(0, v - dt)); sflash = sflash.map(v => Math.max(0, v - dt));
        if (st === "wait") { if (held) charge = Math.min(1, charge + dt * .9); flip(fl[0], false, dt); flip(fl[1], false, dt); }
        else if (st === "play") {
          saveT = Math.max(0, saveT - dt); const n = 8; for (let i = 0; i < n; i++) step(dt / n);
          if (hypot(ball.vx, ball.vy) < 16) stuck += dt; else stuck = 0;
          if (stuck > 1.6) { ball.vx += rnd(-260, 260); ball.vy -= 520; stuck = 0; api.msg("Chacoalhou a mesa!"); sfx(160, .1); }
          if (ball.y > 660 || !isFinite(ball.x)) {
            if (saveT > 0) { api.msg("Bola salva!"); newBall(); }
            else { bl--; hudAll(); st = "drain"; tm = 0; sfx(110, .4); }
          }
        } else if (st === "drain") {
          fl.forEach((f, i) => flip(f, false, dt));
          if (tm > 1) { if (bl <= 0) { api.finish(score, score >= 2500 ? "win" : "loss", { title: score >= 2500 ? "MESTRE DO PINBALL!" : "FIM DE JOGO", lines: ["Multiplicador máximo: x" + mult, "Meta para vencer: 2500 pontos"] }); } else { newBall(); api.msg("Segure e solte para lançar"); } }
        }
      },
      draw() {
        x.clearRect(0, 0, W, 640); let g = x.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, "#1a0b3b"); g.addColorStop(1, "#0b0720"); x.fillStyle = g; x.fillRect(0, 0, W, 640);
        x.strokeStyle = "rgba(168,85,247,.08)"; x.lineWidth = 1; for (let i = 0; i < 20; i++) { x.beginPath(); x.moveTo(i * 24, 0); x.lineTo(i * 24, 640); x.stroke(); }
        // paredes
        x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = "#22d3ee"; x.lineWidth = 5; x.shadowColor = "#22d3ee"; x.shadowBlur = 10; x.beginPath();
        segs.slice(0, -6).forEach((s, i) => { if (!i) x.moveTo(s[0], s[1]); x.lineTo(s[2], s[3]); }); x.stroke();
        x.beginPath(); segs.slice(-6).forEach(s => { x.moveTo(s[0], s[1]); x.lineTo(s[2], s[3]); }); x.moveTo(GATE[0], GATE[1]); x.lineTo(GATE[2], GATE[3]); x.stroke(); x.shadowBlur = 0;
        // alvos, sinais, bumpers, estilingues
        TG.forEach((t, i) => { x.strokeStyle = tgt[i] ? "#fde047" : "#7c3aed"; x.lineWidth = 7; x.shadowColor = tgt[i] ? "#fde047" : "#a78bfa"; x.shadowBlur = tgt[i] ? 14 : 4; x.beginPath(); x.moveTo(t[0] + (t[0] < 100 ? 6 : -6), t[1]); x.lineTo(t[2] + (t[0] < 100 ? 6 : -6), t[3]); x.stroke(); x.shadowBlur = 0; });
        [[150, 95], [224, 70], [298, 95]].forEach(([lx, ly], i) => { x.fillStyle = lane[i] ? "#fde047" : "#312e81"; x.shadowColor = "#fde047"; x.shadowBlur = lane[i] ? 14 : 0; x.beginPath(); x.arc(lx, ly, 8, 0, 7); x.fill(); x.shadowBlur = 0; });
        BUMP.forEach(([cx, cy], i) => { const f = bflash[i] > 0; x.shadowColor = "#f472b6"; x.shadowBlur = f ? 28 : 10; x.fillStyle = f ? "#fb7185" : "#be185d"; x.beginPath(); x.arc(cx, cy, 22 + (f ? 3 : 0), 0, 7); x.fill(); x.shadowBlur = 0; x.strokeStyle = "#fbcfe8"; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, 14, 0, 7); x.stroke(); });
        SL.forEach((s, i) => { x.fillStyle = sflash[i] > 0 ? "#f0abfc" : "#86198f"; x.beginPath(); x.moveTo(...s.a); x.lineTo(...s.b); x.lineTo(...s.c); x.closePath(); x.fill(); x.strokeStyle = "#e879f9"; x.lineWidth = 3; x.stroke(); });
        // flippers
        fl.forEach(f => { const tx = f.px + Math.cos(f.ph) * FL, ty = f.py + Math.sin(f.ph) * FL; x.strokeStyle = "#fde047"; x.lineWidth = 16; x.shadowColor = "#facc15"; x.shadowBlur = 10; x.beginPath(); x.moveTo(f.px, f.py); x.lineTo(tx, ty); x.stroke(); x.shadowBlur = 0; x.strokeStyle = "#b45309"; x.lineWidth = 5; x.beginPath(); x.moveTo(f.px, f.py); x.lineTo(tx, ty); x.stroke(); x.fillStyle = "#78350f"; x.beginPath(); x.arc(f.px, f.py, 5, 0, 7); x.fill(); });
        // lançador
        const pl = st === "wait" ? charge * 40 : 0; x.fillStyle = "#475569"; x.fillRect(430, 622 + pl - 6, 28, 8); x.strokeStyle = "#94a3b8"; x.lineWidth = 3; x.beginPath(); for (let i = 0; i <= 5; i++) x.lineTo(i % 2 ? 434 : 454, 628 + pl + i * 2 + 0); x.stroke();
        if (st === "wait") { x.fillStyle = "#0b1220"; x.fillRect(466, 540, 8, 80); x.fillStyle = `hsl(${120 - charge * 120},90%,55%)`; x.fillRect(466, 620 - charge * 80, 8, charge * 80); }
        // bola
        if (ball) { const bb = st === "wait" ? { x: 444, y: 611 + pl } : ball; x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.ellipse(bb.x + 3, bb.y + 4, BRAD, BRAD * .9, 0, 0, 7); x.fill(); g = x.createRadialGradient(bb.x - 3, bb.y - 3, 1, bb.x, bb.y, BRAD); g.addColorStop(0, "#fff"); g.addColorStop(.6, "#94a3b8"); g.addColorStop(1, "#334155"); x.fillStyle = g; x.beginPath(); x.arc(bb.x, bb.y, BRAD, 0, 7); x.fill(); }
        x.fillStyle = "rgba(226,232,240,.5)"; x.font = "700 11px sans-serif"; x.textAlign = "center"; x.fillText("◄ toque à esquerda   |   toque à direita ►", 224, 632); x.textAlign = "left";
        if (saveT > 0) { x.fillStyle = "rgba(34,211,238,.8)"; x.font = "700 11px sans-serif"; x.fillText("BOLA SALVA " + saveT.toFixed(0) + "s", 34, 40); }
        pops.forEach(p => pop(x, p, false));
      }
    };
  }
});

/* ═══════════ 4) DOODLE JUMP ═══════════ */
const doodle = arcade({
  id: "doodle", title: "Doodle Jump", W: 480, H: 640, def: "Normal",
  hud: [["ALTURA", "0"], ["MONSTROS", "0"], ["PONTOS", "0"]],
  diffs: { "Fácil": { gap: .8, mon: .6 }, "Normal": { gap: 1, mon: 1 }, "Difícil": { gap: 1.1, mon: 1.5 } },
  instr: ["Suba o mais alto que conseguir! O personagem pula sozinho ao cair em uma plataforma. Verde: normal • azul: se move • marrom: quebra • mola vermelha: pulo gigante • chapéu: hélice que te leva para cima.",
    "Mouse/toque: o personagem acompanha o seu dedo/ponteiro na horizontal; um toque rápido atira para cima. Teclado: ←/→ (ou A/D) para andar, Espaço para atirar.",
    "Pule em cima dos monstros para derrotá-los (+50) ou atire neles; encostar de lado é fatal. Cair da tela termina o jogo. Faça 600 pontos para vencer."],
  create(api) {
    const x = api.ctx, W = 480, H = 640, D = api.D, GR = 1650, JV = 830, PW = 70;
    let lastX = 200, p, plats, mons, bullets, cam, startY, minY, topY, kills, keys, tx, usePtr, shootCd, pops, state, tm, tt = 0, pdown, prop, score, lastAdd;
    const sc = () => Math.floor((startY - minY) / 10) + kills * 50;
    const hudAll = () => { api.hud(0, Math.floor((startY - minY) / 10)); api.hud(1, kills); api.hud(2, score = sc()); };
    const diff = () => Math.min(1, (startY - minY) / 7000);
    const gen = () => {
      while (topY > cam - 760) {
        const d = diff(), gp = D.gap || 1, gap = rnd(52 + 30 * d, (96 + 76 * d) * gp > 178 ? 178 : (96 + 76 * d) * gp);
        topY -= gap; const mv = Math.random() < .08 + .26 * d;
        lastX = clamp(lastX + rnd(-190, 190), 10, W - PW - 10); const pl = { x: lastX, y: topY, w: PW, t: mv ? "m" : "n", vx: mv ? (Math.random() < .5 ? -1 : 1) * rnd(60, 130) : 0, spr: !mv && Math.random() < .07, hat: !mv && Math.random() < .018, broken: false, by: 0 };
        plats.push(pl);
        if (Math.random() < .14 + .3 * d) plats.push({ x: rnd(10, W - PW - 10), y: topY + rnd(25, gap - 15), w: PW, t: "b", vx: 0, broken: false, by: 0 });
        if ((startY - minY) > 1400 && Math.random() < (.05 + .06 * d) * (D.mon || 1) && !pl.spr && !pl.hat) mons.push({ x: pl.x + PW / 2, y: topY - 46, ox: pl.x + PW / 2, hp: 1, ph: Math.random() * 6, mv: Math.random() < .5 });
      }
      plats = plats.filter(q => q.y - cam < H + 80); mons = mons.filter(m => m.y - cam < H + 80);
    };
    const init = () => {
      startY = 560; minY = startY; cam = 0; kills = 0; keys = {}; usePtr = false; tx = W / 2; shootCd = 0; pops = []; bullets = []; mons = []; state = "play"; tm = 0; prop = 0; pdown = null; lastAdd = 0;
      p = { x: W / 2, y: startY, vx: 0, vy: -JV, face: 1, sq: 0 }; plats = [{ x: 0, y: 600, w: W, t: "n", vx: 0, base: true }]; topY = 600; cam = 0; lastX = 200; gen(); hudAll();
    };
    const shoot = () => { if (shootCd > 0 || state !== "play") return; shootCd = .22; bullets.push({ x: p.x, y: p.y - 40, vx: 0, vy: -900 }); sfx(900, .04); };
    init();
    return {
      start() { init(); api.msg(""); },
      idle() { init(); }, dbg: () => ({ p, plats, mons, cam, state, minY, startY }),
      ptr(type, px) {
        if (type === "down") { pdown = { t: performance.now(), x: px, moved: false }; usePtr = true; tx = px; }
        else if (type === "move") { if (usePtr && pdown) { tx = px; if (Math.abs(px - pdown.x) > 12) pdown.moved = true; } else if (usePtr === "hover") tx = px; }
        else if (type === "up") { if (pdown && !pdown.moved && performance.now() - pdown.t < 260) shoot(); pdown = null; }
      },
      key(e, down) {
        const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (k === "ArrowLeft" || k === "a") { keys.l = down; if (down) usePtr = false; return true; }
        if (k === "ArrowRight" || k === "d") { keys.r = down; if (down) usePtr = false; return true; }
        if (k === " " || k === "ArrowUp") { if (down) shoot(); return true; }
        return false;
      },
      update(dt) {
        tt += dt; tm += dt; shootCd -= dt; pops.forEach(q => { q.t += dt; }); pops = pops.filter(q => q.t < 1.1);
        if (state === "dead") { p.vy += GR * dt; p.y += p.vy * dt; if (p.y - cam > H + 120) api.finish(sc(), sc() >= 600 ? "win" : "loss", { title: sc() >= 600 ? "ALTÍSSIMO!" : "FIM DE JOGO", lines: [`Altura: ${Math.floor((startY - minY) / 10)} m`, `Monstros derrotados: ${kills}`, "Meta para vencer: 600 pontos"] }); return; }
        // movimento horizontal
        const dir = (keys.r ? 1 : 0) - (keys.l ? 1 : 0);
        if (usePtr) { const t = clamp((tx - p.x) * 9, -430, 430); p.vx += (t - p.vx) * Math.min(1, dt * 14); } else { p.vx += dir * 2600 * dt; p.vx *= dir ? 1 : Math.exp(-9 * dt); p.vx = clamp(p.vx, -380, 380); }
        if (Math.abs(p.vx) > 15) p.face = Math.sign(p.vx);
        const py0 = p.y; p.x += p.vx * dt; if (p.x < -20) p.x += W + 40; if (p.x > W + 20) p.x -= W + 40;
        if (prop > 0) { prop -= dt; p.vy = -640; p.sq = 0; } else p.vy += GR * dt;
        p.y += p.vy * dt;
        // plataformas
        plats.forEach(q => { if (q.t === "m") { q.x += q.vx * dt; if (q.x < 0 || q.x > W - q.w) { q.vx *= -1; q.x = clamp(q.x, 0, W - q.w); } } if (q.broken) q.by += 500 * dt; });
        if (p.vy > 0) plats.forEach(q => {
          if (q.broken) return; const cx = q.x + q.w / 2;
          if (py0 <= q.y + 6 && p.y >= q.y && Math.abs(p.x - cx) < q.w / 2 + 18) {
            if (q.t === "b") { q.broken = true; sfx(140, .15); return; }
            p.y = q.y; p.sq = .18;
            if (q.spr && Math.abs(p.x - cx) < 20) { p.vy = -1330; sfx(1000, .12); } else p.vy = -JV;
            if (q.hat && Math.abs(p.x - cx) < 30) { prop = 2.4; q.hat = false; pops.push({ x: p.x, y: p.y - 60, t: 0, text: "HÉLICE!", col: "#67e8f9" }); }
            if (!q.spr) sfx(520, .05);
          }
        });
        p.sq = Math.max(0, p.sq - dt);
        // monstros
        mons.forEach(m => { if (m.mv) m.x = m.ox + Math.sin(tt * 1.6 + m.ph) * 70; });
        mons.forEach(m => {
          if (m.hp <= 0) return; const dx = Math.abs(p.x - m.x), feet = p.y, head = p.y - 52;
          if (dx < 34 && feet > m.y - 26 && head < m.y + 24) {
            if (p.vy > 120 && feet < m.y + 4 + 12) { m.hp = 0; p.vy = -JV * 1.05; kills++; pops.push({ x: m.x, y: m.y - 20, t: 0, text: "+50", col: "#fde047" }); sfx(700, .1); }
            else if (prop <= 0) { state = "dead"; p.vy = -200; api.msg("Pego por um monstro!"); sfx(120, .4); }
          }
        });
        bullets.forEach(b => { b.y += b.vy * dt; mons.forEach(m => { if (m.hp > 0 && Math.abs(b.x - m.x) < 30 && Math.abs(b.y - m.y) < 28) { m.hp = 0; b.y = -1e9; kills++; pops.push({ x: m.x, y: m.y - 20, t: 0, text: "+50", col: "#fde047" }); sfx(760, .1); } }); });
        bullets = bullets.filter(b => b.y - cam > -40); mons = mons.filter(m => m.hp > 0);
        if (p.y < minY) minY = p.y; if (p.y - cam < 250) cam = p.y - 250;
        gen(); hudAll();
        if (p.y - cam > H + 50 && state === "play") { state = "dead"; p.vy = 0; api.msg("Você caiu!"); sfx(110, .4); }
      },
      draw() {
        let g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0b1030"); g.addColorStop(1, "#14234f"); x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.strokeStyle = "rgba(125,211,252,.07)"; x.lineWidth = 1; const off = ((-cam * .5) % 32 + 32) % 32; for (let i = 0; i < H / 32 + 1; i++) { x.beginPath(); x.moveTo(0, i * 32 + off); x.lineTo(W, i * 32 + off); x.stroke(); } for (let i = 0; i < W / 32 + 1; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, H); x.stroke(); }
        plats.forEach(q => {
          const sy = q.y - cam + (q.by || 0); if (sy < -30 || sy > H + 30) return; x.save(); x.globalAlpha = q.broken ? Math.max(0, 1 - q.by / 300) : 1;
          const col = q.t === "m" ? ["#38bdf8", "#0369a1"] : q.t === "b" ? ["#b45309", "#78350f"] : ["#4ade80", "#15803d"];
          x.shadowColor = col[0]; x.shadowBlur = q.base ? 0 : 8; x.fillStyle = col[1]; rr(x, q.x, sy, q.w, 14, 7); x.fill(); x.shadowBlur = 0; x.fillStyle = col[0]; rr(x, q.x, sy, q.w, 8, 5); x.fill();
          if (q.t === "b") { x.strokeStyle = "#451a03"; x.lineWidth = 2; x.beginPath(); x.moveTo(q.x + 28, sy); x.lineTo(q.x + 34, sy + 7); x.lineTo(q.x + 30, sy + 14); x.stroke(); }
          if (q.spr) { const cx = q.x + q.w / 2; x.strokeStyle = "#e2e8f0"; x.lineWidth = 3; x.beginPath(); for (let i = 0; i < 4; i++) x.lineTo(cx + (i % 2 ? 7 : -7), sy - 3 - i * 4); x.stroke(); x.fillStyle = "#ef4444"; x.fillRect(cx - 10, sy - 20, 20, 5); }
          if (q.hat) { const cx = q.x + q.w / 2; x.fillStyle = "#22d3ee"; x.fillRect(cx - 7, sy - 14, 14, 10); x.strokeStyle = "#f8fafc"; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - 14, sy - 17); x.lineTo(cx + 14, sy - 17); x.stroke(); }
          x.restore();
        });
        mons.forEach(m => { const sy = m.y - cam, w = Math.sin(tt * 6 + m.ph) * 3; x.fillStyle = "#7c3aed"; x.shadowColor = "#a78bfa"; x.shadowBlur = 12; x.beginPath(); x.ellipse(m.x, sy, 28 + w, 24 - w, 0, 0, 7); x.fill(); x.shadowBlur = 0; x.fillStyle = "#fff"; x.beginPath(); x.arc(m.x - 10, sy - 6, 8, 0, 7); x.arc(m.x + 10, sy - 6, 8, 0, 7); x.fill(); x.fillStyle = "#111827"; x.beginPath(); x.arc(m.x - 10 + Math.sign(p.x - m.x) * 2, sy - 5, 3.5, 0, 7); x.arc(m.x + 10 + Math.sign(p.x - m.x) * 2, sy - 5, 3.5, 0, 7); x.fill(); x.strokeStyle = "#111827"; x.lineWidth = 3; x.beginPath(); x.arc(m.x, sy + 8, 8, .15 * PI, .85 * PI); x.stroke(); x.fillStyle = "#6d28d9"; for (let i = -1; i <= 1; i += 2) { x.beginPath(); x.arc(m.x + i * 22, sy - 20, 6, 0, 7); x.fill(); } });
        bullets.forEach(b => { x.fillStyle = "#fde047"; x.shadowColor = "#fde047"; x.shadowBlur = 10; x.beginPath(); x.arc(b.x, b.y - cam, 5, 0, 7); x.fill(); x.shadowBlur = 0; });
        // personagem (com esticar/amassar), reaparece do outro lado ao atravessar a borda
        const dr = px => { const sy = p.y - cam, st = p.sq > 0 ? .78 : (p.vy < -300 ? 1.12 : 1), wd = p.sq > 0 ? 1.18 : (p.vy < -300 ? .92 : 1); x.save(); x.translate(px, sy); x.scale(wd * p.face, st);
          x.fillStyle = "rgba(0,0,0,.25)"; x.beginPath(); x.ellipse(0, 1, 20, 4, 0, 0, 7); x.fill();
          x.strokeStyle = "#166534"; x.lineWidth = 6; x.lineCap = "round"; x.beginPath(); x.moveTo(-9, -10); x.lineTo(-11, 0); x.moveTo(9, -10); x.lineTo(11, 0); x.stroke();
          x.fillStyle = "#a3e635"; x.shadowColor = "#a3e635"; x.shadowBlur = 10; rr(x, -20, -52, 40, 44, 18); x.fill(); x.shadowBlur = 0; x.fillStyle = "#65a30d"; x.fillRect(-20, -26, 40, 4); x.fillRect(-20, -18, 40, 4);
          x.fillStyle = "#a3e635"; rr(x, 8, -38, 22, 12, 6); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(-2, -40, 7, 0, 7); x.arc(10, -40, 6, 0, 7); x.fill(); x.fillStyle = "#111"; x.beginPath(); x.arc(0, -40, 3, 0, 7); x.arc(12, -40, 2.6, 0, 7); x.fill();
          if (prop > 0) { x.strokeStyle = "#f8fafc"; x.lineWidth = 4; x.beginPath(); const a = Math.sin(tt * 40) * 26; x.moveTo(-a, -58); x.lineTo(a, -58); x.stroke(); x.fillStyle = "#22d3ee"; x.fillRect(-5, -56, 10, 6); }
          x.restore(); };
        dr(p.x); if (p.x < 24) dr(p.x + W + 40); if (p.x > W - 24) dr(p.x - W - 40);
        pops.forEach(q => pop(x, { ...q, y: q.y - cam }, false));
        x.fillStyle = "rgba(226,232,240,.5)"; x.font = "700 11px sans-serif"; x.textAlign = "center"; x.fillText("toque rápido = atirar", W / 2, H - 10); x.textAlign = "left";
      }
    };
  }
});

/* ═══════════ integração com o portal ═══════════ */
const NEW = [
  { id: "bowling", name: "Boliche", desc: "10 quadros com strikes, spares e efeito.", icon: "🎳", color: "#a78bfa", tint: "#a78bfa20", cat: "Esportes" },
  { id: "minigolf", name: "Mini Golf", desc: "9 buracos com moinhos, areia e água.", icon: "⛳", color: "#4ade80", tint: "#4ade8020", cat: "Esportes" },
  { id: "pinball", name: "Pinball", desc: "Flippers, bumpers e multiplicador.", icon: "🔮", color: "#e879f9", tint: "#e879f920", cat: "Arcade" },
  { id: "doodle", name: "Doodle Jump", desc: "Pule de plataforma em plataforma até o topo.", icon: "🦘", color: "#a3e635", tint: "#a3e63520", cat: "Arcade" }
];
NEW.forEach(g => { if (!A.catalog.some(q => q.id === g.id)) A.catalog.push(g); });
const mine = { bowling: boliche, minigolf: golf, pinball, doodle }, L1 = A.launch;
A.launch = (id, root, end) => mine[id] ? (A.stop(), mine[id](root, end)) : L1(id, root, end);
})();
