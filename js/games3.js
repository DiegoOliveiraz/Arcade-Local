/* Arcade Local — Lote 2: Faltas, Drible Maluco, Air Hockey, Corrida Infinita.
   Usa o framework de games2.js (window.ArcadeKit): tela inicial, Pausar/Continuar, Reiniciar, resultado e recorde. */
(() => {
const K = window.ArcadeKit, A = window.ArcadeGames, P = window.ArcadePhysics;
if (!K || !A || !P) return;
const { arcade, shotCore, drawKeeper, newKeeper, keeperReset, keeperDive, keeperStep, keeperHit, drawPlayer, sfx, sfxGoal, clamp, rnd, rr } = K;
const PI = Math.PI;
const pop = (x, p, big) => { x.save(); const k = p.t / 1.1; x.globalAlpha = Math.max(0, 1 - k * k); x.font = (big ? "900 30px" : "800 18px") + " sans-serif"; x.textAlign = "center"; x.lineWidth = 5; x.strokeStyle = "rgba(0,0,0,.65)"; x.strokeText(p.text, p.x, p.y - k * 40); x.fillStyle = p.col; x.fillText(p.text, p.x, p.y - k * 40); x.restore(); };

/* ═══════════ 1) FALTAS ═══════════ */
const freekick = arcade({
  id: "freekick", title: "Faltas", W: 480, H: 640, def: "Normal",
  hud: [["GOLS", "0"], ["CHUTE", "1/5"], ["PONTOS", "0"]],
  diffs: { "Fácil": { noise: .7, pj: 0, pRead: .2, rd: .18, kv: 5.5, err: 1 }, "Normal": { noise: 1, pj: .35, pRead: .35, rd: .14, kv: 6.5, err: .7 }, "Difícil": { noise: 1.2, pj: .65, pRead: .5, rd: .1, kv: 7.5, err: .5 } },
  instr: ["5 faltas de posições e distâncias diferentes, com barreira de 5 jogadores a 9,15 m e goleiro. Faça 3 gols ou mais para vencer.",
    "Mire no gol (clique/toque, segure para dar força e solte). Use a barra EFEITO (toque nela, ou teclas Q / E) para a bola curvar: a mira mostra onde ela termina, e o efeito faz a bola contornar a barreira.",
    "Na dificuldade alta a barreira pula. Gol de curva, de canto ou de longe vale mais."],
  create(api) {
    const D = api.D, SPOTS = [[-7, 18], [6, 20], [0, 22], [11, 24], [-12, 26]], WZ = 9.15;
    let i = 0, goals = 0, score = 0;
    const KP = newKeeper(), wall = { x: 0, jump: false, jt: 0, lift: 0 };
    const hudAll = () => { api.hud(0, goals); api.hud(1, Math.min(i + 1, 5) + "/5"); api.hud(2, score); };
    const nextSpot = () => {
      const [x0, zg] = SPOTS[Math.min(i, 4)]; keeperReset(KP);
      wall.x = x0 * (1 - WZ / zg); wall.jump = false; wall.jt = 0; wall.lift = 0; core.newShot(zg, null, x0);
      api.msg("Mire, ajuste o EFEITO (barra) e contorne a barreira."); hudAll();
    };
    const core = shotCore(api, {
      spinBar: true, delay: 1.2,
      onShoot(sh) {
        wall.jump = Math.random() < D.pj; wall.jt = 0; KP.go = true; KP.wait = D.rd; KP.dived = false; KP.walk = false; KP.T = clamp(sh.arr.t - D.rd - .04, .28, .7);
        if (Math.random() < D.pRead) { KP.tx = sh.arr.x + K.gauss() * D.err; KP.ty = sh.arr.y + K.gauss() * D.err * .6; }
        else { KP.tx = (Math.random() < .5 ? -1 : 1) * rnd(.8, 3.2); KP.ty = rnd(.6, 1.9); }
        KP.tx = clamp(KP.tx, -3.5, 3.5); KP.ty = clamp(KP.ty, .8, 1.7);
      },
      tick(dt) {
        if (wall.jump) { wall.jt += dt; const u = wall.jt / .67; wall.lift = u < 1 ? .55 * 4 * u * (1 - u) : 0; } // salto da barreira: parábola (gravidade)
        if (KP.go) { KP.wait -= dt; if (KP.wait <= 0 && !KP.dived) { KP.dived = true; if (!keeperDive(KP, KP.tx, KP.ty, D.kv * 1.3, KP.T)) KP.walk = true; } }
        keeperStep(KP, dt, KP.go && KP.walk ? KP.tx : null, D.kv * .55);
      },
      sub(b, h, st) {
        if (!b.cw && b.z >= WZ) { // barreira
          b.cw = true;
          if (Math.abs(b.x - wall.x) < 1.4 + P.R && b.y < 1.8 + wall.lift + P.R) {
            b.dead = true; b.saveText = "BARREIRA!"; b.vz = -Math.abs(b.vz) * .3; b.vx = rnd(-3, 3); b.vy = rnd(1, 4); b.ev.push("save"); return;
          }
        }
        if (b.chk || b.z < st.zg - .4) return; b.chk = true; // goleiro
        if (b.vz > 0 && keeperHit(KP, b)) {
          b.dead = true; b.vz = -Math.abs(b.vz) * .25; b.vx = (b.x - KP.x) * 3 + rnd(-2, 2); b.vy = rnd(1, 4); b.ev.push("save");
        }
      },
      layer(x, cam, st) {
        drawKeeper(x, cam, KP.x, KP.y, KP.lean, st.zg);
        for (let k = -2; k <= 2; k++) drawPlayer(x, cam, wall.x + k * .55, WZ, 0, "#3b82f6", wall.lift);
      },
      onDone(r) {
        let add = 0; const zg = core.S.zg, curved = Math.abs(core.S.spin) > .4;
        if (r.goal) {
          goals++; add = Math.round(100 * zg / 18); const ax = Math.abs(r.cross.x), ay = r.cross.y;
          if (ax > 2.6 && ay > 1.5) add += 80; else if (ax > 2.6 || ay > 1.8) add += 40;
          if (curved) add += 40;
        }
        score += add; i++; api.msg(r.goal ? `Golaço! +${add} pts${curved ? " (com efeito)" : ""}.` : r.saved ? "Defendido." : "Perdeu a falta."); hudAll();
        if (i >= 5) {
          core.S.tm = 1.6;
          core.S.fin = () => api.finish(score, goals >= 3 ? "win" : "loss", { title: goals >= 3 ? "CRAQUE DA BOLA PARADA!" : "FIM DAS FALTAS", lines: [`Gols: ${goals}/5`, "Meta para vencer: 3 gols"] });
        }
      },
      next() { if (core.S.fin) { core.S.fin(); return; } nextSpot(); }
    });
    return { start() { core.S.fin = null; i = 0; goals = 0; score = 0; nextSpot(); }, update: core.update, ptr: core.ptr, key: core.key, draw: core.draw, idle() { nextSpot(); } };
  }
});

/* ═══════════ 2) DRIBLE MALUCO ═══════════ */
const dribble = arcade({
  id: "dribble", title: "Drible Maluco", W: 480, H: 640, def: "Normal",
  hud: [["PONTOS", "0"], ["VIDAS", "❤❤❤"], ["DRIBLES", "0"]],
  diffs: { "Fácil": { v0: 200, acc: 4, gap: 1.25, lunge: .6, lives: 4, cd: .8 }, "Normal": { v0: 240, acc: 5.5, gap: 1, lunge: 1, lives: 3, cd: 1.1 }, "Difícil": { v0: 280, acc: 7, gap: .8, lunge: 1.4, lives: 3, cd: 1.4 } },
  instr: ["Corra com a bola pelo campo (a tela rola para cima) sem ser desarmado. Cada defensor que encosta em você ou na bola tira uma vida.",
    "Mouse/toque: arraste para os lados. Teclado: setas ← →. Botão DRIBLE (canto inferior direito) ou Espaço: arrancada lateral com invencibilidade rápida.",
    "Passar rente a um defensor durante o drible dá bônus e combo. Atenção: os carrinhos mostram um aviso vermelho antes de se jogar."],
  create(api) {
    const x = api.ctx, W = 480, H = 640, D = api.D, PY = 500;
    let pl, bl, defs, off, dist, bonus, lives, drib, t, spawnT, inv, dT, dCd, dDir, tx, pops, combo, trail, keys = {};
    const init = () => { pl = { x: 240, vx: 0 }; bl = { x: 240, y: PY - 26, vx: 0, vy: 0 }; defs = []; off = 0; dist = 0; bonus = 0; lives = D.lives || 3; drib = 0; t = 0; spawnT = .8; inv = 0; dT = 0; dCd = 0; dDir = 1; tx = 240; pops = []; combo = 0; trail = []; };
    const sc = () => Math.floor(dist / 10) + bonus;
    const hudAll = () => { api.hud(0, sc()); api.hud(1, "❤".repeat(Math.max(0, lives)) || "—"); api.hud(2, drib); };
    const doDash = () => {
      if (dCd > 0) return; const kd = (keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0);
      dDir = kd || Math.sign(tx - pl.x) || (Math.random() < .5 ? -1 : 1); dT = .2; inv = Math.max(inv, .45); dCd = D.cd; sfx(500, .15, "triangle", .15, 400);
    };
    const hit = d => {
      lives--; inv = 1.3; combo = 0; pl.vx = (pl.x < d.x ? -1 : 1) * 320; pops.push({ t: 0, x: pl.x, y: PY - 50, text: "DESARMADO!", col: "#f87171" }); sfx(130, .3, "sawtooth", .25, -70); hudAll();
      if (lives <= 0) api.finish(sc(), sc() >= 1200 ? "win" : "loss", { title: "PERDEU A BOLA!", lines: [`Distância: ${Math.round(dist / 50)} m`, `Dribles: ${drib}`] });
    };
    init();
    return {
      start() { init(); hudAll(); api.msg(""); },
      ptr(type, px, py) { if (type === "down" && px > 360 && py > 540) { doDash(); return; } tx = clamp(px, 28, W - 28); },
      key(e, down) {
        if (e.key === " ") { if (down && !e.repeat) doDash(); return true; }
        if (e.key.startsWith("Arrow") || "ad".includes(e.key)) { keys[e.key] = down; return true; } return false;
      },
      update(dt) {
        t += dt; const v = Math.min(560, D.v0 + D.acc * t); off += v * dt; dist += v * dt; inv = Math.max(0, inv - dt); dCd = Math.max(0, dCd - dt);
        tx = clamp(tx + ((keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0)) * 480 * dt, 28, W - 28);
        if (dT > 0) { dT -= dt; pl.vx = dDir * 950; trail.push({ x: pl.x, l: .22 }); } else { pl.vx += ((tx - pl.x) * 22 - pl.vx * 8) * dt; pl.vx = clamp(pl.vx, -420, 420); }
        pl.x = clamp(pl.x + pl.vx * dt, 26, W - 26); trail.forEach(q => { q.l -= dt; }); trail = trail.filter(q => q.l > 0);
        // bola presa ao pé por uma mola amortecida (balança nas curvas)
        const gx = pl.x - pl.vx * .05, gy = PY - 26 + Math.sin(t * 9) * 2;
        bl.vx += ((gx - bl.x) * 220 - bl.vx * 15) * dt; bl.vy += ((gy - bl.y) * 200 - bl.vy * 14) * dt; bl.x += bl.vx * dt; bl.y += bl.vy * dt;
        spawnT -= dt;
        if (spawnT <= 0) { defs.push({ x: rnd(40, W - 40), y: -40, tp: t > 6 && Math.random() < .35 ? "slider" : "marker", vx: 0, tel: 0, lunge: false, tgt: 0, dr: false }); spawnT = Math.max(.5, .95 * D.gap * 300 / v) * (.7 + Math.random() * .6); }
        defs.forEach(d => {
          d.y += (v + (d.lunge ? 170 : 0)) * dt;
          if (d.tp === "marker") { if (d.y < PY - 80) { const sp = Math.min(130, 55 + t * 1.5); d.x += clamp(pl.x - d.x, -sp * dt, sp * dt); } }
          else {
            if (!d.lunge && !d.tel && d.y > PY - 330) { d.tel = .42; d.tgt = pl.x; }
            if (d.tel > 0) { d.tel -= dt; if (d.tel <= 0) { d.lunge = true; d.vx = (d.tgt - d.x) / .5 * D.lunge; } }
            if (d.lunge) d.x += d.vx * dt;
          }
          const dp = Math.hypot(pl.x - d.x, PY - d.y), db = Math.hypot(bl.x - d.x, bl.y - d.y);
          if (inv <= 0 && (dp < 30 || db < 23)) { hit(d); d.dr = true; }
          else if (inv > 0 && dT > 0 && !d.dr && dp < 52) {
            d.dr = true; drib++; combo++; const add = Math.round(50 * (1 + Math.min(combo - 1, 4) * .5)); bonus += add;
            pops.push({ t: 0, x: d.x, y: d.y - 20, text: "DRIBLE! +" + add, col: "#a3e635" }); sfx(700, .12, "triangle", .2, 300); hudAll();
          }
        });
        defs = defs.filter(d => d.y < H + 50 && d.x > -90 && d.x < W + 90); pops.forEach(p => { p.t += dt; }); pops = pops.filter(p => p.t < 1.1); api.hud(0, sc());
      },
      draw() {
        const o = off % 80, idx = Math.floor(off / 80); x.fillStyle = "#0b1220"; x.fillRect(0, 0, W, H);
        for (let k = -1; k < 9; k++) { x.fillStyle = (((k - idx) % 2) + 2) % 2 ? "#14633f" : "#157347"; x.fillRect(14, o + k * 80, W - 28, 80); }
        x.fillStyle = "#0e1a30"; x.fillRect(0, 0, 14, H); x.fillRect(W - 14, 0, 14, H);
        for (let k = 0; k < 14; k++) { x.fillStyle = k % 3 ? "#60a5fa55" : "#f472b655"; const yy = (k * 47 + off * .5) % H; x.fillRect(4, yy, 5, 5); x.fillRect(W - 9, (yy + 90) % H, 5, 5); }
        x.strokeStyle = "rgba(255,255,255,.55)"; x.lineWidth = 3; x.beginPath(); x.moveTo(14, 0); x.lineTo(14, H); x.moveTo(W - 14, 0); x.lineTo(W - 14, H); x.stroke();
        const ml = (off % 1400) - 300; x.beginPath(); x.moveTo(14, ml); x.lineTo(W - 14, ml); x.stroke(); x.beginPath(); x.arc(W / 2, ml, 62, 0, 7); x.stroke();
        defs.forEach(d => { // defensores
          if (d.tel > 0) { x.strokeStyle = `rgba(248,113,113,${.4 + .4 * Math.sin(t * 30)})`; x.lineWidth = 3; x.setLineDash([6, 6]); x.beginPath(); x.moveTo(d.x, d.y); x.lineTo(d.tgt, d.y + 90); x.stroke(); x.setLineDash([]); x.fillStyle = "#f87171"; x.font = "900 18px sans-serif"; x.textAlign = "center"; x.fillText("!", d.x, d.y - 24); }
          x.save(); x.translate(d.x, d.y); if (d.lunge) x.rotate(Math.atan2(240, -d.vx) - PI / 2 + PI); x.fillStyle = "rgba(0,0,0,.3)"; x.beginPath(); x.ellipse(2, 4, 17, d.lunge ? 11 : 17, 0, 0, 7); x.fill();
          x.fillStyle = d.tp === "slider" ? "#2563eb" : "#1d4ed8"; x.strokeStyle = "#e0e7ff"; x.lineWidth = 2; x.beginPath(); x.ellipse(0, 0, 16, d.lunge ? 12 : 16, 0, 0, 7); x.fill(); x.stroke();
          x.fillStyle = "#fcd9b6"; x.beginPath(); x.arc(0, 2, 6, 0, 7); x.fill(); x.fillStyle = "#e0e7ff"; x.fillRect(-12, d.lunge ? 6 : 10, 7, 4); x.fillRect(5, d.lunge ? 6 : 10, 7, 4); x.restore();
        });
        trail.forEach(q => { x.fillStyle = `rgba(163,230,53,${q.l * 1.6})`; x.beginPath(); x.arc(q.x, PY, 13, 0, 7); x.fill(); });
        const bl2 = inv > 0 && Math.floor(t * 20) % 2 === 0; if (!bl2) { // jogador
          x.fillStyle = "rgba(0,0,0,.3)"; x.beginPath(); x.ellipse(pl.x + 2, PY + 4, 16, 14, 0, 0, 7); x.fill();
          const ph = Math.sin(t * 14) * 6; x.fillStyle = "#f8fafc"; x.beginPath(); x.arc(pl.x - 6, PY + 10 + ph, 4.5, 0, 7); x.arc(pl.x + 6, PY + 10 - ph, 4.5, 0, 7); x.fill();
          x.fillStyle = "#ef4444"; x.strokeStyle = "#fecaca"; x.lineWidth = 2; x.beginPath(); x.arc(pl.x, PY, 14, 0, 7); x.fill(); x.stroke(); x.fillStyle = "#fcd9b6"; x.beginPath(); x.arc(pl.x, PY - 2, 6, 0, 7); x.fill();
        }
        x.fillStyle = "rgba(0,0,0,.3)"; x.beginPath(); x.ellipse(bl.x + 2, bl.y + 4, 8, 6, 0, 0, 7); x.fill(); // bola
        x.fillStyle = "#fff"; x.beginPath(); x.arc(bl.x, bl.y, 8, 0, 7); x.fill(); x.fillStyle = "#1e293b"; for (let k = 0; k < 3; k++) { const a = t * 6 + k * 2.1; x.beginPath(); x.arc(bl.x + Math.cos(a) * 4, bl.y + Math.sin(a) * 4, 2, 0, 7); x.fill(); }
        x.textAlign = "left"; x.font = "800 13px sans-serif"; x.fillStyle = "#e8eefc"; x.fillText(Math.round(dist / 50) + " m", 24, 28);
        const cx = 425, cy = 590, ready = dCd <= 0; x.fillStyle = ready ? "rgba(163,230,53,.25)" : "rgba(0,0,0,.4)"; x.beginPath(); x.arc(cx, cy, 36, 0, 7); x.fill(); x.strokeStyle = ready ? "#a3e635" : "#64748b"; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, 36, -PI / 2, -PI / 2 + PI * 2 * (ready ? 1 : 1 - dCd / D.cd)); x.stroke();
        x.fillStyle = "#e8eefc"; x.font = "800 12px sans-serif"; x.textAlign = "center"; x.fillText("DRIBLE", cx, cy + 4); pops.forEach(p => pop(x, p)); x.textAlign = "left";
      }
    };
  }
});

/* ═══════════ 3) AIR HOCKEY ═══════════ */
const hockey = arcade({
  id: "airhockey", title: "Air Hockey", W: 480, H: 640, def: "Normal",
  hud: [["VOCÊ", "0"], ["CPU", "0"], ["META", "7"]],
  diffs: { "Fácil": { cap: 250, err: 62, pr: .15, react: .32, hitMax: 400 }, "Normal": { cap: 400, err: 34, pr: .45, react: .22, hitMax: 620 }, "Difícil": { cap: 600, err: 18, pr: .8, react: .14, hitMax: 900 } },
  instr: ["Primeiro a 7 gols vence. Empurre o disco para o gol da CPU (em cima) e defenda o seu (embaixo).",
    "Mouse/toque: arraste o seu taco (roxo) pela metade de baixo da mesa. Teclado: setas.",
    "O disco quica nas bordas e ganha a velocidade do seu taco: uma batida rápida é um chute forte. Pontos: 100 por gol + bônus de vitória e de saldo."],
  create(api) {
    const x = api.ctx, W = 480, H = 640, D = api.D, PR = 18, MR = 32, L = 20, R = 460, T = 20, B = 620, GH = 75, TO = 7;
    let puck, pm, cm, ps, cs, serveT, tx, ty, aiT, gx, gy, pops, stall, tr, keys = {}, tHit = 0, tt = 0;
    const serve = toPlayer => { puck = { x: 240 + rnd(-40, 40), y: toPlayer ? 440 : 200, vx: 0, vy: 0 }; serveT = 1.1; stall = 0; tr = []; };
    const init = () => { pm = { x: 240, y: 540, vx: 0, vy: 0 }; cm = { x: 240, y: 100, vx: 0, vy: 0 }; ps = cs = 0; tx = 240; ty = 540; aiT = 0; gx = 240; gy = 100; pops = []; serve(Math.random() < .5); };
    const hudAll = () => { api.hud(0, ps); api.hud(1, cs); };
    const mover = (m, gx2, gy2, cap, h, y0, y1) => {
      const dx = gx2 - m.x, dy = gy2 - m.y, d = Math.hypot(dx, dy), s = Math.min(d, cap * h), ox = m.x, oy = m.y;
      if (d > 0) { m.x = clamp(m.x + dx / d * s, L + MR, R - MR); m.y = clamp(m.y + dy / d * s, y0, y1); } m.vx = (m.x - ox) / h; m.vy = (m.y - oy) / h;
    };
    const collide = m => {
      const dx = puck.x - m.x, dy = puck.y - m.y, d = Math.hypot(dx, dy), mn = PR + MR; if (d >= mn || d === 0) return;
      const nx = dx / d, ny = dy / d; puck.x = m.x + nx * mn; puck.y = m.y + ny * mn;
      const vn = (puck.vx - m.vx) * nx + (puck.vy - m.vy) * ny;
      if (vn < 0) { puck.vx -= 1.9 * vn * nx; puck.vy -= 1.9 * vn * ny; if (m === cm) { const sp = Math.hypot(puck.vx, puck.vy); if (sp > D.hitMax) { puck.vx *= D.hitMax / sp; puck.vy *= D.hitMax / sp; } } if (tHit <= 0 && -vn > 60) { sfx(260 + Math.min(500, -vn * .4), .06, "square", .12); tHit = .05; } }
    };
    const goal = byPlayer => {
      if (byPlayer) ps++; else cs++; hudAll(); sfx(byPlayer ? 660 : 160, .35, byPlayer ? "triangle" : "sawtooth", .25, byPlayer ? 300 : -60);
      pops.push({ t: 0, x: W / 2, y: H / 2, text: byPlayer ? "GOL!" : "GOL DA CPU", col: byPlayer ? "#4ade80" : "#f87171" });
      if (ps >= TO || cs >= TO) {
        const win = ps > cs, score = ps * 100 + (win ? 300 : 0) + Math.max(0, ps - cs) * 25;
        api.finish(score, win ? "win" : "loss", { title: win ? "VOCÊ VENCEU!" : "A CPU VENCEU", lines: [`Placar final: ${ps} x ${cs}`, win ? "Bônus de vitória: +300" : "Sem bônus de vitória"] });
      } else serve(!byPlayer);
    };
    init();
    return {
      start() { init(); hudAll(); api.msg(""); },
      ptr(type, px, py) { if (type === "down" || type === "move") { tx = px; ty = py; } },
      key(e, down) { if (e.key.startsWith("Arrow")) { keys[e.key] = down; return true; } return false; },
      update(dt) {
        tt += dt; tHit -= dt; pops.forEach(p => { p.t += dt; }); pops = pops.filter(p => p.t < 1.1);
        tx = clamp(tx + ((keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)) * 520 * dt, L + MR, R - MR); ty = clamp(ty + ((keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0)) * 520 * dt, 330, B - MR);
        aiT -= dt; // decisão da CPU a cada ~0.12 s
        if (aiT <= 0) {
          aiT = D.react; const inHalf = puck.y < 330 && puck.vy > -100;
          if (inHalf) {
            let dx = 240 + rnd(-60, 60) - puck.x, dy = B - puck.y; const d = Math.hypot(dx, dy); dx /= d; dy /= d;
            const behind = cm.y < puck.y - 25 && Math.abs(cm.x - puck.x) < 40;
            if (behind) { gx = puck.x + dx * 40; gy = puck.y + dy * 40; } else { gx = puck.x - dx * (PR + MR + 12); gy = puck.y - dy * (PR + MR + 12); }
          } else { // defesa: antecipa onde o disco vai cruzar a linha do gol (com mistura de acompanhamento simples)
            const gy0 = T + MR + 28, px2 = puck.vy < -40 ? puck.x + puck.vx * (gy0 - puck.y) / puck.vy : puck.x;
            gx = clamp(240 + (px2 * D.pr + puck.x * (1 - D.pr) - 240) * .75, 165, 315); gy = gy0; }
          gx += rnd(-D.err, D.err); gy += rnd(-D.err, D.err) * .5;
        }
        const n = 5, h = dt / n;
        for (let s = 0; s < n; s++) {
          mover(pm, tx, ty, 2200, h, 330, B - MR); mover(cm, gx, gy, D.cap, h, T + MR, 310);
          if (serveT > 0) continue;
          puck.x += puck.vx * h; puck.y += puck.vy * h; const f = Math.exp(-.28 * h); puck.vx *= f; puck.vy *= f;
          const sp = Math.hypot(puck.vx, puck.vy); if (sp > 1500) { puck.vx *= 1500 / sp; puck.vy *= 1500 / sp; }
          if (puck.x < L + PR) { puck.x = L + PR; puck.vx = Math.abs(puck.vx) * .95; } if (puck.x > R - PR) { puck.x = R - PR; puck.vx = -Math.abs(puck.vx) * .95; }
          const ing = Math.abs(puck.x - 240) < GH - 4;
          if (puck.y < T + PR && !ing) { puck.y = T + PR; puck.vy = Math.abs(puck.vy) * .95; }
          if (puck.y > B - PR && !ing) { puck.y = B - PR; puck.vy = -Math.abs(puck.vy) * .95; }
          if (ing && puck.y < T - PR * .2) { goal(true); break; } if (ing && puck.y > B + PR * .2) { goal(false); break; }
          collide(pm); collide(cm);
        }
        if (serveT > 0) serveT -= dt; else { tr.push([puck.x, puck.y]); if (tr.length > 9) tr.shift(); stall = Math.hypot(puck.vx, puck.vy) < 8 ? stall + dt : 0; if (stall > 5) serve(Math.random() < .5); }
      },
      draw() {
        x.fillStyle = "#060a18"; x.fillRect(0, 0, W, H); let g = x.createLinearGradient(0, T, 0, B); g.addColorStop(0, "#0f2a4d"); g.addColorStop(.5, "#12396b"); g.addColorStop(1, "#0f2a4d");
        x.fillStyle = g; rr(x, L, T, R - L, B - T, 24); x.fill();
        for (let k = 0; k < 60; k++) { x.fillStyle = "rgba(255,255,255,.05)"; x.fillRect(L + ((k * 97) % (R - L)), T + ((k * 53) % (B - T)), 2, 2); }
        x.strokeStyle = "rgba(147,197,253,.55)"; x.lineWidth = 3; x.beginPath(); x.moveTo(L, H / 2); x.lineTo(R, H / 2); x.stroke(); x.beginPath(); x.arc(W / 2, H / 2, 62, 0, 7); x.stroke();
        x.beginPath(); x.arc(W / 2, T, 110, 0, PI); x.stroke(); x.beginPath(); x.arc(W / 2, B, 110, PI, 2 * PI); x.stroke();
        x.shadowColor = "#22d3ee"; x.shadowBlur = 16; x.strokeStyle = "#22d3ee"; x.lineWidth = 5; x.beginPath(); x.moveTo(L + 24, T); x.arcTo(L, T, L, T + 24, 24); x.lineTo(L, B - 24); x.arcTo(L, B, L + 24, B, 24); x.lineTo(W / 2 - GH, B); x.moveTo(W / 2 + GH, B); x.lineTo(R - 24, B); x.arcTo(R, B, R, B - 24, 24); x.lineTo(R, T + 24); x.arcTo(R, T, R - 24, T, 24); x.lineTo(W / 2 + GH, T); x.moveTo(W / 2 - GH, T); x.lineTo(L + 24, T); x.stroke();
        x.shadowColor = "#f472b6"; x.strokeStyle = "#f472b6"; x.beginPath(); x.moveTo(W / 2 - GH, T); x.lineTo(W / 2 + GH, T); x.moveTo(W / 2 - GH, B); x.lineTo(W / 2 + GH, B); x.stroke(); x.shadowBlur = 0;
        tr.forEach((q, i) => { x.fillStyle = `rgba(248,113,113,${i * .03})`; x.beginPath(); x.arc(q[0], q[1], PR * (i / 12 + .4), 0, 7); x.fill(); });
        x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.arc(puck.x + 3, puck.y + 4, PR, 0, 7); x.fill();
        x.shadowColor = "#ef4444"; x.shadowBlur = 14; x.fillStyle = "#ef4444"; x.beginPath(); x.arc(puck.x, puck.y, PR, 0, 7); x.fill(); x.shadowBlur = 0; x.fillStyle = "#fecaca"; x.beginPath(); x.arc(puck.x, puck.y, PR * .5, 0, 7); x.fill();
        [[pm, "#a78bfa", "#ddd6fe"], [cm, "#22d3ee", "#cffafe"]].forEach(([m, c1, c2]) => {
          x.fillStyle = "rgba(0,0,0,.35)"; x.beginPath(); x.arc(m.x + 4, m.y + 6, MR, 0, 7); x.fill();
          const gr = x.createRadialGradient(m.x - 8, m.y - 8, 4, m.x, m.y, MR); gr.addColorStop(0, c2); gr.addColorStop(1, c1); x.shadowColor = c1; x.shadowBlur = 14; x.fillStyle = gr; x.beginPath(); x.arc(m.x, m.y, MR, 0, 7); x.fill(); x.shadowBlur = 0;
          x.strokeStyle = "rgba(255,255,255,.6)"; x.lineWidth = 3; x.beginPath(); x.arc(m.x, m.y, MR * .55, 0, 7); x.stroke(); x.fillStyle = c1; x.beginPath(); x.arc(m.x, m.y, MR * .3, 0, 7); x.fill();
        });
        if (serveT > 0) { x.fillStyle = "rgba(255,255,255,.7)"; x.font = "800 15px sans-serif"; x.textAlign = "center"; x.fillText("Prepare-se...", W / 2, H / 2 + 100); x.textAlign = "left"; }
        pops.forEach(p => pop(x, p, true)); x.textAlign = "left";
      }
    };
  }
});

/* ═══════════ 4) CORRIDA INFINITA ═══════════ */
const runner = arcade({
  id: "runner", title: "Corrida Infinita", W: 480, H: 640, def: "Normal",
  hud: [["PONTOS", "0"], ["DISTÂNCIA", "0 m"], ["ORBES", "0"]],
  diffs: { "Fácil": { v0: 300, acc: 6, vmax: 640, gap: 1.25 }, "Normal": { v0: 360, acc: 9, vmax: 760, gap: 1 }, "Difícil": { v0: 420, acc: 12, vmax: 880, gap: .85 } },
  instr: ["Corra o mais longe possível. Qualquer batida em um obstáculo termina a corrida; a velocidade aumenta com o tempo.",
    "PULAR: toque na parte de cima da tela, Espaço ou ↑ — segure para pular mais alto. DESLIZAR: toque na parte de baixo ou ↓, para passar por baixo das barras suspensas.",
    "Colete os orbes dourados (+25 cada). Pontos = distância + orbes. Faça 1.500 pontos para vencer."],
  create(api) {
    const x = api.ctx, W = 480, H = 640, D = api.D, GY = 500, PX = 120, G = 2700;
    let py, vy, hold, holdT, slideT, jbuf, dist, orbs, t, obs, sp, keys = {};
    const init = () => { py = GY; vy = 0; hold = false; holdT = 0; slideT = 0; jbuf = 0; dist = 0; orbs = 0; t = 0; obs = []; sp = 300; };
    const sc = () => Math.floor(dist / 50) * 5 + orbs * 25;
    const jump = () => { jbuf = .12; hold = true; };
    const slide = () => { if (py >= GY) slideT = .65; else vy = Math.max(vy, 700); };
    const spawn = (v) => {
      const r = Math.random(), e = t < 8, X = W + 40;
      if (r < .45 || (e && r < .7)) obs.push({ tp: "hurdle", x: X, w: 26, h: 46, y: GY - 46 });
      else if (r < .65 && !e) obs.push({ tp: "tall", x: X, w: 30, h: 118, y: GY - 118 });
      else if (r < .88) obs.push({ tp: "beam", x: X, w: 100, h: 70, y: GY - 120 });
      else for (let k = 0; k < 5; k++) obs.push({ tp: "orb", x: X + k * 34, y: GY - 45 - Math.sin(k / 4 * PI) * 90, r: 11 });
      if (r < .45 && Math.random() < .5) for (let k = 0; k < 4; k++) obs.push({ tp: "orb", x: X + 70 + k * 30, y: GY - 60 - Math.sin(k / 3 * PI) * 80, r: 11 });
      sp = v * (.9 + Math.random() * .8) * D.gap + 60;
    };
    init();
    const hudAll = () => { api.hud(0, sc()); api.hud(1, Math.round(dist / 50) + " m"); api.hud(2, orbs); };
    const dead = () => { sfx(120, .35, "sawtooth", .25, -60); api.finish(sc(), sc() >= 1500 ? "win" : "loss", { title: "TROPEÇOU!", lines: [`Distância: ${Math.round(dist / 50)} m`, `Orbes: ${orbs}`] }); };
    const runnerSprite = (ph, air, sl) => {
      x.save(); x.translate(PX, py); x.fillStyle = "rgba(0,0,0,.25)"; x.beginPath(); x.ellipse(0, GY - py + 2, 18, 4, 0, 0, 7); x.fill();
      if (sl) { x.rotate(-.1); x.translate(0, -10); x.fillStyle = "#ef4444"; rr(x, -22, -8, 34, 18, 7); x.fill(); x.fillStyle = "#fcd9b6"; x.beginPath(); x.arc(18, -2, 8, 0, 7); x.fill(); x.strokeStyle = "#f8fafc"; x.lineWidth = 7; x.lineCap = "round"; x.beginPath(); x.moveTo(-20, 4); x.lineTo(-34, 8); x.stroke(); }
      else {
        const a = air ? .9 : Math.sin(ph) * 1, b = air ? -.5 : -Math.sin(ph) * 1; x.strokeStyle = "#f8fafc"; x.lineWidth = 8; x.lineCap = "round";
        x.beginPath(); x.moveTo(0, -30); x.lineTo(Math.sin(a) * 18, -30 + Math.cos(a) * 20); x.lineTo(Math.sin(a) * 18 - 6 + Math.sin(a - 1) * 4, Math.cos(a - 1) * 4 - 6 + (air ? 8 : 0)); x.moveTo(0, -30); x.lineTo(Math.sin(b) * 18, -30 + Math.cos(b) * 20); x.lineTo(Math.sin(b) * 18 - 6, -6); x.stroke();
        x.strokeStyle = "#fcd9b6"; x.lineWidth = 6; x.beginPath(); x.moveTo(0, -56); x.lineTo(Math.sin(b) * 16, -46); x.moveTo(0, -56); x.lineTo(Math.sin(a) * 16, -46); x.stroke();
        x.fillStyle = "#ef4444"; rr(x, -10, -62, 20, 36, 8); x.fill(); x.fillStyle = "#fcd9b6"; x.beginPath(); x.arc(2, -70, 8.5, 0, 7); x.fill(); x.fillStyle = "#111827"; x.beginPath(); x.arc(5, -71, 1.8, 0, 7); x.fill(); x.fillStyle = "#facc15"; x.fillRect(-7, -79, 18, 4);
      }
      x.restore();
    };
    return {
      start() { init(); hudAll(); api.msg(""); },
      ptr(type, px, py2) { if (type === "down") { if (py2 < H * .62) jump(); else slide(); } else if (type === "up") hold = false; },
      key(e, down) {
        if (e.key === " " || e.key === "ArrowUp" || e.key === "w") { if (down && !e.repeat) jump(); if (!down) hold = false; return true; }
        if (e.key === "ArrowDown" || e.key === "s") { if (down && !e.repeat) slide(); return true; } return false;
      },
      update(dt) {
        t += dt; const v = Math.min(D.vmax, D.v0 + D.acc * t); dist += v * dt; jbuf -= dt; slideT = Math.max(0, slideT - dt);
        if (jbuf > 0 && py >= GY) { vy = -880; holdT = .24; jbuf = 0; slideT = 0; sfx(420, .12, "square", .08, 300); }
        let g = G; if (vy < 0 && hold && holdT > 0) { g *= .35; holdT -= dt; } else holdT = 0;
        vy += g * dt; py += vy * dt; if (py >= GY) { py = GY; vy = 0; }
        obs.forEach(o => { o.x -= v * dt; }); sp -= v * dt; if (sp <= 0) spawn(v);
        const sl = slideT > 0 && py >= GY, top = py - (sl ? 32 : 68), bot = py - 2, l = PX - 10, r = PX + 10;
        for (const o of obs) {
          if (o.tp === "orb") { if (!o.got && Math.hypot(o.x - PX, o.y - (py - (sl ? 16 : 34))) < 28) { o.got = true; orbs++; sfx(900, .08, "triangle", .15, 400); } continue; }
          if (r > o.x + 3 && l < o.x + o.w - 3 && bot > o.y + 2 && top < o.y + o.h - 2) { dead(); return; }
        }
        obs = obs.filter(o => o.x > -140 && !o.got); hudAll();
      },
      draw() {
        const v = Math.min(D.vmax, D.v0 + D.acc * t), d = dist;
        let g = x.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, "#0a1230"); g.addColorStop(1, "#27407a"); x.fillStyle = g; x.fillRect(0, 0, W, GY);
        for (let i = 0; i < 40; i++) { x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect((i * 79) % W, (i * 41) % 200, 2, 2); }
        for (let i = 0; i < 3; i++) { const lx = (((i * 260 - d * .12) % 780) + 780) % 780 - 100; x.fillStyle = "#1b2a55"; x.fillRect(lx, 120, 8, 190); x.shadowColor = "#22d3ee"; x.shadowBlur = 20; x.fillStyle = "#c7f4ff"; x.fillRect(lx - 22, 112, 52, 10); x.shadowBlur = 0; }
        x.fillStyle = "#101a3a"; x.fillRect(0, 290, W, 130); for (let i = 0; i < 110; i++) { const cx = (((i * 211 % 560) - d * .25) % 560 + 560) % 560 - 40; x.fillStyle = `hsl(${(i * 47) % 360},60%,${50 + (i % 3) * 8}%)`; x.fillRect(cx, 300 + (i * 7919) % 108, 5, 7); }
        x.fillStyle = "#1e3a5f"; x.fillRect(0, 420, W, 20); for (let i = 0; i < 6; i++) { const ax = (((i * 150 - d * .5) % 900) + 900) % 900 - 120; x.fillStyle = i % 2 ? "#a78bfa" : "#22d3ee"; x.fillRect(ax, 424, 110, 12); }
        x.fillStyle = "#14633f"; x.fillRect(0, 440, W, GY - 440); x.fillStyle = "#157347"; for (let i = 0; i < 12; i++) x.fillRect((((i * 80 - d * .7) % 960) + 960) % 960 - 80, 440, 40, GY - 440);
        x.fillStyle = "#b4533a"; x.fillRect(0, GY, W, H - GY); x.fillStyle = "#9a432d"; x.fillRect(0, GY, W, 6); x.strokeStyle = "rgba(255,255,255,.7)"; x.lineWidth = 3;
        for (let k = 0; k < 2; k++) { const ly = GY + 40 + k * 55; x.beginPath(); x.moveTo(0, ly); x.lineTo(W, ly); x.stroke(); }
        x.strokeStyle = "rgba(255,255,255,.35)"; for (let i = 0; i < 14; i++) { const mx = (((i * 70 - d) % 980) + 980) % 980 - 40; x.beginPath(); x.moveTo(mx, GY + 12); x.lineTo(mx + 26, GY + 12); x.stroke(); }
        obs.forEach(o => {
          if (o.tp === "orb") { const by = Math.sin(t * 5 + o.x * .05) * 3; x.shadowColor = "#fbbf24"; x.shadowBlur = 14; x.fillStyle = "#fbbf24"; x.beginPath(); x.arc(o.x, o.y + by, o.r, 0, 7); x.fill(); x.shadowBlur = 0; x.fillStyle = "#fde68a"; x.beginPath(); x.arc(o.x - 3, o.y + by - 3, 3.5, 0, 7); x.fill(); return; }
          if (o.tp === "hurdle") { x.fillStyle = "#e2e8f0"; x.fillRect(o.x, o.y + 10, 5, o.h - 10); x.fillRect(o.x + o.w - 5, o.y + 10, 5, o.h - 10); x.fillStyle = "#ef4444"; x.fillRect(o.x - 3, o.y, o.w + 6, 12); x.fillStyle = "#fff"; for (let k = 0; k < 3; k++) x.fillRect(o.x - 3 + k * 10, o.y, 5, 12); }
          else if (o.tp === "tall") { x.fillStyle = "#475569"; x.fillRect(o.x, o.y, o.w, o.h); x.strokeStyle = "#64748b"; x.lineWidth = 2; for (let k = 1; k < 5; k++) { x.beginPath(); x.moveTo(o.x, o.y + k * o.h / 5); x.lineTo(o.x + o.w, o.y + k * o.h / 5); x.stroke(); } x.fillStyle = "#facc15"; x.fillRect(o.x, o.y, o.w, 6); }
          else { x.strokeStyle = "#64748b"; x.lineWidth = 2; x.beginPath(); x.moveTo(o.x + 12, 0); x.lineTo(o.x + 12, o.y); x.moveTo(o.x + o.w - 12, 0); x.lineTo(o.x + o.w - 12, o.y); x.stroke(); x.fillStyle = "#facc15"; x.fillRect(o.x, o.y, o.w, o.h); x.fillStyle = "#111827"; for (let k = 0; k < 8; k++) { x.beginPath(); x.moveTo(o.x + k * 14, o.y); x.lineTo(o.x + k * 14 + 7, o.y); x.lineTo(o.x + k * 14 - 3, o.y + o.h); x.lineTo(o.x + k * 14 - 10, o.y + o.h); x.fill(); } }
        });
        const sl = slideT > 0 && py >= GY; runnerSprite(d * .06 * (v / 400), py < GY, sl);
        x.fillStyle = "rgba(232,238,252,.6)"; x.font = "700 11px sans-serif"; x.textAlign = "center"; x.fillText("▲ PULAR (toque em cima)", W / 2 - 80, 628); x.fillText("▼ DESLIZAR (toque embaixo)", W / 2 + 90, 628); x.textAlign = "left";
        x.fillStyle = "rgba(255,255,255,.06)"; x.fillRect(0, H * .62, W, 1);
      }
    };
  }
});

/* ═══════════ integração com o portal ═══════════ */
const NEW = [
  { id: "freekick", name: "Faltas", desc: "Contorne a barreira com efeito na bola.", icon: "🧱", color: "#f97316", tint: "#f9731620", cat: "Futebol" },
  { id: "dribble", name: "Drible Maluco", desc: "Fuja dos zagueiros com a bola nos pés.", icon: "🌀", color: "#a3e635", tint: "#a3e63520", cat: "Futebol" },
  { id: "airhockey", name: "Air Hockey", desc: "Primeiro a 7 gols contra a CPU.", icon: "🏒", color: "#38bdf8", tint: "#38bdf820", cat: "Esportes" },
  { id: "runner", name: "Corrida Infinita", desc: "Pule, deslize e colete orbes.", icon: "🏃", color: "#fb7185", tint: "#fb718520", cat: "Esportes" }
];
NEW.forEach(g => { if (!A.catalog.some(q => q.id === g.id)) A.catalog.push(g); });
const mine = { freekick, dribble, airhockey: hockey, runner }, L1 = A.launch;
A.launch = (id, root, end) => mine[id] ? (A.stop(), mine[id](root, end)) : L1(id, root, end);
})();
