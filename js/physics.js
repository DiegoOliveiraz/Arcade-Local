/* Arcade Local — motor de física da bola (usado pelos jogos de futebol).
   Unidades do SI: metros, segundos. Eixos: x = direita, y = altura, z = em direção ao gol.
   Modelo: gravidade + arrasto quadrático + efeito Magnus (efeito na bola) + quique com perda
   de energia + colisão esfera × cilindro nas traves e no travessão + rede. */
(function (root) {
  "use strict";
  const R = 0.11,      // raio da bola (m)
    G = 9.81,          // gravidade (m/s²)
    K = 0.0133,        // arrasto: 0,5·ρ·Cd·A/m
    MAG = 0.0063,      // coeficiente Magnus
    PR = 0.06,         // raio das traves
    GW = 7.32,         // largura interna do gol
    GH = 2.44,         // altura interna do gol
    GD = 2.2;          // profundidade da rede

  function ball(x, y, z, vx, vy, vz, wx, wy) {
    return { x, y, z, vx, vy, vz, wx: wx || 0, wy: wy || 0, t: 0, pz: z,
      goal: false, net: false, out: false, dead: false, bars: 0, posts: 0, cross: null, ev: [] };
  }

  // Avança a bola dt segundos. env = { zg: z da linha de gol, wind: [vx, vz] }.
  // free = true ignora colisões (usado para prever a trajetória).
  function step(b, dt, env, free) {
    const zg = env.zg, w = env.wind || [0, 0];
    const rx = b.vx - w[0], ry = b.vy, rz = b.vz - w[1];
    const sp = Math.sqrt(rx * rx + ry * ry + rz * rz);
    // spin wx > 0: bola "cai" (topspin); wy > 0: curva para a direita (+x)
    const ax = -K * sp * rx + MAG * b.wy * rz;
    const ay = -G - K * sp * ry - MAG * b.wx * rz;
    const az = -K * sp * rz + MAG * (b.wx * ry - b.wy * rx);
    const px = b.x, py = b.y;
    b.pz = b.z;
    b.vx += ax * dt; b.vy += ay * dt; b.vz += az * dt;
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.t += dt;
    const dc = Math.exp(-0.1 * dt); b.wx *= dc; b.wy *= dc;
    // ponto exato em que a bola cruza o plano do gol (interpolado)
    if (!b.cross && b.pz < zg && b.z >= zg) {
      const f = (zg - b.pz) / (b.z - b.pz);
      b.cross = { x: px + (b.x - px) * f, y: py + (b.y - py) * f };
    }
    if (free) return;

    if (b.net) { // rede: amortece a bola e a mantém dentro do gol
      const k = Math.exp(-5 * dt); b.vx *= k; b.vz *= k;
      const hw = GW / 2 - R;
      if (b.x > hw) { b.x = hw; b.vx *= -0.2; } if (b.x < -hw) { b.x = -hw; b.vx *= -0.2; }
      if (b.z > zg + GD - R) { b.z = zg + GD - R; b.vz *= -0.15; }
      if (b.y > GH - R) { b.y = GH - R; b.vy *= -0.2; }
    }
    if (b.y < R && b.vy <= 0) { // chão
      b.y = R;
      if (b.vy < -1.2) { b.vy *= -0.62; b.vx *= 0.85; b.vz *= 0.85; b.wx *= 0.7; b.wy *= 0.7; b.ev.push("bounce"); }
      else { b.vy = 0; const f = Math.exp(-0.7 * dt); b.vx *= f; b.vz *= f; }
    }
    if (!b.net) { // traves e travessão (cilindros de raio PR)
      const hw = GW / 2 + PR;
      const hit = (cx, cy, cz, nx, ny, nz, kind) => {
        const vn = b.vx * nx + b.vy * ny + b.vz * nz;
        if (vn >= 0) return;
        const k = 1.62 * vn; // restituição 0,62
        b.vx -= k * nx; b.vy -= k * ny; b.vz -= k * nz;
        const d = R + PR + 0.002; b.x = cx + nx * d; b.y = cy + ny * d; b.z = cz + nz * d;
        if (-vn > 1.2) { if (kind === "bar") b.bars++; else b.posts++; b.ev.push(kind); }
        b.wx *= 0.5; b.wy *= 0.5;
      };
      for (const s of [-1, 1]) {
        const dx = b.x - s * hw, dz = b.z - zg, d = Math.hypot(dx, dz);
        if (d < R + PR && d > 1e-6 && b.y < GH + PR * 2) hit(s * hw, b.y, zg, dx / d, 0, dz / d, "post");
      }
      if (Math.abs(b.x) < hw) {
        const dy = b.y - (GH + PR), dz = b.z - zg, d = Math.hypot(dy, dz);
        if (d < R + PR && d > 1e-6) hit(b.x, GH + PR, zg, 0, dy / d, dz / d, "bar");
      }
    }
    // gol ou fora (avaliado no cruzamento da linha)
    if (!b.goal && !b.out && !b.dead && b.pz < zg && b.z >= zg && b.cross) {
      if (Math.abs(b.cross.x) < GW / 2 && b.cross.y > 0 && b.cross.y < GH) { b.goal = true; b.net = true; b.ev.push("goal"); }
      else { b.out = true; b.ev.push("out"); }
    }
  }

  // Simula sem colisões até a linha de gol; devolve onde (x, y) e quando (t) a bola chega.
  function arrival(b0, env) {
    const b = ball(b0.x, b0.y, b0.z, b0.vx, b0.vy, b0.vz, b0.wx, b0.wy);
    for (let i = 0; i < 3000 && b.z < env.zg; i++) step(b, 1 / 240, env, true);
    return { x: b.cross ? b.cross.x : b.x, y: b.cross ? b.cross.y : b.y, t: b.t };
  }

  // Calcula a velocidade inicial para a bola passar pelo ponto `target` do plano do gol
  // (sem vento), com a velocidade frontal `speed` e o efeito `spin`.
  function solve(from, target, speed, spin, env) {
    const e0 = { zg: env.zg }; let tx = target.x, ty = target.y, v;
    for (let i = 0; i < 8; i++) {
      const t = (env.zg - from.z) / (speed * 0.93);
      v = { vx: (tx - from.x) / t, vy: (ty - from.y + 0.5 * G * t * t) / t, vz: speed };
      const a = arrival(ball(from.x, from.y, from.z, v.vx, v.vy, v.vz, spin && spin.wx, spin && spin.wy), e0);
      const ex = target.x - a.x, ey = target.y - a.y;
      if (Math.abs(ex) < 0.01 && Math.abs(ey) < 0.01) break;
      tx += ex; ty += ey;
    }
    return v;
  }

  root.ArcadePhysics = { R, G, K, PR, GW, GH, GD, ball, step, arrival, solve };
  if (typeof module !== "undefined") module.exports = root.ArcadePhysics;
})(typeof window !== "undefined" ? window : globalThis);
