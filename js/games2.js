/* Arcade Local — Lote 1 (Futebol): Disputa de Pênaltis, Seja o Goleiro, Mira Certa, Desafio do Travessão.
   Estende window.ArcadeGames sem alterar games.js. Depende de storage.js, physics.js e games.js. */
(() => {
const A = window.ArcadeGames, S = window.ArcadeStore, P = window.ArcadePhysics;
if (!A || !S || !P) return;

/* ───────── utilitários ───────── */
let disp = [];
const stopAll2 = () => { disp.forEach(f => { try { f(); } catch (e) {} }); disp = []; };
const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); disp.push(() => t.removeEventListener(ev, fn, opt)); };
const $ = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
const btn = (txt, fn) => { const b = $("button", "game-btn", txt); b.onclick = () => { fn(); b.blur(); }; return b; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => { let u = 0; for (let i = 0; i < 4; i++) u += Math.random(); return (u - 2) * 1.73; };
const fmt = n => Math.round(n).toLocaleString("pt-BR");
const rr = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };

let ac = null; // efeitos sonoros simples (respeitam o volume das Configurações)
const sfx = (f, d = 0.1, type = "sine", v = 0.15, slide = 0) => {
  try {
    const vol = (S.get().settings.volume ?? 50) / 100; if (!vol) return;
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === "suspended") ac.resume();
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(v * vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(ac.destination); o.start(); o.stop(t + d);
  } catch (e) {}
};
const sfxGoal = () => { sfx(523, .12, "triangle", .25); setTimeout(() => sfx(659, .12, "triangle", .25), 110); setTimeout(() => sfx(784, .25, "triangle", .25), 220); };

/* ───────── framework padrão dos novos jogos ─────────
   Tela inicial (instruções + dificuldade + Começar), Pausar/Continuar, Reiniciar,
   tela de resultado (pontos, recorde, Jogar Novamente) e pausa automática ao sair da aba. */
function arcade(cfg) {
  return (root, end) => {
    stopAll2(); root.innerHTML = "";
    const shell = $("div", "game-shell"); root.append(shell);
    const hud = $("div", "game-hud");
    const hv = cfg.hud.map(([k, v]) => { const b = $("div", "hud-box"); b.append($("small", "", k)); const s = $("strong", "", v); b.append(s); hud.append(b); return s; });
    shell.append(hud);
    const stage = $("div", "g2-stage"); stage.style.width = `min(100%,${cfg.W}px)`;
    const canvas = $("canvas", "game-canvas"); canvas.width = cfg.W; canvas.height = cfg.H; canvas.style.width = "100%";
    const ov = $("div", "g2-overlay"); stage.append(canvas, ov); shell.append(stage);
    const msg = $("div", "game-message"); shell.append(msg);
    const bar = $("div", "game-toolbar"); shell.append(bar);

    const api = { ctx: canvas.getContext("2d"), canvas, W: cfg.W, H: cfg.H, diff: cfg.def || "Normal", D: {}, state: "idle", sfx,
      hud: (i, v) => { hv[i].textContent = v; }, msg: t => { msg.textContent = t; },
      pos: e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * cfg.W / r.width, (e.clientY - r.top) * cfg.H / r.height]; },
      finish };
    let G = null, secs = 0;

    const showOv = () => { ov.innerHTML = ""; ov.classList.add("show"); return ov; };
    const hideOv = () => { ov.classList.remove("show"); ov.innerHTML = ""; };
    const instr = () => { const d = $("div", "g2-instr"); cfg.instr.forEach(t => d.append($("p", "", t))); return d; };
    const diffPick = () => {
      if (!cfg.diffs) return null;
      const row = $("div", "game-toolbar pick"), bs = Object.keys(cfg.diffs).map(k => { const b = btn(k, () => { api.diff = k; paint(); }); row.append(b); return b; });
      const paint = () => bs.forEach(b => b.classList.toggle("on", b.textContent === api.diff)); paint(); return row;
    };
    const sync = () => {
      startB.disabled = api.state === "run";
      pauseB.disabled = api.state !== "run" && api.state !== "pause";
      pauseB.textContent = api.state === "pause" ? "▶ Continuar" : "Ⅱ Pausar";
    };
    function startOv() {
      api.state = "idle"; const o = showOv();
      o.append($("div", "g2-title", cfg.title), $("div", "g2-sub", "COMO JOGAR"), instr());
      const dp = diffPick(); if (dp) o.append(dp);
      const t = $("div", "game-toolbar"); t.append(btn("▶ Começar", begin)); o.append(t); sync();
    }
    function begin() {
      api.D = cfg.diffs ? cfg.diffs[api.diff] : {}; secs = 0; api.state = "run"; hideOv(); api.msg("");
      G = cfg.create(api); G.start(); sync(); sfx(440, .08);
    }
    function pause() {
      if (api.state !== "run") return;
      api.state = "pause"; const o = showOv();
      o.append($("div", "g2-title", "PAUSADO"), instr());
      const t = $("div", "game-toolbar"); t.append(btn("▶ Continuar", resume), btn("↻ Reiniciar", begin)); o.append(t); sync();
    }
    function resume() { if (api.state !== "pause") return; api.state = "run"; hideOv(); sync(); }
    function finish(score, result, o = {}) {
      if (api.state !== "run") return;
      api.state = "over"; score = Math.max(0, Math.floor(score));
      const prev = S.get().scores[cfg.id] || 0;
      end(score, result, secs); // grava recorde, partidas, vitórias e tempo (ranking/estatísticas)
      const best = Math.max(prev, score), box = showOv();
      box.append($("div", "g2-title", o.title || (result === "win" ? "VITÓRIA!" : result === "draw" ? "EMPATE" : "FIM DE JOGO")),
        $("div", "g2-big", fmt(score) + " pts"));
      (o.lines || []).forEach(l => box.append($("div", "g2-line", l)));
      box.append($("div", "g2-record", score > prev && score > 0 ? "★ NOVO RECORDE! ★" : "Recorde: " + fmt(best) + " pts"));
      const t = $("div", "game-toolbar"); t.append(btn("↻ Jogar Novamente", begin)); box.append(t); sync();
    }

    bar.append(btn("▶ Começar", () => { if (api.state === "pause") resume(); else begin(); }), btn("Ⅱ Pausar", () => { api.state === "pause" ? resume() : pause(); }), btn("↻ Reiniciar", begin));
    const startB = bar.children[0], pauseB = bar.children[1];

    // entrada: ponteiro (mouse/toque) e teclado
    const ptr = type => e => { if (api.state !== "run") return; if (type !== "move") e.preventDefault(); if (type === "down") canvas.setPointerCapture?.(e.pointerId); G.ptr?.(type, ...api.pos(e), e); };
    on(canvas, "pointerdown", ptr("down")); on(canvas, "pointermove", ptr("move")); on(canvas, "pointerup", ptr("up")); on(canvas, "pointercancel", ptr("up"));
    const key = down => e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (down && (e.key === "p" || e.key === "P" || e.key === "Escape")) { api.state === "pause" ? resume() : pause(); return; }
      if (api.state === "run" && G.key?.(e, down)) e.preventDefault();
    };
    on(document, "keydown", key(true)); on(document, "keyup", key(false));
    on(document, "visibilitychange", () => { if (document.hidden) pause(); });

    let prev = 0, id;
    const tick = t => {
      const dt = prev ? Math.min((t - prev) / 1000, 0.05) : 0; prev = t;
      if (api.state === "run") { secs += dt; G.update(dt); }
      G.draw(); id = requestAnimationFrame(tick);
    };
    api.D = cfg.diffs ? cfg.diffs[api.diff] : {}; G = cfg.create(api); G.idle?.();
    id = requestAnimationFrame(tick); disp.push(() => cancelAnimationFrame(id));
    startOv();
  };
}

/* ───────── cena 3D simplificada (projeção em perspectiva) ───────── */
const makeCam = (zg, mode) => mode === "goalie"
  ? { x: 0, y: 3, z: zg + 9.5, dir: -1, f: 540, cx: 240, cy: 240 }
  : { x: 0, y: 1.7, z: -5, dir: 1, f: 650 * Math.sqrt((zg + 5) / 16), cx: 240, cy: 300 };
const proj = (c, x, y, z) => { const d = (z - c.z) * c.dir; if (d < 0.25) return null; return [c.cx + c.dir * c.f * (x - c.x) / d, c.cy - c.f * (y - c.y) / d, c.f / d]; };
const unproj = (c, sx, sy, z) => { const d = (z - c.z) * c.dir; return [c.x + c.dir * (sx - c.cx) * d / c.f, c.y - (sy - c.cy) * d / c.f]; };

function drawField(x, c, zg, W, H) {
  const hy = c.cy; let g = x.createLinearGradient(0, 0, 0, hy);
  g.addColorStop(0, "#060a1c"); g.addColorStop(1, "#1b2b5e"); x.fillStyle = g; x.fillRect(0, 0, W, hy + 1);
  x.fillStyle = "#0b1230"; x.fillRect(0, hy - 74, W, 74);               // arquibancada
  for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(${120 + (i * 7) % 120},${170 + (i * 3) % 60},255,${.12 + ((i * 37) % 10) / 36})`; x.fillRect((i * 83) % W, hy - 70 + ((i * 29) % 62), 2, 2); }
  [[70, hy - 96], [W - 70, hy - 96]].forEach(([lx, ly]) => { x.shadowColor = "#22d3ee"; x.shadowBlur = 24; x.fillStyle = "#c7f4ff"; x.fillRect(lx - 16, ly, 32, 5); x.shadowBlur = 0; });
  g = x.createLinearGradient(0, hy, 0, H); g.addColorStop(0, "#0b3a2c"); g.addColorStop(1, "#14704c"); x.fillStyle = g; x.fillRect(0, hy, W, H - hy);
  for (let z = -40; z < zg + 70; z += 8) {                              // listras do gramado
    const a = proj(c, 0, 0, z), b = proj(c, 0, 0, z + 4); if (!a || !b) continue;
    const y1 = Math.min(a[1], b[1]), y2 = Math.max(a[1], b[1]); x.fillStyle = "rgba(255,255,255,.045)"; x.fillRect(0, y1, W, y2 - y1);
  }
  x.strokeStyle = "rgba(255,255,255,.5)"; x.lineWidth = 2;
  const L = pts => { x.beginPath(); let st = false; for (const [px, pz] of pts) { const p = proj(c, px, 0, pz); if (!p) { st = false; continue; } st ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]); st = true; } x.stroke(); };
  L([[-40, zg], [40, zg]]); L([[-9.16, zg], [-9.16, zg - 5.5], [9.16, zg - 5.5], [9.16, zg]]); L([[-20.16, zg], [-20.16, zg - 16.5], [20.16, zg - 16.5], [20.16, zg]]);
}

function drawGoal(x, c, zg, o = {}) {
  const hw = 3.66 + P.PR, h = 2.44 + P.PR, d = P.GD, T = (a, b, cc) => proj(c, a, b, cc);
  x.save(); x.globalAlpha = o.alpha ?? 1; x.strokeStyle = "rgba(225,238,255,.30)"; x.lineWidth = 1;
  const seg = (p, q) => { if (!p || !q) return; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.stroke(); };
  for (let i = -3.6; i <= 3.7; i += .45) seg(T(i, 0, zg + d), T(i, 2.2, zg + d));          // rede (fundo)
  for (let j = 0; j <= 2.2; j += .4) seg(T(-hw, j, zg + d), T(hw, j, zg + d));
  for (let i = -3.6; i <= 3.7; i += .9) seg(T(i, 2.5, zg), T(i, 2.2, zg + d));            // teto
  seg(T(-hw, 0, zg), T(-hw, 0, zg + d)); seg(T(hw, 0, zg), T(hw, 0, zg + d)); seg(T(-hw, 2.5, zg), T(-hw, 2.2, zg + d)); seg(T(hw, 2.5, zg), T(hw, 2.2, zg + d));
  const a = T(-hw, 0, zg), b = T(-hw, h, zg), e = T(hw, h, zg), f = T(hw, 0, zg);
  if (a && b && e && f) {
    x.lineCap = "round"; x.lineJoin = "round"; x.lineWidth = Math.max(3, .13 * a[2]);
    x.strokeStyle = "#f8fafc"; x.shadowColor = "#22d3ee"; x.shadowBlur = 10;
    x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.lineTo(e[0], e[1]); x.lineTo(f[0], f[1]); x.stroke();
    if (o.barGlow) { x.strokeStyle = `rgba(253,224,71,${.55 + .45 * Math.sin(o.t * 6)})`; x.shadowColor = "#fde047"; x.shadowBlur = 18; x.beginPath(); x.moveTo(b[0], b[1]); x.lineTo(e[0], e[1]); x.stroke(); }
  }
  x.restore();
}

function drawBall(x, c, b, trail, minR = 3.2) {
  if (trail) trail.forEach((t, i) => { const p = proj(c, t.x, t.y, t.z); if (p) { x.fillStyle = `rgba(255,255,255,${.04 + i * .035})`; x.beginPath(); x.arc(p[0], p[1], Math.max(2, .12 * p[2]), 0, 7); x.fill(); } });
  const p = proj(c, b.x, b.y, b.z), g = proj(c, b.x, 0, b.z); if (!p || !g) return;
  const r = Math.max(minR, .17 * p[2]);
  x.fillStyle = `rgba(0,0,0,${clamp(.38 - b.y * .08, .1, .38)})`; x.beginPath(); x.ellipse(g[0], g[1], r * 1.1, r * .34, 0, 0, 7); x.fill();
  const rg = x.createRadialGradient(p[0] - r * .3, p[1] - r * .3, r * .1, p[0], p[1], r); rg.addColorStop(0, "#fff"); rg.addColorStop(1, "#c3cbe0");
  x.fillStyle = rg; x.beginPath(); x.arc(p[0], p[1], r, 0, 7); x.fill();
  x.fillStyle = "#1e293b"; const a0 = b.t * 9 + b.x; for (let i = 0; i < 3; i++) { const a = a0 + i * 2.1; x.beginPath(); x.arc(p[0] + Math.cos(a) * r * .5, p[1] + Math.sin(a) * r * .5, r * .22, 0, 7); x.fill(); }
}

function drawKeeper(x, c, kx, ky, lean, zg, col = "#fbbf24") {
  const p = proj(c, kx, ky, zg); if (!p) return; const s = p[2];
  x.save(); x.translate(p[0], p[1]); x.rotate(lean);
  x.fillStyle = "#111827"; rr(x, -.2 * s, .12 * s, .4 * s, .5 * s, .08 * s); x.fill();                  // pernas
  x.fillStyle = col; rr(x, -.27 * s, -.5 * s, .54 * s, .72 * s, .12 * s); x.fill();                      // tronco
  x.strokeStyle = col; x.lineWidth = .15 * s; x.lineCap = "round";
  const up = Math.abs(lean) > .2 ? -.85 : -.45; x.beginPath(); x.moveTo(-.27 * s, -.35 * s); x.lineTo(-.72 * s, up * s); x.moveTo(.27 * s, -.35 * s); x.lineTo(.72 * s, up * s); x.stroke();
  x.fillStyle = "#fde68a"; x.beginPath(); x.arc(0, -.68 * s, .15 * s, 0, 7); x.fill();                    // cabeça
  x.fillStyle = "#f8fafc"; x.beginPath(); x.arc(-.72 * s, up * s, .09 * s, 0, 7); x.arc(.72 * s, up * s, .09 * s, 0, 7); x.fill(); // luvas
  x.restore();
}

function drawPlayer(x, c, px, z, phase) { // batedor
  const p = proj(c, px, 0, z); if (!p) return; const s = p[2], sw = Math.sin(phase * Math.PI) * .6;
  x.save(); x.translate(p[0], p[1]); x.strokeStyle = "#111827"; x.lineWidth = .16 * s; x.lineCap = "round";
  x.beginPath(); x.moveTo(0, -.9 * s); x.lineTo(-.15 * s - sw * .5 * s, 0); x.moveTo(0, -.9 * s); x.lineTo(.15 * s + sw * .5 * s, 0); x.stroke();
  x.fillStyle = "#ef4444"; rr(x, -.24 * s, -1.55 * s, .48 * s, .7 * s, .1 * s); x.fill(); x.fillStyle = "#fcd9b6"; x.beginPath(); x.arc(0, -1.72 * s, .13 * s, 0, 7); x.fill(); x.restore();
}

/* ───────── núcleo dos jogos de chute (controle + física + resolução) ───────── */
function shotCore(api, o) {
  const x = api.ctx, W = api.W, H = api.H, D = api.D;
  const S1 = { ph: "idle", aim: { x: 0, y: 1.3 }, pw: 0, ball: null, cam: null, zg: 11, wind: [0, 0], env: null, pops: [], tm: 0, endT: null, t: 0, shot: null };
  const keys = {};
  const pop = (text, col) => { S1.pops.push({ t: 0, text, col }); };
  function shoot() {
    o.snap && o.snap(S1.aim);
    const p = Math.max(S1.pw, .12), n = D.noise * (.05 + .9 * p * p * p), sp = 15 + 19 * p;
    const t = { x: S1.aim.x + gauss() * n, y: S1.aim.y + gauss() * n * .8 };
    const v = P.solve({ x: 0, y: P.R, z: 0 }, t, sp, {}, { zg: S1.zg });
    S1.ball = P.ball(0, P.R, 0, v.vx, v.vy, v.vz); S1.env = { zg: S1.zg, wind: S1.wind }; S1.ph = "fly";
    S1.shot = { p, speed: sp, t, arr: P.arrival(S1.ball, { zg: S1.zg }) };
    api.sfx(150, .14, "triangle", .35, -90); o.onShoot && o.onShoot(S1.shot, S1.ball); api.msg("");
  }
  function finishShot() {
    const b = S1.ball; S1.ph = "done"; S1.tm = o.delay || 1;
    o.onDone({ goal: b.goal, bars: b.bars, posts: b.posts, saved: b.dead, cross: b.cross, out: b.out && !b.goal });
  }
  const core = {
    S: S1,
    newShot(zg, wind) {
      S1.zg = zg; S1.wind = wind || [0, 0]; S1.cam = makeCam(zg, "shoot"); S1.ph = "aim"; S1.pw = 0; S1.endT = null; S1.pops = [];
      S1.ball = P.ball(0, P.R, 0, 0, 0, 0); S1.aim.x = clamp(S1.aim.x, -5, 5);
      api.msg("Clique/toque no alvo, segure para dar força e solte para chutar.");
    },
    ptr(type, px, py) {
      if (S1.ph !== "aim" && S1.ph !== "charge") return;
      const [wx, wy] = unproj(S1.cam, px, py, S1.zg), ax = clamp(wx, -5.5, 5.5), ay = clamp(wy, .1, 3.7);
      if (type === "down") { S1.aim.x = ax; S1.aim.y = ay; o.snap && o.snap(S1.aim); S1.ph = "charge"; S1.pw = 0; }
      else if (type === "move") { S1.aim.x = ax; S1.aim.y = ay; o.snap && o.snap(S1.aim); }
      else if (type === "up" && S1.ph === "charge") shoot();
    },
    key(e, down) {
      if (e.key === " " || e.key === "Enter") {
        if (down && !e.repeat && S1.ph === "aim") { S1.ph = "charge"; S1.pw = 0; } else if (!down && S1.ph === "charge") shoot();
        return true;
      }
      if (e.key.startsWith("Arrow")) { keys[e.key] = down; return true; }
      return false;
    },
    update(dt) {
      S1.t += dt; S1.pops.forEach(p => { p.t += dt; }); S1.pops = S1.pops.filter(p => p.t < 1.6);
      if (S1.ph === "aim" || S1.ph === "charge") {
        S1.aim.x = clamp(S1.aim.x + ((keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)) * 4 * dt, -5.5, 5.5);
        S1.aim.y = clamp(S1.aim.y + ((keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0)) * 3 * dt, .1, 3.7);
        if (S1.ph === "charge") S1.pw = Math.min(1, S1.pw + dt / 1.1);
      }
      if (S1.ph === "fly") {
        const b = S1.ball, n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
        for (let i = 0; i < n; i++) { P.step(b, h, S1.env); o.sub && o.sub(b, h, S1); }
        b.ev.splice(0).forEach(ev => {
          if (ev === "goal") { pop("GOOOL!", "#4ade80"); sfxGoal(); S1.endT = S1.endT ?? 1.1; }
          else if (ev === "bar") { pop("NO TRAVESSÃO!", "#fde047"); sfx(900, .2, "square", .12, -450); }
          else if (ev === "post") { pop("NA TRAVE!", "#fbbf24"); sfx(700, .2, "square", .12, -350); }
          else if (ev === "out") { if (!b.bars && !b.posts) pop("PRA FORA!", "#fb7185"); S1.endT = S1.endT ?? .8; }
          else if (ev === "save") { pop("DEFENDEU!", "#38bdf8"); sfx(220, .18, "sawtooth", .2, -80); S1.endT = 1; }
          else if (ev === "bounce") sfx(110, .05, "sine", .12);
        });
        if (S1.endT == null && (b.t > 6 || b.z < -3 || Math.abs(b.x) > 30 || (b.t > .4 && b.y < P.R + .02 && Math.hypot(b.vx, b.vz) < .6))) S1.endT = .2;
        if (S1.endT != null) { S1.endT -= dt; if (S1.endT <= 0) finishShot(); }
      }
      if (S1.ph === "done") { S1.tm -= dt; if (S1.tm <= 0 && api.state === "run") o.next(); }
      o.tick && o.tick(dt, S1);
    },
    draw() {
      const c = S1.cam || makeCam(11, "shoot"), zg = S1.zg;
      drawField(x, c, zg, W, H); drawGoal(x, c, zg, { barGlow: o.barGlow, t: S1.t });
      o.layer && o.layer(x, c, S1);
      if (S1.ball) drawBall(x, c, S1.ball);
      if (S1.ph === "aim" || S1.ph === "charge") {
        const a = proj(c, S1.aim.x, S1.aim.y, zg), b0 = proj(c, 0, P.R, 0);
        if (a) {
          if (b0) { x.setLineDash([5, 7]); x.strokeStyle = "rgba(34,211,238,.35)"; x.lineWidth = 2; x.beginPath(); x.moveTo(b0[0], b0[1]); x.lineTo(a[0], a[1]); x.stroke(); x.setLineDash([]); }
          x.strokeStyle = "#22d3ee"; x.shadowColor = "#22d3ee"; x.shadowBlur = 12; x.lineWidth = 2.5;
          x.beginPath(); x.arc(a[0], a[1], 15, 0, 7); x.moveTo(a[0] - 24, a[1]); x.lineTo(a[0] - 8, a[1]); x.moveTo(a[0] + 8, a[1]); x.lineTo(a[0] + 24, a[1]); x.moveTo(a[0], a[1] - 24); x.lineTo(a[0], a[1] - 8); x.moveTo(a[0], a[1] + 8); x.lineTo(a[0], a[1] + 24); x.stroke(); x.shadowBlur = 0;
        }
        const bw = 220, bx = (W - bw) / 2, by = H - 40; x.fillStyle = "rgba(0,0,0,.45)"; rr(x, bx - 3, by - 3, bw + 6, 18, 9); x.fill();
        const g = x.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, "#22d3ee"); g.addColorStop(.6, "#a3e635"); g.addColorStop(1, "#ef4444");
        x.fillStyle = g; rr(x, bx, by, Math.max(2, bw * S1.pw), 12, 6); x.fill();
        x.fillStyle = "#e8eefc"; x.font = "700 10px sans-serif"; x.textAlign = "center"; x.fillText("FORÇA  (mais força = menos precisão)", W / 2, by - 8);
      }
      S1.pops.forEach(p => {
        const k = p.t / 1.6, s = 1 + Math.max(0, .5 - p.t * 2.5); x.save(); x.globalAlpha = 1 - k * k; x.translate(W / 2, 118 - k * 26); x.scale(s, s);
        x.font = "900 36px sans-serif"; x.textAlign = "center"; x.lineWidth = 6; x.strokeStyle = "rgba(0,0,0,.6)"; x.strokeText(p.text, 0, 0); x.fillStyle = p.col; x.fillText(p.text, 0, 0); x.restore();
      });
      x.textAlign = "left"; o.hud && o.hud(x, S1);
    }
  };
  return core;
}

/* ───────── 1) DISPUTA DE PÊNALTIS ───────── */
const penalty = arcade({
  id: "penalty", title: "Disputa de Pênaltis", W: 480, H: 640, def: "Normal",
  hud: [["PLACAR", "0 x 0"], ["CHUTE", "1/5"], ["PONTOS", "0"]],
  diffs: { "Fácil": { noise: .7, pRead: .28, rd: .16, kv: 6, err: .9, cpu: .55 }, "Normal": { noise: 1, pRead: .45, rd: .12, kv: 7.2, err: .6, cpu: .7 }, "Difícil": { noise: 1.25, pRead: .6, rd: .08, kv: 8.5, err: .35, cpu: .82 } },
  instr: ["5 cobranças para cada lado contra o goleiro da IA. Empatou? Vai para a morte súbita.",
    "Mouse/toque: clique no ponto do gol, segure para carregar a força e solte para chutar. Teclado: setas para mirar, Espaço para chutar.",
    "Quanto mais força, mais rápida a bola — e menos precisa. Cantos e ângulos valem pontos extras; sequência de gols também."],
  create(api) {
    const D = api.D; let u = 0, c = 0, n = 0, score = 0, streak = 0, uh = [], ch = [], sudden = false;
    const K = { x: 0, y: .95, tx: 0, ty: .95, go: false, wait: 0, lean: 0 };
    const hudAll = () => { api.hud(0, u + " x " + c); api.hud(1, sudden ? "MS" : Math.min(n + 1, 5) + "/5"); api.hud(2, score); };
    const core = shotCore(api, {
      delay: 1.2,
      onShoot(sh) {
        K.go = true; K.wait = D.rd;
        if (Math.random() < D.pRead) { K.tx = sh.arr.x + gauss() * D.err; K.ty = sh.arr.y + gauss() * D.err * .6; }
        else { K.tx = (Math.random() < .5 ? -1 : 1) * rnd(.8, 3.2); K.ty = rnd(.6, 1.9); }
        K.tx = clamp(K.tx, -3.5, 3.5); K.ty = clamp(K.ty, .8, 1.7);
      },
      tick(dt) {
        if (!K.go) return; K.wait -= dt; if (K.wait > 0) return;
        const m = D.kv * dt; K.x += clamp(K.tx - K.x, -m, m); K.y += clamp(K.ty - K.y, -m * .6, m * .6); K.lean = clamp(K.x / 3, -1, 1) * 1.15;
      },
      sub(b, h, st) { // defesa: bola dentro da "área de alcance" do goleiro ao chegar na linha
        if (b.chk || b.z < st.zg - .4) return; b.chk = true;
        if (b.vz > 0 && ((b.x - K.x) / (.85 + P.R)) ** 2 + ((b.y - K.y) / (1 + P.R)) ** 2 <= 1) {
          b.dead = true; b.vz = -Math.abs(b.vz) * .25; b.vx = (b.x - K.x) * 3 + rnd(-2, 2); b.vy = rnd(1, 4); b.ev.push("save");
        }
      },
      layer(x, cam, st) { drawKeeper(x, cam, K.x, K.y, K.lean, st.zg); },
      onDone(r) {
        let add = 0;
        if (r.goal) {
          u++; streak++; add = 100; const ax = Math.abs(r.cross.x), ay = r.cross.y;
          if (ax > 2.6 && ay > 1.5) add += 60; else if (ax > 2.6 || ay > 1.8) add += 30;
          add += Math.min(streak - 1, 3) * 20;
        } else streak = 0;
        score += add; uh.push(r.goal);
        const cg = Math.random() < D.cpu; if (cg) c++; ch.push(cg); n++;
        api.msg(`${r.goal ? "Gol! +" + add + " pts." : r.saved ? "Defendeu o goleiro." : "Perdeu o pênalti."} CPU ${cg ? "converteu" : "perdeu"}.`);
        hudAll();
        let over = false; const rem = 5 - n;
        if (n <= 5) { if (Math.abs(u - c) > rem || (n === 5 && u !== c)) over = true; else if (n === 5) sudden = true; }
        else if (u !== c || n >= 15) over = true;
        if (over) {
          const res = u > c ? "win" : u < c ? "loss" : "draw", total = score + (res === "win" ? 200 : res === "draw" ? 60 : 0);
          core.S.tm = 1.6; core.S.fin = () => api.finish(total, res, { title: res === "win" ? "VITÓRIA!" : res === "draw" ? "EMPATE" : "DERROTA", lines: [`Placar final: ${u} x ${c}`, res === "win" ? "Bônus de vitória: +200" : res === "draw" ? "Bônus de empate: +60" : "Sem bônus de vitória"] });
        }
      },
      next() { if (core.S.fin) { core.S.fin(); return; } K.x = 0; K.y = .95; K.go = false; K.lean = 0; core.newShot(11); hudAll(); }
    });
    const pips = (x, label, arr, px, py) => {
      x.font = "700 10px sans-serif"; x.fillStyle = "#cbd5e1"; x.textAlign = "left"; x.fillText(label, px, py - 8);
      for (let i = 0; i < Math.max(5, arr.length); i++) { x.beginPath(); x.arc(px + 8 + i * 20, py + 4, 7, 0, 7); x.fillStyle = i < arr.length ? (arr[i] ? "#4ade80" : "#f87171") : "rgba(148,163,184,.35)"; x.fill(); }
    };
    return {
      start() { core.S.fin = null; core.newShot(11); hudAll(); },
      update: core.update, ptr: core.ptr, key: core.key, idle() { core.newShot(11); },
      draw() { core.draw(); pips(api.ctx, "VOCÊ", uh, 14, 28); pips(api.ctx, "CPU", ch, api.W - 128, 28); }
    };
  }
});

/* ───────── 2) SEJA O GOLEIRO ───────── */
const GZ = 16;
const goalie = arcade({
  id: "goalkeeper", title: "Seja o Goleiro", W: 480, H: 640, def: "Normal",
  hud: [["DEFESAS", "0"], ["VIDAS", "❤❤❤"], ["PONTOS", "0"]],
  diffs: { "Fácil": { kv: 11, sp: .85, curve: .3, hint: 1 }, "Normal": { kv: 9, sp: 1, curve: .6, hint: 0 }, "Difícil": { kv: 8, sp: 1.15, curve: 1, hint: 0 } },
  instr: ["Defenda 12 chutes de atacantes em posições e velocidades diferentes. Você perde uma vida a cada gol; com 3 gols sofridos, acabou.",
    "Mouse/toque: arraste para mover o goleiro (ele salta até o ponto). Teclado: setas.",
    "Observe o batedor e antecipe o canto. Os chutes ficam mais fortes e alguns fazem curva. Defesas difíceis (cantos) valem bônus."],
  create(api) {
    const D = api.D, x = api.ctx, W = api.W, H = api.H, cam = makeCam(GZ, "goalie"), keys = {};
    const K = { x: 0, y: .95, tx: 0, ty: .95, lean: 0 };
    let tm0 = 1, ph = "idle", round = 0, lives = 3, saves = 0, score = 0, ball = null, shot = null, wind = 0, tm = 0, endT = null, trail = [], pops = [], t = 0;
    const pop = (text, col) => pops.push({ t: 0, text, col });
    const hudAll = () => { api.hud(0, saves); api.hud(1, "❤".repeat(Math.max(0, lives)) || "—"); api.hud(2, score); };
    function newShot() {
      round++; const x0 = rnd(-9, 9), sp = Math.min(34, (17 + round * .9) * D.sp * rnd(.92, 1.08)), miss = Math.random() < .12;
      const tg = miss ? { x: (Math.random() < .5 ? -1 : 1) * rnd(4, 5.6), y: rnd(.4, 2) } : { x: rnd(-3.3, 3.3), y: Math.random() < .55 ? rnd(.2, 1) : rnd(1.2, 2.25) };
      const wy = Math.random() < D.curve * .6 ? rnd(-45, 45) : 0, v = P.solve({ x: x0, y: P.R, z: 0 }, tg, sp, { wx: 0, wy }, { zg: GZ });
      shot = { x0, tg, v, wy, wind: 0 }; ball = P.ball(x0, P.R, 0, 0, 0, 0); ph = "wait"; tm = rnd(.9, 1.4); tm0 = tm; endT = null; trail = [];
      api.msg(`Chute ${round}/12 — prepare-se!`);
    }
    const aimTo = (px, py) => { const [wx, wy] = unproj(cam, px, py, GZ); K.tx = clamp(wx, -3.4, 3.4); K.ty = clamp(wy, .6, 1.8); };
    function end1() {
      ph = "done"; tm = 1.1;
      if (lives <= 0 || round >= 12) {
        const win = lives > 0, total = score + (win ? lives * 50 : 0);
        api.finish(total, win ? "win" : "loss", { title: win ? "VOCÊ SEGUROU O GOL!" : "FIM DE JOGO", lines: [`Defesas: ${saves}`, `Chutes enfrentados: ${round}/12`, win ? `Bônus por vidas restantes: +${lives * 50}` : "Você sofreu 3 gols"] });
      }
    }
    return {
      start() { round = 0; lives = 3; saves = 0; score = 0; K.x = 0; K.y = .95; K.tx = 0; K.ty = .95; pops = []; hudAll(); newShot(); },
      ptr(type, px, py) { if (type === "down" || type === "move") aimTo(px, py); },
      key(e, down) { if (e.key.startsWith("Arrow")) { keys[e.key] = down; return true; } return false; },
      update(dt) {
        t += dt; pops.forEach(p => { p.t += dt; }); pops = pops.filter(p => p.t < 1.5);
        K.tx = clamp(K.tx + ((keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0)) * 7 * dt, -3.4, 3.4); K.ty = clamp(K.ty + ((keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0)) * 5 * dt, .6, 1.8);
        const m = D.kv * dt, ox = K.x; K.x += clamp(K.tx - K.x, -m, m); K.y += clamp(K.ty - K.y, -m * .6, m * .6); K.lean = clamp(-(K.tx - K.x) / 2, -.5, .5) * 1.6 + (K.x - ox) / Math.max(dt, 1e-3) / 40;
        if (ph === "wait") { tm -= dt; if (tm <= 0) { ball = P.ball(shot.x0, P.R, 0, shot.v.vx, shot.v.vy, shot.v.vz, 0, shot.wy); ph = "fly"; api.sfx(150, .14, "triangle", .35, -90); api.msg(""); } }
        else if (ph === "fly") {
          const env = { zg: GZ }, n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
          for (let i = 0; i < n; i++) {
            P.step(ball, h, env);
            if (!ball.chk && ball.z >= GZ - .4) { // ponto de defesa
              ball.chk = true;
              if (ball.vz > 0 && ((ball.x - K.x) / (.85 + P.R)) ** 2 + ((ball.y - K.y) / (1 + P.R)) ** 2 <= 1) {
                ball.dead = true; ball.vz = -Math.abs(ball.vz) * .25; ball.vx = (ball.x - K.x) * 3 + rnd(-2, 2); ball.vy = rnd(1, 4); ball.ev.push("save");
                saves++; const hard = Math.abs(shot.tg.x) * 14 + Math.abs(shot.tg.y - 1) * 18 + Math.abs(shot.v.vz) * .8, add = 100 + Math.round(hard); score += add; hudAll(); pop("DEFENDEU! +" + add, "#38bdf8");
              }
            }
          }
          ball.ev.splice(0).forEach(ev => {
            if (ev === "goal") { lives--; pop("GOL SOFRIDO", "#f87171"); sfx(160, .35, "sawtooth", .2, -90); hudAll(); endT = endT ?? 1; }
            else if (ev === "save") { sfx(220, .18, "sawtooth", .2, -80); endT = endT ?? 1; }
            else if (ev === "out") { if (!ball.bars && !ball.posts) pop("PRA FORA", "#cbd5e1"); endT = endT ?? .8; }
            else if (ev === "bar") pop("NO TRAVESSÃO!", "#fde047"); else if (ev === "post") pop("NA TRAVE!", "#fbbf24");
          });
          trail.push({ x: ball.x, y: ball.y, z: ball.z }); if (trail.length > 7) trail.shift();
          if (endT == null && (ball.t > 5 || ball.z < -3 || (ball.t > .4 && ball.y < P.R + .02 && Math.hypot(ball.vx, ball.vz) < .6))) endT = .2;
          if (endT != null) { endT -= dt; if (endT <= 0) end1(); }
        } else if (ph === "done") { tm -= dt; if (tm <= 0 && api.state === "run") newShot(); }
      },
      draw() {
        drawField(x, cam, GZ, W, H);
        if (shot) { // batedor e dica (modo Fácil)
          const phase = ph === "wait" ? 1 - tm / Math.max(tm0, .1) : 1; drawPlayer(x, cam, shot.x0, -.9, phase);
          if (ph === "wait" && D.hint) { const p = proj(cam, shot.tg.x, shot.tg.y, GZ); if (p) { x.strokeStyle = "rgba(253,224,71,.5)"; x.lineWidth = 3; x.beginPath(); x.arc(p[0], p[1], 14, 0, 7); x.stroke(); } }
        }
        if (ball) drawBall(x, cam, ball, ph === "fly" ? trail : null, 6);
        drawKeeper(x, cam, K.x, K.y, -K.lean, GZ, "#38bdf8");
        drawGoal(x, cam, GZ, { alpha: .8 });
        pops.forEach(p => { const k = p.t / 1.5; x.save(); x.globalAlpha = 1 - k * k; x.translate(W / 2, 120 - k * 24); x.font = "900 30px sans-serif"; x.textAlign = "center"; x.lineWidth = 6; x.strokeStyle = "rgba(0,0,0,.6)"; x.strokeText(p.text, 0, 0); x.fillStyle = p.col; x.fillText(p.text, 0, 0); x.restore(); });
        x.textAlign = "left";
      }
    };
  }
});

/* ───────── 3) MIRA CERTA ───────── */
const mira = arcade({
  id: "aim", title: "Mira Certa", W: 480, H: 640, def: "Normal",
  hud: [["PONTOS", "0"], ["CHUTES", "10"], ["VENTO", "0"]],
  diffs: { "Fácil": { noise: .7, rs: 1.35, wind: 2, shots: 12 }, "Normal": { noise: 1, rs: 1, wind: 5, shots: 10 }, "Difícil": { noise: 1.2, rs: .78, wind: 8, shots: 8 } },
  instr: ["Acerte os alvos pendurados no gol. Cantos de cima valem mais (100), o centro baixo menos (40).",
    "Acertos seguidos multiplicam os pontos. Limpou todos os alvos? +250 de bônus, +2 chutes e alvos menores.",
    "O vento lateral desvia a bola — compense na mira! Controles: clique/toque no alvo, segure para dar força e solte. Setas + Espaço no teclado."],
  create(api) {
    const D = api.D; let score = 0, left = D.shots, level = 0, streak = 0, hits = 0, targets = [], wind = 0, flash = [];
    const mk = () => { const k = Math.pow(.86, level) * D.rs; return [[-3, 2, .34, 100], [3, 2, .34, 100], [-3, .55, .38, 60], [3, .55, .38, 60], [0, 2, .4, 70], [0, .6, .46, 40]].map(([a, b, r, v]) => ({ x: a, y: b, r: r * k, v, hit: false })); };
    const hudAll = () => { api.hud(0, score); api.hud(1, left); api.hud(2, (wind > 0 ? "➜ " : wind < 0 ? "⬅ " : "") + Math.abs(wind).toFixed(1) + " m/s"); };
    const go = () => { wind = Math.round(rnd(-D.wind, D.wind) * 10) / 10; core.newShot(16, [wind, 0]); hudAll(); };
    const core = shotCore(api, {
      delay: 1.1,
      onDone(r) {
        let add = 0, txt = "";
        const cr = r.cross; left--;
        if (cr) { let best = null, bd = 9; targets.forEach(t => { const d = Math.hypot(cr.x - t.x, cr.y - t.y); if (!t.hit && d <= t.r + P.R && d < bd) { best = t; bd = d; } }); if (best) { best.hit = true; flash.push({ x: best.x, y: best.y, t: 0 }); add = Math.round(best.v * (1 + .25 * Math.min(streak, 4))); streak++; hits++; txt = "Alvo! +" + add; sfx(880, .12, "triangle", .2); } else streak = 0; } else streak = 0;
        if (targets.every(t => t.hit)) { add += 250; left += 2; level++; targets = mk(); txt = "LIMPOU TUDO! +250 e +2 chutes"; sfxGoal(); }
        score += add; api.msg(txt || "Errou o alvo."); hudAll();
        if (left <= 0) { core.S.tm = 1.4; core.S.fin = () => api.finish(score, hits >= 5 ? "win" : "loss", { title: "FIM DOS CHUTES", lines: [`Alvos acertados: ${hits}`, `Fases completas: ${level}`] }); }
      },
      next() { if (core.S.fin) { core.S.fin(); return; } go(); },
      layer(x, cam, st) {
        targets.forEach(t => {
          const p = proj(cam, t.x, t.y, st.zg + .05); if (!p) return; const r = t.r * p[2];
          if (t.hit) { x.strokeStyle = "rgba(255,255,255,.18)"; x.lineWidth = 2; x.setLineDash([4, 4]); x.beginPath(); x.arc(p[0], p[1], r, 0, 7); x.stroke(); x.setLineDash([]); return; }
          [[1, "#f8fafc"], [.66, "#ef4444"], [.33, "#f8fafc"]].forEach(([k, col]) => { x.fillStyle = col; x.beginPath(); x.arc(p[0], p[1], r * k, 0, 7); x.fill(); });
          x.font = "800 " + Math.max(10, r * .55) + "px sans-serif"; x.textAlign = "center"; x.lineWidth = 3; x.strokeStyle = "rgba(0,0,0,.75)"; x.strokeText(t.v, p[0], p[1] - r - 4); x.fillStyle = "#f8fafc"; x.fillText(t.v, p[0], p[1] - r - 4); x.textAlign = "left";
        });
        flash.forEach(f => { f.t += .016; const p = proj(cam, f.x, f.y, st.zg); if (p) { x.strokeStyle = `rgba(253,224,71,${1 - f.t * 1.6})`; x.lineWidth = 4; x.beginPath(); x.arc(p[0], p[1], 20 + f.t * 80, 0, 7); x.stroke(); } }); flash = flash.filter(f => f.t < .6);
      },
      hud(x) { // seta do vento
        x.font = "700 11px sans-serif"; x.fillStyle = "#cbd5e1"; x.fillText("VENTO", 14, 28); x.strokeStyle = "#22d3ee"; x.lineWidth = 3; x.beginPath();
        const L = Math.min(60, Math.abs(wind) * 8) * Math.sign(wind); x.moveTo(60, 24); x.lineTo(60 + L, 24); if (L) { x.lineTo(60 + L - Math.sign(L) * 8, 19); x.moveTo(60 + L, 24); x.lineTo(60 + L - Math.sign(L) * 8, 29); } x.stroke();
      }
    });
    return { start() { score = 0; left = D.shots; level = 0; streak = 0; hits = 0; targets = mk(); core.S.fin = null; go(); }, update: core.update, ptr: core.ptr, key: core.key, draw() { core.draw(); }, idle() { targets = mk(); core.newShot(16); } };
  }
});

/* ───────── 4) DESAFIO DO TRAVESSÃO ───────── */
const travessao = arcade({
  id: "crossbar", title: "Desafio do Travessão", W: 480, H: 640, def: "Normal",
  hud: [["TRAVESSÕES", "0"], ["CHUTE", "1/10"], ["PONTOS", "0"]],
  diffs: { "Fácil": { noise: .6, zm: .8, assist: .35 }, "Normal": { noise: .9, zm: 1, assist: .22 }, "Difícil": { noise: 1.15, zm: 1.15, assist: .08 } },
  instr: ["Acerte o travessão (a barra de cima, destacada em amarelo). São 10 chutes, cada um de mais longe.",
    "Travessão vale 100 × a distância relativa; trave vale 40. Acertos seguidos dão bônus. Travessão e depois gol: +50.",
    "Mire na barra: clique/toque, segure para dar força e solte. Força demais atrapalha a precisão. Faça 3 ou mais travessões para vencer."],
  create(api) {
    const D = api.D, ZS = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30]; let i = 0, bars = 0, score = 0, streak = 0;
    const dist = () => Math.round(ZS[Math.min(i, 9)] * D.zm);
    const hudAll = () => { api.hud(0, bars); api.hud(1, Math.min(i + 1, 10) + "/10"); api.hud(2, score); };
    const core = shotCore(api, {
      delay: 1.1, barGlow: true,
      snap(a) { if (Math.abs(a.y - 2.5) < D.assist) a.y = 2.5; }, // ímã na barra
      onDone(r) {
        let add = 0, txt = "Não acertou o travessão.";
        if (r.bars) { bars += r.bars; add = Math.round(100 * dist() / 12) * r.bars; add += Math.min(streak, 3) * 50; streak++; txt = "Travessão! +" + add; if (r.goal) { add += 50; txt += " (+50 gol)"; } }
        else if (r.posts) { add = 40; streak = 0; txt = "Na trave! +40"; } else streak = 0;
        score += add; i++; api.msg(txt); hudAll();
        if (i >= 10) { core.S.tm = 1.4; core.S.fin = () => api.finish(score, bars >= 3 ? "win" : "loss", { title: bars >= 3 ? "MESTRE DO TRAVESSÃO!" : "FIM DO DESAFIO", lines: [`Travessões acertados: ${bars}`, "Meta para vencer: 3 travessões"] }); }
      },
      next() { if (core.S.fin) { core.S.fin(); return; } core.newShot(dist()); hudAll(); },
      hud(x) { x.font = "800 13px sans-serif"; x.fillStyle = "#fde047"; x.fillText("DISTÂNCIA  " + dist() + " m", 14, 28); }
    });
    return { start() { i = 0; bars = 0; score = 0; streak = 0; core.S.fin = null; core.newShot(dist()); hudAll(); }, update: core.update, ptr: core.ptr, key: core.key, draw() { core.draw(); }, idle() { core.newShot(dist()); } };
  }
});

/* ───────── integração com o portal ───────── */
const NEW = [
  { id: "penalty", name: "Disputa de Pênaltis", desc: "Bata 5 pênaltis contra o goleiro da IA.", icon: "🥅", color: "#22c55e", tint: "#22c55e20", cat: "Futebol" },
  { id: "goalkeeper", name: "Seja o Goleiro", desc: "Defenda chutes cada vez mais fortes.", icon: "🧤", color: "#06b6d4", tint: "#06b6d420", cat: "Futebol" },
  { id: "aim", name: "Mira Certa", desc: "Acerte os alvos no gol e compense o vento.", icon: "🎯", color: "#e879f9", tint: "#e879f920", cat: "Futebol" },
  { id: "crossbar", name: "Desafio do Travessão", desc: "Acerte a barra de cada vez mais longe.", icon: "⚽", color: "#fde047", tint: "#fde04720", cat: "Futebol" }
];
const OLD = { snake: "Arcade", tetris: "Arcade", pong: "Esportes", flappy: "Arcade", tictactoe: "Estratégia", memory: "Reflexo", "2048": "Estratégia", mines: "Estratégia", breakout: "Arcade", invaders: "Ação", hangman: "Estratégia", sudoku: "Estratégia", chess: "Estratégia", checkers: "Estratégia" };
A.catalog.forEach(g => { if (OLD[g.id]) g.cat = OLD[g.id]; });
NEW.forEach(g => { if (!A.catalog.some(q => q.id === g.id)) A.catalog.push(g); });

const mine = { penalty, goalkeeper: goalie, aim: mira, crossbar: travessao }, L0 = A.launch, S0 = A.stop;
A.launch = (id, root, end) => { stopAll2(); return mine[id] ? (S0(), mine[id](root, end)) : L0(id, root, end); };
A.stop = () => { stopAll2(); S0(); };
})();
